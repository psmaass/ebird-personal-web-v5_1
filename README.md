# Mi eBird Personal Web v5.1

Versión exclusiva para GitHub y Vercel.

Esta edición elimina el servidor local `server.js` y la carpeta compartida `lib/`.
Cada función de `/api` contiene su propia implementación, evitando errores de despliegue por archivos omitidos.

## Variables de entorno en Vercel

- `EBIRD_API_KEY`: obligatoria.
- `SERPAPI_KEY`: opcional para búsqueda de vuelos.

## Estructura obligatoria en GitHub

```
api/
public/
index.html
package.json
vercel.json
```

No subas `.env` ni llaves privadas al repositorio.
