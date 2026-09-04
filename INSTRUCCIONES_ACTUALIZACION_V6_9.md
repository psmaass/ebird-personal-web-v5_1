# Actualización v6.9 — Rutas

## Cambios

1. El selector **Período** permite 30, 60, 90, 120, 180, 270 y 365 días.
2. Para períodos sobre 30 días se combinan los últimos 30 días consultados a eBird con el historial público acumulado de sincronizaciones previas.
3. El historial público se conserva hasta 365 días y se deduplica por lista, especie, lugar, fecha y coordenadas.
4. **Máximo de paradas** pasa a llamarse **Puntos a visitar**.
5. Se agrega **Todos los posibles** como opción predeterminada.
6. El optimizador admite hasta 45 sitios viales elegibles por región.

## Importante

La API pública de observaciones recientes de eBird no entrega directamente una ventana retrospectiva mayor a 30 días en una sola consulta. Por eso los períodos 60–365 días se completan con registros que la aplicación haya ido acumulando en sincronizaciones anteriores. La cobertura histórica crecerá con el uso de la aplicación.

## Publicación

Reemplaza el contenido del repositorio por esta versión y vuelve a desplegar en Vercel. No es necesario borrar los datos locales; conservarlos permite aprovechar el historial acumulado.
