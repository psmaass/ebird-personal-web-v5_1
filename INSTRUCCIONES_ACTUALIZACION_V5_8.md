# Actualización v5.8 — Índice de confiabilidad por especie y sitio

## Función nueva

Al calcular las rutas regionales, la aplicación evalúa cada especie objetivo en cada sitio mediante un índice operativo de 0 a 100.

El índice combina:

- 35% distribución reciente: cantidad de lugares regionales y lugares dentro de 50 km.
- 30% época del año: presencia en la misma fecha durante los cinco años anteriores.
- 35% actividad del último mes: recencia, cantidad de lugares y proporción de registros aceptados.
- Penalización de 12 puntos si el registro del sitio es provisional.

No representa una probabilidad estadística de detección. Sirve para comparar la solidez de las oportunidades recientes.

## Actualizar GitHub

Reemplaza el contenido del repositorio por el contenido de `ebird-personal-web-v5_8`.

Verifica especialmente:

- `index.html`
- `public/index.html`
- `api/ebird.js`

No se agregan nuevas variables de entorno. Mantén únicamente `EBIRD_API_KEY`.

Después del commit, espera el despliegue de Vercel y recarga con `Ctrl + F5`.

## Uso

1. Sincroniza eBird.
2. Busca oportunidades.
3. Selecciona destinos.
4. Presiona **Calcular ruta óptima**.
5. La aplicación consultará evidencia reciente e histórica de las especies seleccionadas.
6. En cada parada abre **Ver confiabilidad por especie**.

Las consultas quedan en caché local para evitar repetirlas durante varias horas.
