# Actualización v5.6 — exclusión efectiva de especies exóticas

## Corrección principal

La API de eBird entrega la clasificación de especies exóticas en el campo `exoticCategory`. La versión anterior buscaba principalmente `exoticCode`, por lo que algunos registros Naturalized, Provisional o Escapee podían seguir apareciendo.

La versión 5.6 reconoce:

- `exoticCategory`
- `exoticCode`
- `Exotic Category`
- `Exotic Code`
- valores `N`, `P`, `X`
- textos Naturalized, Provisional y Escapee

Las especies clasificadas como Naturalized, Provisional o Escapee, y los taxones `domestic`, se excluyen de Inicio, Especies, Avistamientos, métricas, destinos y rutas.

## Actualización

1. Reemplaza en GitHub todo el contenido de la versión anterior por el contenido de `ebird-personal-web-v5_6`.
2. Confirma que se reemplazaron `index.html` y `public/index.html`.
3. Realiza el commit.
4. En Vercel genera un despliegue nuevo sin reutilizar la caché.
5. Abre la aplicación y usa `Ctrl + F5`.
6. Presiona **Sincronizar eBird** y luego **Actualizar** en Inicio.

No es obligatorio volver a importar el CSV para corregir la tabla de registros recientes. Si deseas depurar también datos personales históricos importados sin clasificación exótica, vuelve a importar `MyEBirdData.csv`.
