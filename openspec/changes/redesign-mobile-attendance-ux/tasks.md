# Tareas: Rediseño UX Mobile - Asistencia y Gestión de Sesiones

## Fase 1: Preparación y Componentes
- [x] Analizar en profundidad `apps/mobile/app/(professor)/session/[id].tsx` para extraer la lógica de datos.
- [x] Crear el componente `AttendanceSegmentedControl` para la selección clara de estados (Presente, Ausente, Tarde).
- [x] Crear el componente `StudentSessionCard` rediseñado con más aire, sombras suaves y jerarquía limpia.

## Fase 2: Implementación de Lógica de Modos
- [x] Introducir el estado `sessionMode` para alternar entre "Modo Asistencia" y "Modo Trabajo".
- [x] Refactorizar el manejo de asistencia para evitar el "ciclo de toques" y usar la selección directa.
- [x] Implementar la persistencia local temporal de la lista para evitar pérdida de datos antes del envío.

## Fase 3: Interfaz y UX (Paz Mental)
- [x] Reestructurar el layout principal de la sesión para mostrar el "Momento 1" (Asistencia) por defecto.
- [x] Implementar la pantalla de "Éxito" o transición visual tras enviar la lista.
- [x] Activar el "Momento 2" (Evaluación) automáticamente tras el envío exitoso de la asistencia.
- [x] Añadir espaciado vertical extra (`mb-5` o similar) y revisar radios de curvatura en las tarjetas.

## Fase 4: Verificación y Pulido
- [x] Probar el flujo completo: Entrada -> Pasar Lista -> Confirmar -> Evaluar.
- [x] Verificar que los estados de "Evaluado" se mantienen visibles en el modo trabajo.
- [x] Ajustar contrastes de texto para asegurar la legibilidad en entornos con mucha luz (aulas).
