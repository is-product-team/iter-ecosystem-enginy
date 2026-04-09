# Propuesta: Finalización de las Fases 3 y 4

## Goal
Hacer que las Fases 3 (Ejecución y Asistencia) y 4 (Evaluaciones y Certificados) sean plenamente funcionales y verificables en el ecosistema Iter. El objetivo es permitir que un taller pase desde el registro diario de asistencia hasta la emisión final de certificados para los alumnos aptos.

## Scope
- **Finalización de Fase 3:** Asegurar que el registro de asistencia en el backend y frontend sea robusto.
- **Implementación de Fase 4:**
  - Integrar la matriz de evaluación por competencias en el flujo de cierre del taller.
  - Implementar la generación automática de certificados (`PDF` o registros digitales) al finalizar la evaluación.
  - Habilitar la consulta de certificados para alumnos y centros.
- **Verificación:** Ejecutar un flujo de prueba completo de punta a punta.

## Motivation
Actualmente existen servicios aislados para evaluaciones y certificados, pero no están integrados en un flujo continuo. La Fase 3 (Asistencia) tiene tareas pendientes que bloquean la Fase 4. Finalizar ambas fases permitirá cerrar el ciclo de vida del producto Iter.
