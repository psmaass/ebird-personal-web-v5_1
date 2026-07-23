# Actualización a Mi eBird v6.2

## Cambios
- La tabla de oportunidades recientes incluye una columna **Lista eBird**.
- La tabla principal de especies incluye el enlace a la lista del registro más reciente.
- El detalle de cada especie incluye un enlace por observación.
- Las especies mostradas en destinos y en el índice de confiabilidad enlazan la lista que respalda su último registro disponible.
- Se conserva el enlace del nombre de la especie hacia su ficha oficial en eBird.

## Actualización en GitHub
Reemplaza el contenido del repositorio con el contenido de `ebird-personal-web-v6_2`. Verifica especialmente:

```text
index.html
public/index.html
```

No se requieren cambios en las funciones API ni variables nuevas. Mantén `EBIRD_API_KEY` en Vercel.

Después del commit, espera el despliegue de Vercel y recarga con `Ctrl + F5`. Presiona **Actualizar** o **Buscar oportunidades** para refrescar los registros recientes y sus identificadores de lista.

Cuando eBird no entregue `subId` para un registro, la aplicación mostrará **Sin lista disponible** y no inventará un enlace.
