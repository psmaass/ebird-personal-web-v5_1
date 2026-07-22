# Actualización a Mi eBird Personal v5.7

## Archivos que debes reemplazar en GitHub

Sube todo el contenido de la carpeta `ebird-personal-web-v5_7` y reemplaza la versión anterior.

Verifica especialmente:

```text
index.html
public/index.html
api/geocode.js
package.json
```

Dentro de `api/` deben mantenerse:

```text
config-status.js
ebird.js
geocode.js
routing.js
```

## Vercel

Mantén la variable:

```text
EBIRD_API_KEY
```

Después del commit:

1. espera el despliegue automático;
2. si no se inicia, usa `Deployments → Redeploy`;
3. no reutilices el caché de compilación;
4. recarga la aplicación con `Ctrl + F5`.

## Comprobación

En el menú debe aparecer `v5.7`.

Al presionar **Buscar oportunidades**, la aplicación mostrará el estado **Buscando obligatoriamente región y comuna por coordenadas**. Si un punto no puede ser asignado a una región, la aplicación no lo agrupará como “Sin región informada”; detendrá el cálculo e indicará qué sitios siguen pendientes.
