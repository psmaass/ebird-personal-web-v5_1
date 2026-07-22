# Actualización a Mi eBird Personal v5.5

## Cambios

- Región y comuna/distrito se completan automáticamente mediante coordenadas cuando faltan en eBird o en `MyEBirdData.csv`.
- Las consultas de geocodificación se ejecutan secuencialmente y se guardan en la base local para no repetirlas.
- Todas las tablas principales se pueden ordenar haciendo clic en cualquier cabecera.
- La tabla de destinos incorpora una columna independiente de región/estado y abre ordenada por región.
- Al calcular rutas, los sitios se separan por región y se genera un itinerario vial distinto para cada región.
- Cada ruta regional se optimiza conjuntamente por tiempo y distancia y se dibuja con un color diferente.
- El máximo de paradas se aplica por región.
- Se mantienen excluidas de todas las vistas las especies naturalizadas, exóticas provisionales, escapes y domésticas.

## GitHub

Reemplaza el contenido del repositorio por el contenido de la carpeta `ebird-personal-web-v5_5`.

La raíz debe contener:

- `api/`
- `public/`
- `index.html`
- `package.json`
- `vercel.json`
- `README.md`

Dentro de `api/` deben estar:

- `config-status.js`
- `ebird.js`
- `geocode.js`
- `routing.js`

## Vercel

Mantén solamente:

- `EBIRD_API_KEY`

No se necesita una llave adicional para la geocodificación.

Después del commit:

1. Espera el despliegue automático de Vercel.
2. Si no se inicia, usa `Deployments → Redeploy`.
3. Desactiva la reutilización de caché.
4. Recarga con `Ctrl + F5`.
5. Confirma que el menú lateral muestre `v5.5`.

La base local mantiene las observaciones y preferencias, pero elimina las rutas de versiones anteriores para recalcularlas con la nueva separación regional.
