# Actualización a v5.3

## Cambios

1. La ruta ya no parte desde CCP, una ciudad, un aeropuerto ni la ubicación del dispositivo.
2. Solo se calcula el recorrido entre los sitios seleccionados.
3. No se agrega regreso al punto inicial.
4. El orden se optimiza con la matriz vial de OSRM, combinando tiempo y distancia.
5. Las rutas excluyen especies con estatus eBird `N`, `P` o `X`:
   - naturalizada;
   - exótica provisional;
   - escapee.
6. La hoja Inicio muestra una columna separada para la región o estado del registro reciente.
7. Se retiró `api/place-search.js`, porque ya no se necesita buscar un origen.

## Actualización de GitHub

Reemplaza el contenido del repositorio por el contenido de `ebird-personal-web-v5_3`.

La raíz debe mostrar:

```text
api/
public/
index.html
package.json
vercel.json
README.md
```

Dentro de `api/` deben quedar:

```text
config-status.js
ebird.js
routing.js
```

Elimina `api/place-search.js` si sigue presente.

## Vercel

Mantén únicamente:

```text
EBIRD_API_KEY
```

Después del commit, realiza un despliegue nuevo. Si Vercel no despliega automáticamente, usa `Deployments → Redeploy` y desactiva la caché existente.
