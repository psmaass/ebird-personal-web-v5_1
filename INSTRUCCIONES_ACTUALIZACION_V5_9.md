# Actualización a Mi eBird Personal v5.9

## Cambios

- Cada especie mostrada es un enlace a `https://ebird.org/species/{speciesCode}`.
- Se muestran siempre el nombre común chileno de eBird (`es_CL`), el nombre común en inglés y el nombre científico.
- La sincronización descarga dos versiones de la taxonomía oficial: `es_CL` y `en`, unidas por `speciesCode`.
- Los tres nombres se muestran en Inicio, Especies, Avistamientos, destinos priorizados, detalle e índice de confiabilidad de las rutas.

## Actualización en GitHub

Reemplaza el contenido del repositorio con el contenido de `ebird-personal-web-v5_9`. Verifica especialmente:

- `index.html`
- `public/index.html`
- `api/ebird.js`

Mantén únicamente la variable `EBIRD_API_KEY` en Vercel. Después del despliegue, recarga con `Ctrl + F5` y presiona **Sincronizar eBird** para descargar los nombres ingleses. No necesitas volver a importar el CSV.
