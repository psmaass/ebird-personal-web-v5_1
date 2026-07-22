'use strict';

const OPEN_METEO_GEOCODING = 'https://geocoding-api.open-meteo.com/v1/search';

function cleanText(value, max = 120) {
  return String(value || '').trim().slice(0, max);
}

async function searchPlaces(query = {}) {
  const name = cleanText(query.name || query.q);
  if (name.length < 2) {
    const error = new Error('Escribe al menos dos caracteres para buscar una ciudad o aeropuerto.');
    error.statusCode = 400;
    throw error;
  }
  const count = Math.min(20, Math.max(1, Number(query.count || 10)));
  const language = cleanText(query.language || 'es', 8) || 'es';
  const countryCode = cleanText(query.countryCode || query.country, 2).toUpperCase();
  const url = new URL(OPEN_METEO_GEOCODING);
  url.searchParams.set('name', name);
  url.searchParams.set('count', String(count));
  url.searchParams.set('language', language);
  url.searchParams.set('format', 'json');
  if (/^[A-Z]{2}$/.test(countryCode)) url.searchParams.set('countryCode', countryCode);

  const response = await fetch(url, { headers: { accept: 'application/json' } });
  const text = await response.text();
  let payload;
  try { payload = text ? JSON.parse(text) : null; } catch { payload = null; }
  if (!response.ok) {
    const error = new Error(payload?.reason || payload?.error || `El buscador geográfico respondió HTTP ${response.status}.`);
    error.statusCode = response.status;
    throw error;
  }
  const rows = Array.isArray(payload?.results) ? payload.results : [];
  return rows.map(row => ({
    id: Number(row.id || 0),
    name: String(row.name || ''),
    admin1: String(row.admin1 || ''),
    admin2: String(row.admin2 || ''),
    country: String(row.country || ''),
    countryCode: String(row.country_code || '').toUpperCase(),
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    timezone: String(row.timezone || ''),
    elevation: Number(row.elevation || 0),
    featureCode: String(row.feature_code || ''),
  })).filter(row => Number.isFinite(row.latitude) && Number.isFinite(row.longitude));
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Método no permitido.' });
  }
  try {
    const payload = await searchPlaces(req.query || {});
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800');
    return res.status(200).json(payload);
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      error: error.message || 'Error inesperado.',
      details: error.details || undefined,
    });
  }
};
