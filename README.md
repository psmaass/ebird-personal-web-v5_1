# Mi eBird Personal Web v5.2

Aplicación personal enfocada en:

- lista de especies y avistamientos con taxonomía oficial de eBird;
- ranking territorial de oportunidades por país, región, comuna y hotspot;
- cálculo de ruta vial real desde un punto de origen local;
- circuito de ida y vuelta optimizado con OSRM/OpenStreetMap.

## Variable de entorno

- `EBIRD_API_KEY`: obligatoria en Vercel.

La búsqueda y cotización de vuelos fue eliminada. No se requiere `SERPAPI_KEY`.

## Estructura para GitHub/Vercel

```
api/
public/
index.html
package.json
vercel.json
```

No subas archivos `.env` ni llaves privadas a GitHub.
