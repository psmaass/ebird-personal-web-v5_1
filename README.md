# Mi eBird Personal v5.7

Aplicación personal para controlar especies nativas observadas y pendientes, revisar avistamientos y preparar rutas viales regionales usando taxonomía y nombres comunes oficiales de eBird (`es_CL`).

## Cambio principal de v5.7

Ningún sitio sin región puede entrar al ranking ni a una ruta. Antes de agrupar destinos, la aplicación intenta obligatoriamente:

1. reutilizar la región de otro registro con el mismo `locId` o las mismas coordenadas;
2. consultar geocodificación inversa en distintos niveles administrativos;
3. inferir el territorio desde el registro conocido más cercano del mismo país;
4. si aún no logra determinar una región, detener el cálculo e informar los sitios pendientes.

Por lo tanto, ya no se crea la categoría **Sin región informada**.

## Funciones principales

- Excluye especies naturalizadas, exóticas provisionales, escapes y taxones domésticos.
- Resuelve región y comuna/distrito desde coordenadas cuando eBird o el CSV no las informan.
- Permite ordenar las tablas haciendo clic en sus cabeceras.
- Agrupa oportunidades por país, región, comuna o hotspot.
- Calcula una ruta independiente para cada región seleccionada.
- Optimiza cada recorrido por tiempo y distancia vial entre sitios.

## Servicios

- eBird API 2.0: taxonomía, catálogos, regiones, hotspots y observaciones recientes.
- OSRM / OpenStreetMap: matrices, tiempos, distancias y geometrías viales.
- Nominatim / OpenStreetMap: geocodificación inversa administrativa.
