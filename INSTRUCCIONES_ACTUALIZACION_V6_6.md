# Actualización v6.6 — checklist oficial de rutas

## Problema corregido

La versión 6.5 mostraba un itinerario con tarjetas de confiabilidad, pero no generaba el checklist solicitado como entregable. Además, el enlace presentado dentro de la confiabilidad podía corresponder al último registro de toda la región, no necesariamente al sitio de la ruta.

## Nuevo checklist

Después de calcular una ruta se habilitan tres acciones:

1. **Abrir checklist oficial**: muestra todas las rutas regionales, ordenadas por sitio de visita.
2. **Imprimir / guardar PDF**: abre una versión limpia para impresión o guardado como PDF.
3. **Descargar checklist CSV**: exporta una fila por especie y sitio en formato compatible con Excel.

Cada fila incluye:

- casilla de control;
- nombre común chileno;
- nombre en inglés;
- nombre científico;
- confiabilidad;
- fecha y enlace de la última lista usada para ese sitio;
- indicación de si la especie aporta una nueva oportunidad a la secuencia de la ruta.

## Instalación

1. Reemplaza el contenido del repositorio por la carpeta `ebird-personal-web-v6_6`.
2. Publica nuevamente en Vercel sin reutilizar caché.
3. Recarga con `Ctrl + F5` y confirma **v6.6**.
4. No es necesario reimportar el CSV.
5. Debes volver a calcular las rutas para generar el nuevo checklist.
