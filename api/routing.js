'use strict';

const CONFIGURED_BASE = String(process.env.OSRM_BASE_URL || '').trim().replace(/\/$/, '');
const OSRM_BASES = CONFIGURED_BASE
  ? [CONFIGURED_BASE]
  : ['https://routing.openstreetmap.de/routed-car', 'https://router.project-osrm.org'];
const MAX_POINTS = 45;
const CACHE_LIMIT = 120;
const cache = new Map();

function boundedNumber(value, min, max) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) throw new Error('Coordenada inválida.');
  return parsed;
}

function parsePoints(raw) {
  const points = String(raw || '').split('|').map(item => item.trim()).filter(Boolean).map(item => {
    const [lngRaw, latRaw] = item.split(',');
    return {
      lng: boundedNumber(lngRaw, -180, 180),
      lat: boundedNumber(latRaw, -90, 90),
    };
  });
  if (points.length < 2) throw new Error('Se requieren al menos dos puntos para calcular una ruta.');
  if (points.length > MAX_POINTS) throw new Error(`La consulta admite un máximo de ${MAX_POINTS} puntos.`);
  return points;
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

async function requestOne(url) {
  const cached = cacheGet(url);
  if (cached) return cached;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);
  let response;
  try {
    response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'AvistamientosChile-eBird/3.4 (personal local application)',
      },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
  let payload;
  try { payload = await response.json(); } catch { payload = null; }
  if (!response.ok || !payload || payload.code !== 'Ok') {
    const error = new Error(payload?.message || `Error de rutas HTTP ${response.status}.`);
    error.statusCode = response.status >= 400 ? response.status : 502;
    throw error;
  }
  cacheSet(url, payload);
  return payload;
}

async function requestWithFallback(pathAndQuery) {
  const errors = [];
  for (const base of OSRM_BASES) {
    try {
      return await requestOne(`${base}${pathAndQuery}`);
    } catch (error) {
      errors.push(error.message || String(error));
    }
  }
  const error = new Error(`No fue posible conectar con el servicio de rutas. ${errors.join(' | ')}`);
  error.statusCode = 502;
  throw error;
}

async function fetchRouting(query = {}) {
  const action = String(query.action || '').trim();
  const points = parsePoints(query.points);
  const coordinates = points.map(point => `${point.lng.toFixed(6)},${point.lat.toFixed(6)}`).join(';');

  if (action === 'table') {
    const payload = await requestWithFallback(`/table/v1/driving/${coordinates}?annotations=distance,duration`);
    return {
      code: payload.code,
      distances: payload.distances || [],
      durations: payload.durations || [],
      sources: payload.sources || [],
      destinations: payload.destinations || [],
      provider: 'OSRM / OpenStreetMap',
    };
  }

  if (action === 'route') {
    const payload = await requestWithFallback(`/route/v1/driving/${coordinates}?overview=full&geometries=geojson&steps=false&continue_straight=false`);
    const route = Array.isArray(payload.routes) ? payload.routes[0] : null;
    if (!route) throw new Error('No se encontró una ruta terrestre entre los puntos seleccionados.');
    return {
      code: payload.code,
      distance: route.distance,
      duration: route.duration,
      geometry: route.geometry,
      legs: (route.legs || []).map(leg => ({ distance: leg.distance, duration: leg.duration })),
      waypoints: payload.waypoints || [],
      provider: 'OSRM / OpenStreetMap',
    };
  }

  throw new Error('Acción de rutas no permitida.');
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Método no permitido.' });
  }
  try {
    const payload = await fetchRouting(req.query || {});
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800');
    return res.status(200).json(payload);
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      error: error.message || 'Error inesperado.',
      details: error.details || undefined,
    });
  }
};
