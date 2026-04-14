## ADDED Requirements

### Requirement: Hero Card para la próxima sesión
La pantalla de inicio SHALL mostrar una tarjeta protagonista (Hero Card) con ancho completo que presente la próxima sesión o asignación del profesor. La tarjeta SHALL incluir el título del taller, nombre del centro, fecha y hora, y un acceso directo al detalle.

#### Scenario: Hay una próxima sesión disponible
- **WHEN** el profesor abre la pantalla de inicio y tiene asignaciones con sesiones futuras
- **THEN** el sistema muestra la Hero Card con los datos de la sesión más próxima (taller, centro, fecha, hora)

#### Scenario: No hay sesiones próximas
- **WHEN** el profesor abre la pantalla de inicio y no tiene asignaciones activas ni sesiones futuras
- **THEN** el sistema muestra la Hero Card en estado vacío con un mensaje descriptivo y un acceso al calendario

#### Scenario: Acceso al detalle desde Hero Card
- **WHEN** el profesor pulsa sobre la Hero Card
- **THEN** el sistema abre el modal de detalle de la asignación correspondiente

### Requirement: Grid 2×2 de accesos rápidos
La pantalla de inicio SHALL mostrar un grid de dos columnas con cuatro tarjetas compactas de acceso rápido para: Notificaciones (con badge de no leídas), Fase Activa (nombre de la fase actual), Coordinación, y Evaluaciones pendientes.

#### Scenario: Hay notificaciones sin leer
- **WHEN** el profesor tiene notificaciones no leídas
- **THEN** la tarjeta de Notificaciones SHALL mostrar un badge con el número de notificaciones pendientes

#### Scenario: Sin notificaciones pendientes
- **WHEN** el profesor no tiene notificaciones sin leer
- **THEN** la tarjeta de Notificaciones SHALL mostrarse sin badge

#### Scenario: Acceso a Coordinación desde grid
- **WHEN** el profesor pulsa la tarjeta de Coordinación
- **THEN** el sistema navega a la pantalla de coordinación

### Requirement: Header contextual dinámico
El header de la pantalla de inicio SHALL mostrar un saludo sensible al momento del día (buenos días / buenas tardes) y un subtexto contextual derivado del estado actual de las sesiones del profesor.

#### Scenario: El profesor tiene una sesión hoy
- **WHEN** el profesor abre la pantalla y hay una sesión programada para el día actual
- **THEN** el subtexto SHALL mostrar "Tienes una sesión hoy"

#### Scenario: El profesor no tiene sesiones hoy pero sí próximamente
- **WHEN** no hay sesión hoy pero sí en los próximos días
- **THEN** el subtexto SHALL indicar "Tu próxima sesión es el [fecha]"

#### Scenario: Sin sesiones próximas
- **WHEN** el profesor no tiene ninguna sesión o asignación futura
- **THEN** el subtexto SHALL mostrar "Sin sesiones próximas"
