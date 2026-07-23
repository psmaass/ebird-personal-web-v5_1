# Actualización v6.4

Esta versión corrige la discordancia entre el total personal mostrado por la aplicación y el total de eBird.

## Correcciones

- Las filas del CSV con `Exotic Code` **ya no se descartan** durante la importación.
- El total **Vistas en el país (total eBird)** cuenta todas las especies registradas en el CSV, incluidas naturalizadas, provisionales y escapes.
- Se agrega un indicador independiente de **Vistas nativas en el país**.
- El catálogo de Especies muestra y permite filtrar el origen taxonómico.
- Los taxones domésticos que poseen `reportAs` se consolidan primero bajo la especie aceptada.
- Las rutas y oportunidades continúan usando únicamente especies nativas.
- El diagnóstico muestra la conciliación por país y enumera las especies introducidas detectadas.

## Actualización obligatoria

1. Reemplaza `index.html` y `public/index.html` por los archivos de esta versión.
2. Publica el cambio y recarga con `Ctrl + F5`.
3. Verifica que la aplicación muestre **v6.4**.
4. Presiona **Sincronizar eBird**.
5. **Vuelve a importar `MyEBirdData.csv`**. Las versiones anteriores descartaban físicamente las filas introducidas, por lo que no pueden recuperarse desde IndexedDB sin reimportar el CSV.
6. Revisa la sección **Datos y configuración → Diagnóstico**. Allí aparecerá el total compatible con eBird, el total nativo y las especies que explican la diferencia.
