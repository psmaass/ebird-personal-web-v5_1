# Mi eBird Personal v6.1

Incluye checklist oficial imprimible y CSV por ruta y sitio.

# Mi eBird Personal v6.0

Aplicación web personal para controlar especies, observaciones y rutas regionales usando la taxonomía oficial de eBird.

## Mejora territorial v6.0

La región y comuna se resuelven con una jerarquía de fuentes y un índice territorial separado:

1. Códigos `subnational1` y `subnational2` entregados por eBird.
2. Coincidencia exacta por `locId` o coordenadas ya conocidas.
3. División político-administrativa oficial de Chile publicada en SIMBIO/MMA.
4. Para puntos pelágicos, comuna costera oficial más cercana calculada sobre el límite poligonal.
5. Nominatim/OpenStreetMap como respaldo para otros países.
6. Referencia eBird cercana solo dentro de 120 km y con menor puntaje.

La aplicación rechaza valores genéricos como `Chile` cuando se usan erróneamente como región. Cada parada muestra un indicador `Territorio X/100` y la ruta no agrupa puntos con una región insuficientemente confiable.

## Variables de Vercel

- `EBIRD_API_KEY`

## Estructura

- `api/ebird.js`: proxy seguro para eBird.
- `api/geocode.js`: resolución territorial oficial y global.
- `api/routing.js`: rutas OSRM/OpenStreetMap.
- `index.html` y `public/index.html`: aplicación web.
