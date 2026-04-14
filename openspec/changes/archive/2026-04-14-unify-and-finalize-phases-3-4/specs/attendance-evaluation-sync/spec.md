## ADDED Requirements

### Requirement: Automatic Attendance Synchronization
El sistema debe calcular automáticamente el porcentaje de asistencia y el número de retardos de un alumno basándose en sus registros de asistencia para un taller específico, e inyectar estos datos en la pantalla de evaluación.

#### Scenario: Pre-filling evaluation with real data
- **WHEN** El profesor accede a la pantalla de evaluación de un alumno (`enrollmentId`).
- **THEN** El backend debe devolver `attendancePercentage` y `lateCount` calculados a partir de la tabla `Attendance`, en lugar de valores por defecto.
