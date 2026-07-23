# Actualización v6.6.1 — corrección de sincronización

## Error corregido

La versión 6.6 llamaba a `renderMeta()` después de sincronizar, pero la definición de esa función no estaba incluida en los archivos HTML. Esto generaba el mensaje `renderMeta is not defined`.

## Instalación

1. Reemplaza el contenido del proyecto publicado por los archivos de esta carpeta.
2. Confirma que se actualizaron ambos archivos: `index.html` y `public/index.html`.
3. Ejecuta un nuevo despliegue en Vercel.
4. Recarga la aplicación con `Ctrl + F5`.
5. Verifica que el encabezado lateral muestre **v6.6.1**.
6. Pulsa **Sincronizar** nuevamente.

No es necesario importar otra vez el CSV ni recalcular las rutas. La actualización conserva la base IndexedDB existente.
