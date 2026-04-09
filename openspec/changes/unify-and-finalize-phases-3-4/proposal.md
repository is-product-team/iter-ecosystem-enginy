# Propuesta: Unificación y Finalización de las Fases 3 y 4

## Goal
Hacer que el flujo desde el registro de asistencia hasta la generación de certificados sea coherente, automático y robusto. El objetivo es eliminar duplicidades en el backend y asegurar que la evaluación se base en datos reales de asistencia.

## What Changes
- **Unificación de Asistencia:** Consolidar la lógica de `attendance.controller.ts` y `assignment.controller.ts` en un único flujo bajo `assignments`.
- **Integración de Datos Fase 3-4:** Automatizar el cálculo de porcentaje de asistencia y retardos en el servicio de evaluación.
- **Robustez en el Cierre:** Asegurar que el proceso de cierre valide concienzudamente todos los requisitos antes de emitir certificados.
- **Mejora del Asistente de Voz:** Ampliar el soporte del NLP para manejar múltiples competencias.

## Capabilities

### New Capabilities
- `attendance-evaluation-sync`: Sincronización automática de métricas de asistencia en la matriz de evaluación.
- `nlp-multi-competence`: Capacidad del asistente de voz para procesar múltiples tipos de competencias.

### Modified Capabilities
- `session-attendance`: Refactorización de la gestión de sesiones para soportar fechas flexibles y secuencia lógica.
- `workshop-closing`: Mejora del flujo de cierre con validaciones completas y generación de certificados PDF.

## Impact
- **Backend:** Modificaciones en `AssignmentController`, `EvaluationService`, y `SessionService`.
- **Frontend:** Actualización de las páginas de asistencia y evaluación para consumir los nuevos endpoints unificados.
- **Database:** Asegurar que las relaciones entre `Attendance` y `Evaluation` sean claras para el reporte final.
