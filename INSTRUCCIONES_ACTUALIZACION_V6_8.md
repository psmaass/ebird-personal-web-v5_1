# Actualización v6.8 — Historial de registros recientes por especie

## Mejora principal

En **Especies > Pendientes**, cuando una especie posee registros públicos recientes de eBird, la tabla mantiene visible el registro más reciente y agrega el acceso **Ver últimos registros (N)**.

Al abrirlo:

- los registros se ordenan del más reciente al más antiguo;
- se muestran inicialmente los últimos 5 registros;
- el botón **Ver más** amplía de 5 en 5 hasta un máximo de 20 registros;
- se informa el total de registros recientes y el número de sitios distintos;
- cada fila muestra fecha, sitio, comuna, región, cantidad, estado y enlace a la lista eBird;
- los registros se deduplican por checklist eBird (Submission ID) y, cuando no existe, por fecha/sitio/coordenadas;
- se mantiene la señal de oportunidad: alta, media o registro aislado.

La misma información queda disponible desde el detalle individual de cada especie.

## Actualización en GitHub / Vercel

Reemplaza el contenido de la versión anterior por el contenido de `ebird-personal-web-v6_8`. Mantén la variable `EBIRD_API_KEY` configurada en Vercel y realiza un nuevo despliegue.
