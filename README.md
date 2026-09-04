## Versión 7.0

Rutas con histórico EBD Chile 2024-2026 integrado por región y complemento de API reciente.

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


## v6.8 — historial reciente por especie

Las especies pendientes pueden abrir sus últimos registros públicos recientes. La vista muestra 5 inicialmente y permite ampliar hasta 20, con conteo de registros y sitios distintos, deduplicación y enlaces a las listas eBird.


## v6.9 — períodos ampliados y todos los puntos de ruta

- Rutas permite seleccionar 30, 60, 90, 120, 180, 270 o 365 días.
- La API pública de observaciones recientes de eBird se consulta por los últimos 30 días. Para ventanas mayores, la aplicación conserva y combina el historial público acumulado en sincronizaciones anteriores, con deduplicación de registros y retención de hasta 365 días.
- “Máximo de paradas” cambia a “Puntos a visitar”. La opción predeterminada es “Todos los posibles”.
- Se amplía el optimizador desde 24 hasta 45 sitios elegibles por región, que corresponde al límite configurado del servicio vial interno.
- “Seleccionar mejores” selecciona todos los destinos cuando está activa la opción “Todos los posibles”; con un número específico mantiene el límite indicado.
