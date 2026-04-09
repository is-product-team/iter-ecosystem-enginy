# Tareas: Finalización de la Fase 3 - Asistencia

## Fase 1: Backend Implementation
- [x] Implementar `getSessionAttendance` en `assignment.controller.ts` <!-- id: 10 -->
- [x] Implementar `registerAttendance` en `assignment.controller.ts` <!-- id: 11 -->
- [x] Refactorizar `SessionService.ensureAttendanceRecords` para manejar mejor la re-inicialización <!-- id: 12 -->
- [x] Añadir validación de tipos Zod para el envío masivo de asistencia <!-- id: 13 -->

## Fase 2: Web Frontend Development
- [x] Crear la página de registro de asistencia `/center/sessions/[id]/attendance/[num]` <!-- id: 20 -->
- [x] Desarrollar el componente de tabla de asistencia con estados editables <!-- id: 21 -->
- [x] Añadir botón "Record Attendance" en la lista de sesiones general <!-- id: 22 -->
- [x] Implementar lógica de guardado masivo con feedback visual (Sonner toast) <!-- id: 23 -->

## Fase 3: Verification
- [x] Actualizar el script `apps/api/scripts/verify-phase3.ts` para probar los nuevos endpoints <!-- id: 30 -->
- [x] Realizar prueba manual de flujo completo: Generar sesión -> Entrar en asistencia -> Guardar cambios -> Verificar en DB <!-- id: 31 -->
- [x] Comprobar consistencia de tipos entre API y Web <!-- id: 32 -->
