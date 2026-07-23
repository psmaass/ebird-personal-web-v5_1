# Actualización v6.6.2 — itinerario sin duplicaciones

## Problema corregido

En cada parada del itinerario se mostraban dos bloques con las mismas especies: primero las tarjetas de confiabilidad y luego el checklist del sitio. Además, el encabezado del sitio se repetía dentro del checklist.

## Nueva presentación

- El sitio, comuna, región y enlace eBird aparecen una sola vez.
- Cada especie aparece una sola vez en una tabla de checklist.
- La tabla conserva nombre común, inglés, científico, puntaje, último registro, enlace a la lista y aporte a la ruta.
- El desglose de distribución, época y registros recientes queda disponible mediante **Ver detalle** en la misma fila.
- El checklist oficial, la impresión y el CSV no pierden información.

## Actualización

1. Reemplaza el contenido del repositorio con la carpeta `ebird-personal-web-v6_6_2`.
2. Publica nuevamente en Vercel.
3. Recarga la aplicación con `Ctrl + F5`.
4. Confirma que el encabezado muestre **v6.6.2**.

No es necesario volver a sincronizar eBird, importar el CSV ni recalcular las rutas existentes.
