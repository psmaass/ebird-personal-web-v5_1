# Actualización v7.0 — Rutas con histórico EBD Chile

## Cambios principales

- El módulo Rutas combina el histórico EBD procesado con la API reciente de eBird.
- Cobertura histórica incluida en esta entrega: 2024-01-01 a 2026-07-31.
- Períodos disponibles: 30, 60, 90, 120, 180, 270 y 365 días.
- 30 días usa la API reciente.
- Para 60–365 días se combina el histórico EBD con los últimos 30 días disponibles en la API.
- El histórico está dividido por región en `public/data/history/`, evitando cargar los 1,42 millones de registros agregados de todo Chile cuando se selecciona una región específica.
- La selección `Todos los posibles` selecciona automáticamente todos los destinos elegibles encontrados.
- El cálculo vial mantiene un máximo técnico de 45 sitios por región por consulta OSRM.
- El histórico se cruza por nombre científico con la taxonomía actual cargada por la aplicación; especies no presentes en el catálogo actual no entran a Rutas.

## Datos históricos incluidos

- 1.422.689 filas agregadas especie/sitio/año/mes.
- 16 regiones.
- Fuente: EBD Chile procesado localmente.
- Los archivos 2021–2023 podrán incorporarse posteriormente regenerando los fragmentos históricos.

## GitHub / Vercel

Sube todo el contenido del proyecto, incluida la carpeta `public/data/history`. No subas solamente el ZIP. Mantén `EBIRD_API_KEY` en las variables de entorno de Vercel.
