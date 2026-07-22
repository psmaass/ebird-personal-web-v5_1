# Actualización a v5.2

1. En GitHub reemplaza el contenido del repositorio por los archivos de esta carpeta.
2. Elimina `api/flights.js` si todavía existe.
3. Confirma que la raíz contenga `api/`, `public/`, `index.html`, `package.json` y `vercel.json`.
4. En Vercel conserva únicamente `EBIRD_API_KEY` como variable obligatoria.
5. `SERPAPI_KEY` ya no se utiliza y puede eliminarse.
6. Haz un despliegue nuevo sin reutilizar la caché.

La base local conserva el mismo nombre de IndexedDB, por lo que los datos importados deberían mantenerse si se usa el mismo dominio y navegador.
