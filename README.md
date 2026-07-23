# Mi eBird Personal v6.6.1

Aplicación web personal para controlar especies, observaciones, oportunidades recientes y rutas regionales usando la taxonomía oficial de eBird.

## Conciliación de categorías v6.5

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
- `INSTRUCCIONES_ACTUALIZACION_V6_6.md`: pasos de actualización y reimportación obligatoria.


## Categorías de origen v6.5

- La ausencia de `Exotic Code` ya no se presenta automáticamente como **Nativa**.
- Los registros sin evidencia se muestran como **Sin clasificar**.
- Al buscar una especie concreta o pulsar **Verificar con eBird**, la aplicación consulta la lista asociada mediante `product/checklist/view/{subId}`, guarda la categoría exacta del registro y actualiza la tabla.
- Las respuestas de listas se guardan en caché local para no repetir solicitudes.
- Las rutas siguen excluyendo cualquier especie confirmada como Naturalizada, Provisional o Escape.


## Checklist oficial de rutas v6.6

- El entregable de cada ruta se organiza por región y por orden efectivo de visita.
- Cada sitio presenta una tabla con casilla de control, nombre común chileno, nombre en inglés, nombre científico, confiabilidad y aporte marginal a la ruta.
- El enlace de “último registro” utiliza la observación específica del sitio, no un registro regional distinto.
- El checklist puede abrirse en una vista consolidada, imprimirse o guardarse como PDF y descargarse como CSV UTF-8.
- Las marcas realizadas en las casillas se conservan localmente hasta recalcular la ruta.


## Corrección v6.6.1

- Se restableció la función `renderMeta()`, eliminada accidentalmente durante la incorporación del checklist de rutas.
- La sincronización vuelve a actualizar el estado lateral sin producir el error `renderMeta is not defined`.
- No se eliminan observaciones, rutas ni configuraciones guardadas al actualizar desde v6.6.
