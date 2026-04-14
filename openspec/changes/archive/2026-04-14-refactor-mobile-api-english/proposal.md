# Propuesta: Refactorización API Móvil a Convenciones en Inglés

## Goal
Alinear la aplicación móvil con las nuevas convenciones de la API, cambiando los nombres de parámetros y propiedades de catalán a inglés para mejorar la consistencia del monorepo y la integración con el backend.

## Scope
- Refactorizar `apps/mobile/services/api.ts` para usar nombres en inglés en `postAttendance` (`sessionNumber`, `status`, `comments`).
- Actualizar las interfaces de `Assignment` y `Enrollment` en la app móvil para usar `startDate` y `surnames`.
- Auditar y actualizar todos los componentes en `apps/mobile/app/` para eliminar referencias a las propiedades antiguas (`numero_sessio`, `estat`, `observacions`, `data_inici`, `cognoms`).
- Asegurar que la lógica de negocio (ordenación, filtrado) en el dashboard y pantallas de sesión funcione correctamente con los nuevos nombres.

## Motivation
La API ha migrado a una nomenclatura en inglés para estandarizar el desarrollo. Mantener términos en catalán en la app móvil genera confusión, errores de tipo y dificulta el mantenimiento a largo plazo. Esta refactorización es necesaria para evitar regresiones y facilitar la evolución del sistema.
