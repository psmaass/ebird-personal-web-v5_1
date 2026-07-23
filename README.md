# Mi eBird Personal v6.4

Aplicación web personal para controlar especies, observaciones, oportunidades recientes y rutas regionales usando la taxonomía oficial de eBird.

## Conciliación de lista personal v6.4

La aplicación separa dos conceptos que antes estaban mezclados:

- **Total eBird por país:** todas las especies registradas en el CSV personal, incluidas naturalizadas, provisionales y escapes.
- **Total nativo por país:** especies sin código exótico, utilizado para oportunidades y planificación de rutas.

Las filas con `Exotic Code` ya no se descartan durante la importación. Los taxones domésticos con `reportAs` se consolidan bajo la especie aceptada antes de decidir si corresponde incorporarlos.

En **Datos y configuración → Diagnóstico** se muestra la conciliación por país y la lista de especies introducidas que explican cualquier diferencia entre ambos indicadores.

## Mejora territorial v6.2

La región y comuna se resuelven con una jerarquía de fuentes y un índice territorial separado:

1. Códigos `subnational1` y `subnational2` entregados por eBird.
2. Coincidencia exacta por `locId` o coordenadas ya conocidas.
3. División político-administrativa oficial de Chile publicada en SIMBIO/MMA.
4. Para puntos pelágicos, comuna costera oficial más cercana calculada sobre el límite poligonal.
5. Nominatim/OpenStreetMap como respaldo para otros países.
6. Referencia eBird cercana solo dentro de 120 km y con menor puntaje.

## Variables de Vercel

- `EBIRD_API_KEY`

## Estructura

- `api/ebird.js`: proxy seguro para eBird.
- `api/geocode.js`: resolución territorial oficial y global.
- `api/routing.js`: rutas OSRM/OpenStreetMap.
- `index.html` y `public/index.html`: aplicación web.
- `INSTRUCCIONES_ACTUALIZACION_V6_4.md`: pasos de actualización y reimportación obligatoria.
