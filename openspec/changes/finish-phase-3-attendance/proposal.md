# Propuesta: Finalización de la Fase 3 - Registro de Asistencia

## Goal
Completar la funcionalidad central de la Fase 3 (Ejecución) mediante la implementación del sistema de registro de asistencia tanto en el backend como en el frontend, permitiendo a los centros documentar la ejecución real de los talleres.

## Scope
- **Backend:** Implementar los controladores `getSessionAttendance` y `registerAttendance` en el `AssignmentController`.
- **Lógica de Negocio:** Asegurar que los registros de asistencia se inicialicen correctamente para todos los alumnos matriculados al iniciar una sesión.
- **Frontend:** Añadir una interfaz de usuario en la aplicación web para permitir a los coordinadores/profesores marcar la asistencia (Presente, Ausente, Tarde, Justificada) de cada alumno en las sesiones programadas.
- **Navegación:** Integrar el acceso al registro de asistencia desde el dashboard de sesiones.

## Motivation
Actualmente, la Fase 3 permite gestionar sesiones y equipo docente, pero el núcleo de la fase —el seguimiento de la asistencia— está bloqueado por endpoints no implementados (501) y la falta de interfaz. Sin esto, no es posible generar las evaluaciones finales ni los certificados (Fase 4), rompiendo el flujo del programa Iter.
