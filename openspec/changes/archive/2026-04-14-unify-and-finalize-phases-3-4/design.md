# Diseño: Unificación y Finalización de las Fases 3 y 4

## Contexto
Actualmente, el sistema registra la asistencia en la Fase 3 y realiza evaluaciones en la Fase 4. Sin embargo, no hay flujo de datos entre ambas; el porcentaje de asistencia en la evaluación es un campo manual o por defecto. Además, el backend tiene lógica duplicada en `attendance.controller` y `assignment.controller`.

## Metas / No-Metas

**Metas:**
- Unificar todos los puntos de entrada de asistencia en `AssignmentController`.
- Implementar el cálculo automático del `%` de asistencia en `EvaluationService` basado en la tabla `Attendance`.
- Refactorizar las rutas de asistencia para ser coherentes con el flujo de `assignments`.
- Ampliar el asistente de voz para soportar múltiples competencias de forma dinámica.

**No-Metas:**
- Cambiar el esquema de la base de datos (se usará el mapeo existente).
- Rediseñar completamente la UI (solo ajustes funcionales).

## Decisiones

### 1. Unificación de Endpoints de Asistencia
Se eliminará `attendance.routes.ts` (y su controlador asociado si queda huérfano) y se consolidará toda la lógica en `assignment.routes.ts`.
- **Razón:** El frontend ya usa mayoritariamente los endpoints bajo `/api/assignments/:id/sessions/...`.

### 2. Sincronización Automática (Fase 3 -> Fase 4)
Al solicitar la evaluación de un alumno, el backend calculará en tiempo real:
- Sesiones totales del taller (de la tabla `sessions`).
- Sesiones marcadas como `PRESENT` o `LATE`.
Este cálculo se inyectará en el objeto de evaluación inicial, asegurando que el profesor vea datos reales.

### 3. Mejora del Asistente de Voz (NLP)
Se modificará el servicio de NLP para que pueda identificar palabras clave de múltiples competencias configuradas, no solo una fija.

## Riesgos / Compensaciones

- **Migración de Endpoints:** Se debe asegurar que el frontend (`attendance/[num]/page.tsx`) apunte correctamente al endpoint unificado.
- **Cálculo de Asistencia:** El cálculo debe manejar casos donde el taller aún no ha terminado pero se están empezando las evaluaciones.

## Diagrama de Flujo de Datos

```text
[Fase 3: Asistencia]
      |
      v
[Tabla: assistencia] <--- (registerAttendance unificado)
      |
      +----------------------------+
      |                            |
[Fase 4: Evaluación] <--- (getEnrollmentEvaluation)
      |                            |
      v                            v
[EvaluationService] <--------- [Calcula stats desde assistencia]
      |
      v
[Tabla: avaluacions] (Refleja % REAL de asistencia)
      |
[POST: Close Assignment]
      |
      v
[PDF Certificate Service] (Validación Final >= 80% real)
```
