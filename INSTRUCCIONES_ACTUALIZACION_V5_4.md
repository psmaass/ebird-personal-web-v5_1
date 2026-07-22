# Actualización a Mi eBird v5.4

## Cambios

- Las especies con código exótico eBird `N`, `P` o `X` se excluyen de todas las vistas, métricas, avistamientos, detalles y rutas.
- El filtro de país de Inicio muestra únicamente países con observaciones personales nativas.
- La vista Especies abre por defecto en `Pendientes`.
- Especies muestra la última fecha disponible, lugar, comuna/distrito y región/estado. Prioriza el registro reciente público de eBird y usa la última observación personal como respaldo.
- Se eliminó el selector de conteo que permitía volver a mostrar especies exóticas.

## GitHub

Reemplaza el contenido del repositorio con el contenido de `ebird-personal-web-v5_4`.

La raíz debe contener:

- `api/`
- `public/`
- `index.html`
- `package.json`
- `vercel.json`

## Vercel

Mantén solo la variable:

- `EBIRD_API_KEY`

Después del commit, realiza un despliegue nuevo sin reutilizar la caché y recarga la página con `Ctrl + F5`.

La base local se migra, pero se limpian las rutas calculadas con la lógica anterior. Conviene sincronizar eBird nuevamente para actualizar la clasificación exótica por país.
