# Propuesta: Rediseño UX Mobile - Asistencia y Gestión de Sesiones

## Resumen
Esta propuesta describe el rediseño de la interfaz móvil para profesores, centrándose en la pantalla de detalles de sesión (`SessionScreen`). El objetivo es transformar una lista de tareas densa y confusa en un flujo de trabajo intuitivo que se adapte al momento real de la clase, proporcionando "paz mental" al usuario mediante la separación de contextos.

## Problemas Actuales
1.  **Carga Cognitiva Alta**: La interfaz actual mezcla la asistencia (logística rápida) con la evaluación y observaciones (análisis pausado).
2.  **Falta de Intuición**: El cambio de estado de asistencia mediante toques cíclicos no es evidente y propicia errores accidentales.
3.  **Ruido Visual**: Uso excesivo de bordes y falta de jerarquía, lo que dificulta encontrar la información crítica de un vistazo.

## Objetivos
- **Separación de Contextos**: Crear un flujo secuencial: "Pasar Lista" -> "Cerrar Lista" -> "Trabajar/Evaluar".
- **Comodidad y Seguridad**: Implementar mecanismos de asistencia que eviten el error accidental (Selectores Seguros o Gestos).
- **Estética "Airy"**: Un diseño intermedio que use el espacio en blanco (aire) para mejorar la lectura sin comprometer la densidad de información.

## Alcance
- Rediseño de la lógica y UI de `apps/mobile/app/(professor)/session/[id].tsx`.
- Creación de componentes compartidos para estados de asistencia.
- Mejora de la jerarquía visual en tarjetas de alumnos.

## Resultados Esperados
- Una reducción significativa en los toques accidentales al pasar lista.
- Mayor velocidad de operación al inicio de la clase.
- Una experiencia de usuario percibida como "Premium" y "Acompañante", no como una carga administrativa.
