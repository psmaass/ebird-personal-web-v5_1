'use strict';

const API_BASE = 'https://api.ebird.org/v2';
const APP_REGION = 'CL';
const APP_LOCALE = 'es_CL';
const APP_ENGLISH_LOCALE = 'en';

function text(value = '') { return String(value ?? '').trim(); }

function cleanRegion(value = APP_REGION) {
  const region = text(value).toUpperCase();
  if (!/^[A-Z]{2}(?:-[A-Z0-9]{1,6}){0,2}$/.test(region)) throw new Error('Código regional inválido.');
  return region;
}

function cleanLocation(value = '') {
  const code = text(value);
  if (/^L\d{2,15}$/.test(code)) return code;
  return cleanRegion(code);
}

function cleanSpeciesCode(value = '') {
  const code = text(value).toLowerCase();
  if (!/^[a-z0-9-]{2,24}$/.test(code)) throw new Error('Código de especie inválido.');
  return code;
}

function cleanSubId(value = '') {
  const id = text(value).toUpperCase();
  if (!/^S\d{2,20}$/.test(id)) throw new Error('Identificador de lista inválido.');
  return id;
}

function boundedNumber(value, fallback, min, max) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function boundedInteger(value, fallback, min, max) {
  return Math.round(boundedNumber(value, fallback, min, max));
}

function booleanParam(value) { return String(value) === 'true'; }

function parseDate(query) {
  let date;
  if (query.date) date = new Date(`${text(query.date).slice(0, 10)}T12:00:00Z`);
  else {
    const y = boundedInteger(query.y, NaN, 1800, 2200);
    const m = boundedInteger(query.m, NaN, 1, 12);
    const d = boundedInteger(query.d, NaN, 1, 31);
    if (Number.isFinite(y) && Number.isFinite(m) && Number.isFinite(d)) date = new Date(Date.UTC(y, m - 1, d, 12));
  }
  if (!date || Number.isNaN(date.getTime())) throw new Error('Fecha inválida.');
  if (date.getUTCFullYear() < 1800) throw new Error('Fecha inválida: eBird admite fechas desde 1800.');
  const today = new Date();
  if (date > today) throw new Error('La fecha no puede estar en el futuro.');
  return { y: date.getUTCFullYear(), m: date.getUTCMonth() + 1, d: date.getUTCDate(), iso: date.toISOString().slice(0, 10) };
}

function appendLocations(params, raw, max) {
  const items = text(raw).split(',').map(item => item.trim()).filter(Boolean).slice(0, max);
  for (const item of items) params.append('r', cleanLocation(item));
}

function buildUrl(query = {}) {
  const action = text(query.action);
  const days = boundedInteger(query.days, 30, 1, 30);
  const locale = action === 'taxonomyEnglish' ? APP_ENGLISH_LOCALE : APP_LOCALE;
  const params = new URLSearchParams();
  let path;

  switch (action) {
    case 'taxonomy':
    case 'taxonomyEnglish':
      path = '/ref/taxonomy/ebird';
      params.set('fmt', 'json');
      params.set('locale', locale);
      if (query.version) params.set('version', text(query.version));
      break;

    case 'taxonomyVersions':
      path = '/ref/taxonomy/versions';
      break;

    case 'taxonomyGroups':
      path = `/ref/sppgroup/${query.grouping === 'merlin' ? 'merlin' : 'ebird'}`;
      params.set('groupNameLocale', locale);
      break;

    case 'speciesList':
    case 'speciesListAt':
      path = `/product/spplist/${cleanLocation(query.location || APP_REGION)}`;
      break;

    case 'recent':
    case 'recentAt': {
      const location = cleanLocation(query.location || APP_REGION);
      path = `/data/obs/${location}/recent`;
      params.set('back', String(days));
      params.set('detail', query.detail === 'simple' ? 'simple' : 'full');
      params.set('includeProvisional', String(booleanParam(query.includeProvisional)));
      params.set('sppLocale', locale);
      params.set('maxResults', String(boundedInteger(query.maxResults, 10000, 1, 10000)));
      if (booleanParam(query.hotspot)) params.set('hotspot', 'true');
      appendLocations(params, query.locations, 10);
      break;
    }

    case 'notable': {
      const location = cleanLocation(query.location || APP_REGION);
      path = `/data/obs/${location}/recent/notable`;
      params.set('back', String(days));
      params.set('detail', query.detail === 'simple' ? 'simple' : 'full');
      params.set('includeProvisional', String(booleanParam(query.includeProvisional)));
      params.set('sppLocale', locale);
      params.set('maxResults', String(boundedInteger(query.maxResults, 10000, 1, 10000)));
      if (booleanParam(query.hotspot)) params.set('hotspot', 'true');
      appendLocations(params, query.locations, 10);
      break;
    }

    case 'speciesRecent': {
      const speciesCode = cleanSpeciesCode(query.speciesCode);
      const location = cleanLocation(query.location || APP_REGION);
      path = `/data/obs/${location}/recent/${speciesCode}`;
      params.set('back', String(days));
      params.set('detail', query.detail === 'simple' ? 'simple' : 'full');
      params.set('includeProvisional', String(booleanParam(query.includeProvisional)));
      params.set('sppLocale', locale);
      params.set('maxResults', String(boundedInteger(query.maxResults, 10000, 1, 10000)));
      if (booleanParam(query.hotspot)) params.set('hotspot', 'true');
      appendLocations(params, query.locations, 10);
      break;
    }

    case 'nearby':
    case 'nearbyAll':
    case 'nearbyNotable': {
      const lat = boundedNumber(query.lat, NaN, -90, 90);
      const lng = boundedNumber(query.lng, NaN, -180, 180);
      const dist = boundedNumber(query.dist, 50, 0, 50);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) throw new Error('Latitud o longitud inválida.');
      if (action === 'nearby') path = `/data/obs/geo/recent/${cleanSpeciesCode(query.speciesCode)}`;
      else if (action === 'nearbyNotable') path = '/data/obs/geo/recent/notable';
      else path = '/data/obs/geo/recent';
      params.set('lat', String(lat));
      params.set('lng', String(lng));
      params.set('dist', String(dist));
      params.set('back', String(days));
      params.set('detail', query.detail === 'simple' ? 'simple' : 'full');
      params.set('includeProvisional', String(booleanParam(query.includeProvisional)));
      params.set('sppLocale', locale);
      params.set('maxResults', String(boundedInteger(query.maxResults, 10000, 1, 10000)));
      if (booleanParam(query.hotspot)) params.set('hotspot', 'true');
      break;
    }

    case 'nearest': {
      const lat = boundedNumber(query.lat, NaN, -90, 90);
      const lng = boundedNumber(query.lng, NaN, -180, 180);
      const dist = boundedNumber(query.dist, 50, 0, 50);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) throw new Error('Latitud o longitud inválida.');
      path = `/data/nearest/geo/recent/${cleanSpeciesCode(query.speciesCode)}`;
      params.set('lat', String(lat));
      params.set('lng', String(lng));
      params.set('dist', String(dist));
      params.set('back', String(days));
      params.set('detail', query.detail === 'simple' ? 'simple' : 'full');
      params.set('includeProvisional', String(booleanParam(query.includeProvisional)));
      params.set('sppLocale', locale);
      params.set('maxResults', String(boundedInteger(query.maxResults, 100, 1, 10000)));
      if (booleanParam(query.hotspot)) params.set('hotspot', 'true');
      break;
    }

    case 'hotspots':
      path = `/ref/hotspot/${cleanRegion(query.location || APP_REGION)}`;
      params.set('fmt', 'json');
      if (!booleanParam(query.all)) params.set('back', String(days));
      break;

    case 'hotspotsNearby': {
      const lat = boundedNumber(query.lat, NaN, -90, 90);
      const lng = boundedNumber(query.lng, NaN, -180, 180);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) throw new Error('Latitud o longitud inválida.');
      path = '/ref/hotspot/geo';
      params.set('lat', String(lat));
      params.set('lng', String(lng));
      params.set('dist', String(boundedNumber(query.dist, 50, 0, 500)));
      params.set('fmt', 'json');
      if (!booleanParam(query.all) && query.days) params.set('back', String(days));
      break;
    }

    case 'hotspotInfo':
      path = `/ref/hotspot/info/${cleanLocation(query.location || query.locId)}`;
      break;

    case 'regionInfo':
      path = `/ref/region/info/${cleanRegion(query.location || APP_REGION)}`;
      params.set('regionNameFormat', text(query.format || 'full'));
      break;

    case 'subregions': {
      const type = ['country', 'subnational1', 'subnational2'].includes(query.regionType) ? query.regionType : 'subnational1';
      const parent = type === 'country' ? 'world' : cleanRegion(query.parent || APP_REGION);
      path = `/ref/region/list/${type}/${parent}`;
      break;
    }

    case 'checklist':
      path = `/product/checklist/view/${cleanSubId(query.subId)}`;
      break;

    case 'recentChecklists':
      path = `/product/lists/${cleanLocation(query.location || APP_REGION)}`;
      params.set('maxResults', String(boundedInteger(query.maxResults, 50, 1, 200)));
      break;

    case 'checklistsDate': {
      const date = parseDate(query);
      path = `/product/lists/${cleanLocation(query.location || APP_REGION)}/${date.y}/${date.m}/${date.d}`;
      params.set('maxResults', String(boundedInteger(query.maxResults, 100, 1, 200)));
      break;
    }

    case 'stats': {
      const date = parseDate(query);
      path = `/product/stats/${cleanLocation(query.location || APP_REGION)}/${date.y}/${date.m}/${date.d}`;
      break;
    }

    case 'top100': {
      const date = parseDate(query);
      path = `/product/top100/${cleanLocation(query.location || APP_REGION)}/${date.y}/${date.m}/${date.d}`;
      params.set('maxResults', String(boundedInteger(query.maxResults, 100, 1, 100)));
      if (booleanParam(query.checklistSort)) params.set('checklistSort', 'true');
      break;
    }

    case 'historic': {
      const date = parseDate(query);
      path = `/data/obs/${cleanLocation(query.location || APP_REGION)}/historic/${date.y}/${date.m}/${date.d}`;
      params.set('detail', query.detail === 'full' ? 'full' : 'simple');
      params.set('includeProvisional', String(booleanParam(query.includeProvisional)));
      params.set('sppLocale', locale);
      params.set('maxResults', String(boundedInteger(query.maxResults, 10000, 1, 10000)));
      params.set('rank', query.rank === 'create' ? 'create' : 'mrec');
      if (booleanParam(query.hotspot)) params.set('hotspot', 'true');
      if (query.category) params.set('cat', text(query.category));
      appendLocations(params, query.locations, 50);
      break;
    }

    default:
      throw new Error('Acción API no permitida.');
  }

  return `${API_BASE}${path}${params.size ? `?${params.toString()}` : ''}`;
}

async function fetchEBird(query, apiKey) {
  if (!apiKey) {
    const error = new Error('Falta configurar EBIRD_API_KEY en el servidor.');
    error.statusCode = 500;
    throw error;
  }

  const url = buildUrl(query);
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'x-ebirdapitoken': apiKey,
      'accept': 'application/json',
      'user-agent': 'Mi-eBird-Personal/5.9'
    },
  });

  const raw = await response.text();
  let payload;
  try { payload = raw ? JSON.parse(raw) : null; } catch { payload = { raw }; }

  if (!response.ok) {
    const error = new Error(payload?.message || payload?.error || payload?.errors?.title || `eBird respondió HTTP ${response.status}.`);
    error.statusCode = response.status;
    error.details = payload;
    throw error;
  }
  return payload;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Método no permitido.' });
  }
  try {
    const payload = await fetchEBird(req.query || {}, process.env.EBIRD_API_KEY);
    res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=3600');
    return res.status(200).json(payload);
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      error: error.message || 'Error inesperado.',
      details: error.details || undefined,
    });
  }
};
