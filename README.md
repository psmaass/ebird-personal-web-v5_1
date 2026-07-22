# Mi eBird Personal v5.3

Aplicación web personal para:

- controlar especies y avistamientos con taxonomía oficial de eBird;
- consultar oportunidades recientes por país, región, comuna o hotspot;
- construir una ruta vial únicamente entre los sitios a visitar;
- optimizar el orden de la ruta mediante distancia y tiempo de carretera;
- excluir de la planificación especies naturalizadas, exóticas provisionales y escapes (`N`, `P`, `X`).

## Variable de entorno en Vercel

```text
EBIRD_API_KEY
```

## Archivos principales

```text
api/ebird.js
api/routing.js
api/config-status.js
public/index.html
index.html
vercel.json
```

La aplicación guarda la información personal localmente en IndexedDB. Al cambiar de navegador o dispositivo se debe importar el CSV o restaurar un respaldo.
