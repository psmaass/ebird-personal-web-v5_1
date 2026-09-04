# Actualización v7.1 — Rutas: filtros, Global Big Day y lifer regional

## Cambios

- Se ordenó la fila de filtros de Rutas en una grilla estable de seis columnas.
- Las notas de Período y Provisionales se movieron bajo la fila de filtros para no alterar su alineación.
- Nuevo objetivo `Global Big Day · todas`: todas las especies nativas del catálogo del país cuentan como objetivo, aunque ya hayan sido observadas.
- Nuevo objetivo `Lifer regional`: incluye especies ya observadas en el país pero todavía no registradas por el usuario en la región/estado seleccionada.
- Lifer regional exige seleccionar una región específica; no se calcula con `Todo el país`.
- Se mantiene `Lifer mundial` y `Nueva para el país`.
- Versión de estado actualizada a 7.1 sin borrar la planificación existente de v7.0.

## Despliegue

Reemplaza el contenido del repositorio por esta versión y despliega nuevamente en Vercel. `index.html` y `public/index.html` contienen la misma interfaz actualizada.
