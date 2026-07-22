'use strict';

const CACHE_LIMIT = 500;
const cache = new Map();

function boundedNumber(value, min, max, label) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < min || number > max) {
    const error = new Error(`${label} inválida.`);
    error.statusCode = 400;
    throw error;
  }
  return number;
}

function cacheGet(key) {
  if (!cache.has(key)) return null;
  const value = cache.get(key);
  cache.delete(key);
  cache.set(key, value);
  return value;
}

function cacheSet(key, value) {
  cache.set(key, value);
  while (cache.size > CACHE_LIMIT) cache.delete(cache.keys().next().value);
}

function first(address, keys) {
  for (const key of keys) {
    const value = String(address?.[key] || '').trim();
    if (value) return value;
  }
  return '';
}

function wait(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function queryNominatim(lat, lng, zoom) {
  const params = new URLSearchParams({
    format: 'jsonv2',
    lat: String(lat),
    lon: String(lng),
    zoom: String(zoom),
    addressdetails: '1',
    namedetails: '1',
    'accept-language': 'es',
  });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  let response;
  try {
    response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params}`, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'Mi-eBird-Personal/5.7 (personal birding route planner)',
      },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }

  let payload;
  try { payload = await response.json(); } catch { payload = null; }
  if (!response.ok || !payload) {
    const error = new Error(payload?.error || `Error de geocodificación HTTP ${response.status}.`);
    error.statusCode = response.status >= 400 ? response.status : 502;
    throw error;
  }
  return payload;
}

function extractTerritory(payload, zoom) {
  const address = payload?.address || {};
  const broadName = String(payload?.namedetails?.name || payload?.name || '').trim();
  const region = first(address, ['state', 'region', 'state_district']) || (zoom <= 6 ? broadName : '');
  const commune = first(address, ['municipality', 'county', 'city_district', 'district', 'city', 'town', 'village']) || (zoom >= 8 ? broadName : '');
  return {
    region,
    regionCode: String(address['ISO3166-2-lvl4'] || address['ISO3166-2-lvl3'] || '').trim(),
    commune,
    communeCode: '',
    country: first(address, ['country']),
    countryCode: String(address.country_code || '').toUpperCase(),
    displayName: String(payload?.display_name || ''),
  };
}

function mergeTerritory(base, addition) {
  return {
    region: base.region || addition.region || '',
    regionCode: base.regionCode || addition.regionCode || '',
    commune: base.commune || addition.commune || '',
    communeCode: base.communeCode || addition.communeCode || '',
    country: base.country || addition.country || '',
    countryCode: base.countryCode || addition.countryCode || '',
    displayName: base.displayName || addition.displayName || '',
    provider: 'Nominatim / OpenStreetMap',
  };
}

async function fetchGeocode(query = {}) {
  const lat = boundedNumber(query.lat, -90, 90, 'Latitud');
  const lng = boundedNumber(query.lng, -180, 180, 'Longitud');
  const key = `${lat.toFixed(4)},${lng.toFixed(4)}`;
  const cached = cacheGet(key);
  if (cached) return cached;

  let result = { region: '', regionCode: '', commune: '', communeCode: '', country: '', countryCode: '', displayName: '', provider: 'Nominatim / OpenStreetMap' };
  let lastError = null;

  // Primero busca el detalle local. Si falta región, amplía obligatoriamente la escala administrativa.
  for (const zoom of [12, 8, 5]) {
    try {
      const payload = await queryNominatim(lat, lng, zoom);
      result = mergeTerritory(result, extractTerritory(payload, zoom));
      if (result.region && result.commune) break;
      await wait(1100);
    } catch (error) {
      lastError = error;
      await wait(1100);
    }
  }

  if (!result.region) {
    const error = new Error(lastError?.message || 'No fue posible determinar una región para las coordenadas.');
    error.statusCode = lastError?.statusCode || 422;
    throw error;
  }

  cacheSet(key, result);
  return result;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Método no permitido.' });
  }
  try {
    const result = await fetchGeocode(req.query || {});
    res.setHeader('Cache-Control', 's-maxage=2592000, stale-while-revalidate=31536000');
    return res.status(200).json(result);
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message || 'Error inesperado.' });
  }
};
