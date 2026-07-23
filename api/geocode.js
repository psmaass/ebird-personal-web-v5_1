'use strict';

const CACHE_LIMIT = 800;
const cache = new Map();
const SIMBIO_BASE = 'https://arcgis.mma.gob.cl/server/rest/services/SIMBIO/SIMBIO_DIVISION_ADMINISTRATIVA/MapServer';

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

function normalize(value = '') {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function isGenericRegion(region, country, countryCode) {
  const r = normalize(region);
  if (!r) return true;
  return r === normalize(country) || r === normalize(countryCode) || ['chile', 'argentina', 'peru', 'brasil', 'brazil'].includes(r);
}

function wait(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

function toRad(value) { return Number(value) * Math.PI / 180; }
function haversineKm(aLat, aLng, bLat, bLng) {
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const lat1 = toRad(aLat);
  const lat2 = toRad(bLat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function planarPointSegmentKm(lat, lng, lat1, lng1, lat2, lng2) {
  const meanLat = toRad((lat + lat1 + lat2) / 3);
  const scaleX = 111.32 * Math.cos(meanLat);
  const scaleY = 110.57;
  const px = lng * scaleX;
  const py = lat * scaleY;
  const ax = lng1 * scaleX;
  const ay = lat1 * scaleY;
  const bx = lng2 * scaleX;
  const by = lat2 * scaleY;
  const dx = bx - ax;
  const dy = by - ay;
  const denom = dx * dx + dy * dy;
  const t = denom ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / denom)) : 0;
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

function geometryDistanceKm(lat, lng, geometry) {
  const rings = geometry?.rings || [];
  let best = Infinity;
  for (const ring of rings) {
    for (let i = 0; i < ring.length - 1; i++) {
      const [lng1, lat1] = ring[i];
      const [lng2, lat2] = ring[i + 1];
      if (![lng1, lat1, lng2, lat2].every(Number.isFinite)) continue;
      best = Math.min(best, planarPointSegmentKm(lat, lng, lat1, lng1, lat2, lng2));
    }
  }
  return best;
}

async function fetchJson(url, headers = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 22000);
  try {
    const response = await fetch(url, { headers, signal: controller.signal });
    let payload;
    try { payload = await response.json(); } catch { payload = null; }
    if (!response.ok || !payload) {
      const error = new Error(payload?.error?.message || payload?.error || `Error HTTP ${response.status}.`);
      error.statusCode = response.status >= 400 ? response.status : 502;
      throw error;
    }
    return payload;
  } finally {
    clearTimeout(timer);
  }
}

async function querySimbioCommunes(lat, lng, distanceKm = 0) {
  const geometry = JSON.stringify({ x: lng, y: lat, spatialReference: { wkid: 4326 } });
  const params = new URLSearchParams({
    f: 'json',
    where: '1=1',
    geometry,
    geometryType: 'esriGeometryPoint',
    inSR: '4326',
    outSR: '4326',
    spatialRel: 'esriSpatialRelIntersects',
    outFields: 'CUT_REG,CUT_PROV,CUT_COM,REGION,PROVINCIA,COMUNA,COSTERA,Xlong,YLat',
    returnGeometry: distanceKm ? 'true' : 'false',
    geometryPrecision: '5',
  });
  if (distanceKm) {
    params.set('distance', String(distanceKm));
    params.set('units', 'esriSRUnit_Kilometer');
    params.set('maxAllowableOffset', '0.001');
  }
  const payload = await fetchJson(`${SIMBIO_BASE}/2/query?${params}`);
  return Array.isArray(payload.features) ? payload.features : [];
}

function simbioResult(feature, lat, lng, mode = 'polygon') {
  const a = feature?.attributes || {};
  let distanceKm = 0;
  if (mode !== 'polygon') {
    distanceKm = geometryDistanceKm(lat, lng, feature?.geometry);
    if (!Number.isFinite(distanceKm)) {
      distanceKm = haversineKm(lat, lng, Number(a.YLat), Number(a.Xlong));
    }
  }
  const confidence = mode === 'polygon'
    ? 99
    : Math.max(62, Math.min(92, Math.round(92 - Math.min(distanceKm, 120) * 0.25)));
  return {
    region: String(a.REGION || '').trim(),
    regionCode: String(a.CUT_REG || '').trim(),
    province: String(a.PROVINCIA || '').trim(),
    commune: String(a.COMUNA || '').trim(),
    communeCode: String(a.CUT_COM || '').trim(),
    country: 'Chile',
    countryCode: 'CL',
    displayName: [a.COMUNA, a.PROVINCIA, a.REGION, 'Chile'].filter(Boolean).join(', '),
    provider: mode === 'polygon' ? 'SIMBIO MMA · polígono oficial' : 'SIMBIO MMA · comuna costera más cercana',
    territorySource: mode === 'polygon' ? 'simbio_polygon' : 'simbio_nearest_coast',
    territoryConfidence: confidence,
    territoryDistanceKm: Number.isFinite(distanceKm) ? Number(distanceKm.toFixed(1)) : null,
    offshore: mode !== 'polygon',
  };
}

async function querySimbio(lat, lng) {
  try {
    const exact = await querySimbioCommunes(lat, lng, 0);
    if (exact.length) return simbioResult(exact[0], lat, lng, 'polygon');

    for (const distanceKm of [25, 75, 150, 250]) {
      const nearby = await querySimbioCommunes(lat, lng, distanceKm);
      if (!nearby.length) continue;
      const ranked = nearby
        .map(feature => {
          const a = feature.attributes || {};
          const boundaryKm = geometryDistanceKm(lat, lng, feature.geometry);
          const centroidKm = haversineKm(lat, lng, Number(a.YLat), Number(a.Xlong));
          const distance = Number.isFinite(boundaryKm) ? boundaryKm : centroidKm;
          const coastalPenalty = Number(a.COSTERA) === 1 ? 0 : 35;
          return { feature, distance, score: distance + coastalPenalty };
        })
        .sort((a, b) => a.score - b.score);
      if (ranked.length) return simbioResult(ranked[0].feature, lat, lng, 'nearest');
    }
  } catch {
    // Nominatim queda como respaldo para no bloquear la aplicación.
  }
  return null;
}

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
  return fetchJson(`https://nominatim.openstreetmap.org/reverse?${params}`, {
    Accept: 'application/json',
    'User-Agent': 'Mi-eBird-Personal/6.0 (personal birding route planner)',
  });
}

function extractTerritory(payload, zoom) {
  const address = payload?.address || {};
  const broadName = String(payload?.namedetails?.name || payload?.name || '').trim();
  let region = first(address, ['state', 'region', 'state_district']) || (zoom <= 6 ? broadName : '');
  const country = first(address, ['country']);
  const countryCode = String(address.country_code || '').toUpperCase();
  if (isGenericRegion(region, country, countryCode)) region = '';
  const commune = first(address, ['municipality', 'county', 'city_district', 'district', 'city', 'town', 'village']) || (zoom >= 8 ? broadName : '');
  return {
    region,
    regionCode: String(address['ISO3166-2-lvl4'] || address['ISO3166-2-lvl3'] || '').trim(),
    commune,
    communeCode: '',
    country,
    countryCode,
    displayName: String(payload?.display_name || ''),
    provider: 'Nominatim / OpenStreetMap',
    territorySource: 'nominatim',
    territoryConfidence: region && commune ? 82 : region ? 70 : 0,
    territoryDistanceKm: null,
    offshore: false,
  };
}

function mergeTerritory(base, addition) {
  const incomingConfidence = Number(addition.territoryConfidence || 0);
  const baseConfidence = Number(base.territoryConfidence || 0);
  const preferIncoming = incomingConfidence > baseConfidence;
  return {
    region: preferIncoming ? (addition.region || base.region || '') : (base.region || addition.region || ''),
    regionCode: preferIncoming ? (addition.regionCode || base.regionCode || '') : (base.regionCode || addition.regionCode || ''),
    commune: preferIncoming ? (addition.commune || base.commune || '') : (base.commune || addition.commune || ''),
    communeCode: preferIncoming ? (addition.communeCode || base.communeCode || '') : (base.communeCode || addition.communeCode || ''),
    province: preferIncoming ? (addition.province || base.province || '') : (base.province || addition.province || ''),
    country: base.country || addition.country || '',
    countryCode: base.countryCode || addition.countryCode || '',
    displayName: preferIncoming ? (addition.displayName || base.displayName || '') : (base.displayName || addition.displayName || ''),
    provider: preferIncoming ? (addition.provider || base.provider || '') : (base.provider || addition.provider || ''),
    territorySource: preferIncoming ? (addition.territorySource || base.territorySource || '') : (base.territorySource || addition.territorySource || ''),
    territoryConfidence: Math.max(baseConfidence, incomingConfidence),
    territoryDistanceKm: preferIncoming ? addition.territoryDistanceKm : base.territoryDistanceKm,
    offshore: preferIncoming ? Boolean(addition.offshore) : Boolean(base.offshore),
  };
}

async function fetchGeocode(query = {}) {
  const lat = boundedNumber(query.lat, -90, 90, 'Latitud');
  const lng = boundedNumber(query.lng, -180, 180, 'Longitud');
  const key = `v6|${lat.toFixed(4)},${lng.toFixed(4)}`;
  const cached = cacheGet(key);
  if (cached) return cached;

  let result = {
    region: '', regionCode: '', commune: '', communeCode: '', province: '', country: '', countryCode: '',
    displayName: '', provider: '', territorySource: '', territoryConfidence: 0, territoryDistanceKm: null, offshore: false,
  };

  // SIMBIO es la fuente principal para Chile, incluyendo puntos pelágicos cercanos a la costa.
  const officialChile = await querySimbio(lat, lng);
  if (officialChile?.region) result = mergeTerritory(result, officialChile);

  // Nominatim aporta cobertura global y funciona como respaldo o complemento de comuna.
  let lastError = null;
  for (const zoom of [12, 8, 5]) {
    try {
      const payload = await queryNominatim(lat, lng, zoom);
      result = mergeTerritory(result, extractTerritory(payload, zoom));
      if (result.region && result.commune && Number(result.territoryConfidence) >= 80) break;
      await wait(1050);
    } catch (error) {
      lastError = error;
      await wait(1050);
    }
  }

  if (!result.region || isGenericRegion(result.region, result.country, result.countryCode)) {
    const error = new Error(lastError?.message || 'No fue posible determinar una región administrativa confiable para las coordenadas.');
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
