'use strict';

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Método no permitido.' });
  }

  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({
    ebirdConfigured: Boolean(process.env.EBIRD_API_KEY),
    flightsConfigured: Boolean(process.env.SERPAPI_KEY),
  });
};
