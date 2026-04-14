# Tareas: Refactorización API Móvil a Inglés

## Fase 1: Refactorización de Servicios API
- [x] Actualizar la función `postAttendance` en `apps/mobile/services/api.ts` para aceptar `sessionNumber`, `status` y `comments`.
- [x] Actualizar o definir interfaces locales para `Assignment` y `Enrollment` en `apps/mobile/services/api.ts` asegurando el uso de `startDate` y `surnames`.

## Fase 2: Actualización de Pantallas y Lógica
- [x] Modificar `apps/mobile/app/(professor)/(tabs)/index.tsx` para usar `startDate` en lugar de `data_inici`.
- [x] Modificar `apps/mobile/app/(professor)/session/[id].tsx` para usar `status`, `comments` y `surnames`.
- [x] Modificar `apps/mobile/app/(professor)/evaluation/[id].tsx` para usar `comments` en lugar de `observacions`.

## Fase 3: Verificación y Pruebas
- [x] Auditar el código buscando cualquier referencia residual a `numero_sessio`, `estat`, `observacions`, `cognoms` o `data_inici`.
- [x] Verificar el flujo completo desde el dashboard hasta el envío de asistencia y evaluación con los nuevos campos.
