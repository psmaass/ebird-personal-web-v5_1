# Actualización v6.7 — historial de registros recientes por especie

## Mejora principal

Las especies pendientes ya no quedan representadas únicamente por su último avistamiento público. La aplicación conserva el último registro en la vista compacta y permite abrir el historial reciente disponible para esa especie.

### Qué cambia

- **Inicio > Especies pendientes observadas recientemente** muestra una fila por especie, no una fila arbitraria por observación.
- Cada especie indica cuántos **registros recientes** y cuántos **sitios distintos** existen.
- Se agrega **Ver últimos registros (N)**.
- El historial se ordena desde el registro más reciente al más antiguo y muestra fecha, sitio, comuna, región, cantidad, estado y enlace a la lista eBird.
- **Especies > Pendientes** incorpora el mismo acceso al historial.
- La ficha de detalle de una especie pendiente también expone los registros públicos recientes.
- Se deduplican observaciones por `subId`; si no existe lista asociada, se usa fecha + sitio/coordenadas.

### Priorización visual

- Alta oportunidad: 3 o más registros recientes **o** 2 o más sitios distintos.
- Oportunidad media: 2 registros.
- Registro aislado: 1 registro.

## Actualización

1. Reemplaza el contenido del repositorio con la carpeta `ebird-personal-web-v6_7`.
2. Mantén `EBIRD_API_KEY` en Vercel.
3. Publica nuevamente y recarga con `Ctrl + F5`.
4. Presiona **Actualizar** en registros recientes o **Sincronizar eBird** para refrescar la ventana de 30 días.

No es necesario reimportar `MyEBirdData.csv`.
