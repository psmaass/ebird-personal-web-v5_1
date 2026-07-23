# Actualización a Mi eBird Personal v6.0

## Archivos a reemplazar en GitHub

Reemplaza todo el contenido del repositorio con el contenido de `ebird-personal-web-v6_0`.

Comprueba especialmente:

```text
api/geocode.js
index.html
public/index.html
package.json
README.md
```

Dentro de `api/` deben quedar:

```text
config-status.js
ebird.js
geocode.js
routing.js
```

## Vercel

Mantén únicamente:

```text
EBIRD_API_KEY
```

Después del commit:

1. Espera el despliegue automático.
2. Si es necesario, ejecuta `Redeploy` sin reutilizar la caché.
3. Recarga la aplicación con `Ctrl + F5`.
4. Confirma que el menú muestre `v6.0`.
5. Presiona `Buscar oportunidades` y recalcula las rutas.

## Importante

La versión elimina el caché geográfico anterior al abrirse por primera vez. Esto es necesario porque versiones previas podían guardar `Chile` como si fuera una región. No es necesario reimportar `MyEBirdData.csv`.

## Resultado esperado para puntos pelágicos

Un punto como `Arica—Pelágico` debería quedar asociado a:

```text
Comuna: Arica
Región: Región de Arica y Parinacota
Fuente: SIMBIO MMA · comuna costera más cercana
```

El indicador territorial mostrará una confianza menor que un punto dentro del polígono comunal, pero superior a una inferencia genérica por país.
