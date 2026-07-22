'use strict';

function cleanAirport(value = '') {
  const code = String(value || '').trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(code)) throw new Error('Código de aeropuerto inválido.');
  return code;
}

function cleanDate(value = '') {
  const date = String(value || '').slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('Fecha de vuelo inválida.');
  const parsed = new Date(`${date}T12:00:00Z`);
  if (Number.isNaN(parsed.getTime())) throw new Error('Fecha de vuelo inválida.');
  return date;
}

function addDaysISO(isoDate, days) {
  const date = new Date(`${cleanDate(isoDate)}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + Number(days || 0));
  return date.toISOString().slice(0, 10);
}

function cleanInteger(value, fallback, min, max) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, Math.round(parsed)));
}

function cleanBoolean(value, fallback = false) {
  if (value === undefined || value === null || value === '') return fallback;
  return String(value).toLowerCase() === 'true';
}

function isJetSmartFlight(flight = {}) {
  const airline = String(flight.airline || '').toLowerCase();
  const flightNumber = String(flight.flight_number || '').replace(/\s+/g, '').toUpperCase();
  return airline.includes('jetsmart') || flightNumber.startsWith('JA');
}

function summarizeOffer(offer = {}, meta = {}) {
  const flights = Array.isArray(offer.flights) ? offer.flights : [];
  const airlines = [...new Set(flights.map(row => row.airline).filter(Boolean))];
  const flightNumbers = flights.map(row => row.flight_number).filter(Boolean);
  const departure = flights[0]?.departure_airport || {};
  const arrival = flights[flights.length - 1]?.arrival_airport || {};
  const isJetSmart = flights.some(isJetSmartFlight) || airlines.some(name => String(name).toLowerCase().includes('jetsmart'));
  return {
    price: Number(offer.price || 0),
    currency: offer.currency || '',
    totalDuration: Number(offer.total_duration || 0),
    airlines,
    flightNumbers,
    stops: Math.max(0, flights.length - 1),
    departure,
    arrival,
    type: offer.type || meta.type || 'One way',
    airlineLogo: offer.airline_logo || '',
    extensions: Array.isArray(offer.extensions) ? offer.extensions : [],
    bookingToken: offer.booking_token || '',
    departureToken: offer.departure_token || '',
    isJetSmart,
    source: meta.source || 'general',
    bags: meta.bags ?? 0,
    direction: meta.direction || '',
    searchDate: meta.searchDate || '',
  };
}

function offerKey(offer = {}) {
  return [
    offer.price,
    offer.totalDuration,
    (offer.flightNumbers || []).join('|'),
    offer.departure?.time || '',
    offer.arrival?.time || '',
  ].join('::');
}

function mergeOffers(groups = []) {
  const unique = new Map();
  groups.flat().forEach(offer => {
    if (!Number.isFinite(offer.price) || offer.price <= 0) return;
    const key = offerKey(offer);
    const previous = unique.get(key);
    if (!previous || (offer.isJetSmart && !previous.isJetSmart)) unique.set(key, offer);
  });
  return [...unique.values()].sort((a, b) => {
    if (a.price !== b.price) return a.price - b.price;
    if (a.stops !== b.stops) return a.stops - b.stops;
    return a.totalDuration - b.totalDuration;
  });
}

async function runSearch(baseParams, apiKey, options = {}) {
  const params = new URLSearchParams(baseParams);
  params.set('api_key', apiKey);
  if (options.includeAirlines) params.set('include_airlines', options.includeAirlines);
  const response = await fetch(`https://serpapi.com/search.json?${params.toString()}`, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(55000),
  });
  let payload;
  try { payload = await response.json(); } catch { payload = null; }
  if (!response.ok || payload?.error) {
    const error = new Error(payload?.error || `Error HTTP ${response.status} al cotizar vuelos.`);
    error.statusCode = response.status || 502;
    throw error;
  }
  const offers = [...(payload.best_flights || []), ...(payload.other_flights || [])]
    .map(row => summarizeOffer(row, {
      source: options.source || 'Todas las aerolíneas',
      bags: Number(baseParams.get('bags') || 0),
      direction: options.direction || '',
      searchDate: options.searchDate || '',
      type: Number(baseParams.get('type')) === 2 ? 'One way' : 'Round trip',
    }));
  return { payload, offers };
}

function buildOneWayParams({ departure, arrival, date, adults, travelClass, bags, deepSearch, showHidden }) {
  return new URLSearchParams({
    engine: 'google_flights',
    departure_id: departure,
    arrival_id: arrival,
    outbound_date: date,
    type: '2',
    adults: String(adults),
    travel_class: String(travelClass),
    bags: String(bags),
    currency: 'CLP',
    hl: 'es',
    gl: 'cl',
    sort_by: '2',
    deep_search: String(deepSearch),
    show_hidden: String(showHidden),
  });
}

async function searchOneWay({ departure, arrival, date, adults, travelClass, bags, deepSearch, showHidden, forceJetSmart, direction }, apiKey) {
  const params = buildOneWayParams({ departure, arrival, date, adults, travelClass, bags, deepSearch, showHidden });
  const searches = [runSearch(params, apiKey, {
    source: 'Todas las aerolíneas', direction, searchDate: date,
  })];
  if (forceJetSmart) searches.push(runSearch(params, apiKey, {
    includeAirlines: 'JA', source: 'Búsqueda específica JetSMART', direction, searchDate: date,
  }));
  const settled = await Promise.allSettled(searches);
  const successful = settled.filter(result => result.status === 'fulfilled').map(result => result.value);
  if (!successful.length) {
    const reason = settled.find(result => result.status === 'rejected')?.reason;
    throw reason || new Error(`No fue posible obtener vuelos para ${date}.`);
  }
  const offers = mergeOffers(successful.map(result => result.offers)).slice(0, 20);
  const primaryPayload = successful[0]?.payload || {};
  return {
    date,
    departure,
    arrival,
    offers,
    lowestPrice: Number(offers[0]?.price || 0),
    lowestOffer: offers[0] || null,
    googleFlightsUrl: primaryPayload.search_metadata?.google_flights_url || '',
    jetSmartFound: offers.some(row => row.isJetSmart),
    jetSmartOffers: offers.filter(row => row.isJetSmart).length,
    partialSearchFailure: settled.some(result => result.status === 'rejected'),
  };
}

async function fetchFlightPrices(query = {}, apiKey = process.env.SERPAPI_KEY) {
  if (!apiKey) {
    const error = new Error('Falta SERPAPI_KEY. Ejecuta nuevamente el configurador y agrega la llave opcional de vuelos.');
    error.statusCode = 503;
    throw error;
  }

  const departure = cleanAirport(query.departure || 'CCP');
  const arrival = cleanAirport(query.arrival);
  const outboundDate = cleanDate(query.outboundDate);
  const minimumReturnDate = cleanDate(query.returnDate);
  const flexibleReturnDays = cleanInteger(query.flexibleReturnDays, 3, 0, 7);
  const adults = cleanInteger(query.adults, 1, 1, 9);
  const travelClass = cleanInteger(query.travelClass, 1, 1, 4);
  const bags = cleanInteger(query.bags, 0, 0, adults);
  const forceJetSmart = cleanBoolean(query.forceJetSmart, true);
  const deepSearch = cleanBoolean(query.deepSearch, true);
  const showHidden = cleanBoolean(query.showHidden, true);

  const returnDates = Array.from({ length: flexibleReturnDays + 1 }, (_, index) => addDaysISO(minimumReturnDate, index));

  // La ida se consulta una sola vez. Los retornos se consultan de forma independiente
  // para poder comparar precios por fecha y desagregar ambos tramos.
  const outboundPromise = searchOneWay({
    departure, arrival, date: outboundDate, adults, travelClass, bags,
    deepSearch, showHidden, forceJetSmart, direction: 'outbound',
  }, apiKey);

  const returnPromises = returnDates.map(date => searchOneWay({
    departure: arrival, arrival: departure, date, adults, travelClass, bags,
    deepSearch, showHidden, forceJetSmart, direction: 'return',
  }, apiKey).catch(error => ({
    date, departure: arrival, arrival: departure, offers: [], lowestPrice: 0,
    lowestOffer: null, error: error.message || 'Sin resultados', jetSmartFound: false,
    jetSmartOffers: 0, partialSearchFailure: true, googleFlightsUrl: '',
  })));

  const [outbound, returns] = await Promise.all([outboundPromise, Promise.all(returnPromises)]);
  if (!outbound.offers.length) throw new Error('No se encontraron opciones de ida para la fecha seleccionada.');

  const availableReturns = returns.filter(row => row.lowestOffer && row.lowestPrice > 0);
  if (!availableReturns.length) throw new Error('No se encontraron opciones de regreso dentro del rango flexible seleccionado.');

  const bestReturn = [...availableReturns].sort((a, b) => {
    if (a.lowestPrice !== b.lowestPrice) return a.lowestPrice - b.lowestPrice;
    return a.date.localeCompare(b.date);
  })[0];
  const outboundOffer = outbound.lowestOffer;
  const returnOffer = bestReturn.lowestOffer;
  const totalPrice = Number(outboundOffer.price || 0) + Number(returnOffer.price || 0);
  const extraReturnDays = returnDates.indexOf(bestReturn.date);

  const returnComparisons = returns.map(row => ({
    date: row.date,
    available: Boolean(row.lowestOffer),
    returnPrice: Number(row.lowestPrice || 0),
    totalPrice: row.lowestOffer ? Number(outboundOffer.price || 0) + Number(row.lowestPrice || 0) : 0,
    lowestOffer: row.lowestOffer,
    offers: row.offers,
    googleFlightsUrl: row.googleFlightsUrl,
    jetSmartFound: row.jetSmartFound,
    error: row.error || '',
    extraDays: returnDates.indexOf(row.date),
  })).sort((a, b) => {
    if (a.available !== b.available) return a.available ? -1 : 1;
    if (a.totalPrice !== b.totalPrice) return a.totalPrice - b.totalPrice;
    return a.date.localeCompare(b.date);
  });

  return {
    searchMode: 'separate-one-way-flexible-return',
    departure,
    arrival,
    outboundDate,
    minimumReturnDate,
    flexibleReturnDays,
    returnDates,
    adults,
    bags,
    currency: 'CLP',
    outbound,
    returns,
    returnComparisons,
    bestReturn,
    bestCombination: {
      outboundDate,
      returnDate: bestReturn.date,
      outboundPrice: Number(outboundOffer.price || 0),
      returnPrice: Number(returnOffer.price || 0),
      totalPrice,
      outboundOffer,
      returnOffer,
      extraReturnDays,
    },
    selectedReturnDate: bestReturn.date,
    lowestPrice: totalPrice,
    offers: [outboundOffer, returnOffer],
    googleFlightsUrl: outbound.googleFlightsUrl || bestReturn.googleFlightsUrl || '',
    jetSmartFound: outbound.jetSmartFound || availableReturns.some(row => row.jetSmartFound),
    jetSmartOffers: outbound.jetSmartOffers + availableReturns.reduce((sum, row) => sum + row.jetSmartOffers, 0),
    searchedJetSmartExplicitly: forceJetSmart,
    partialSearchFailure: outbound.partialSearchFailure || returns.some(row => row.partialSearchFailure),
    fetchedAt: new Date().toISOString(),
    note: bags === 0
      ? 'Los valores corresponden a dos búsquedas de solo ida con artículo personal. Pueden emitirse como pasajes separados; confirma equipaje, condiciones y precio final antes de comprar.'
      : 'Los valores corresponden a dos búsquedas de solo ida con equipaje de cabina solicitado. Confirma que el equipaje esté incluido en ambos tramos y revisa el precio final antes de comprar.',
  };
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Método no permitido.' });
  }
  try {
    const payload = await fetchFlightPrices(req.query || {}, process.env.SERPAPI_KEY);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json(payload);
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      error: error.message || 'Error inesperado.',
      details: error.details || undefined,
    });
  }
};
