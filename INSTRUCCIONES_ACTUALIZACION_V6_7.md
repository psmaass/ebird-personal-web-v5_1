# Actualización v6.7 — objetivo Global Big Day

## Función incorporada

En **Planificar rutas → Objetivo** se agregó:

**Todas las especies (Global Big Day)**

Este modo usa todas las especies presentes en los registros recientes, aunque ya hayan sido observadas personalmente. También conserva las categorías de origen de eBird: Nativa, Naturalizada, Introducida provisional y Escape.

## Cómo optimiza

- Cuenta especies únicas, no la suma repetida de especies entre sitios.
- Selecciona destinos complementarios dentro de cada región.
- Prioriza primero la cantidad de especies nuevas aportadas por una parada.
- Usa distancia y tiempo vial para desempatar rutas con cobertura semejante.
- Permite hasta 10 paradas.

## Actualización

1. Reemplaza el contenido del repositorio por la carpeta `ebird-personal-web-v6_7`.
2. Publica nuevamente en Vercel.
3. Recarga la aplicación con `Ctrl + F5`.
4. Confirma que el encabezado muestre **v6.7 · planificación Global Big Day**.
5. En **Rutas**, selecciona **Todas las especies (Global Big Day)**.
6. Elige país, región, período y nivel de ranking.
7. Presiona **Buscar oportunidades** y luego **Calcular ruta óptima**.

No es necesario volver a importar el CSV ni sincronizar la taxonomía. Sí debes volver a buscar oportunidades y recalcular la ruta para aplicar el nuevo objetivo.

## Alcance operativo

La ruta informa conducción entre sitios. No incluye el traslado hasta la primera parada, el regreso desde la última ni el tiempo de observación. Para una jornada de un día, limita la búsqueda a una región y ajusta el máximo de paradas según el tiempo disponible.
