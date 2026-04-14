## Why

La pantalla de inicio (Dashboard) del mobile tiene actualmente un diseño tipo lista plana que no establece una jerarquía visual clara. El profesor llega a la aplicación y todos los elementos tienen el mismo peso visual, sin un punto de atención dominante. Se busca rediseñarla con un enfoque de Apple iOS moderno: una Hero Card protagonista para la próxima sesión, un grid 2×2 de accesos rápidos, y un contexto del header sensible al estado del día.

## What Changes

- **Nuevo Hero Card para próxima sesión:** Tarjeta grande y prominente que ocupa la parte superior del contenido, mostrando la sesión o asignación más urgente del profesor con fecha, hora, nombre del taller y centro.
- **Grid 2×2 de accesos rápidos:** Cuatro tarjetas compactas y cuadradas que sustituyen a los `DashboardItem` actuales para Notificaciones (con badge), Fase Activa, Coordinación y Evaluaciones pendientes.
- **Header contextual:** El saludo del header mostrará información sensible al momento (ej. "Tienes una sesión hoy", "Sin sesiones próximas", "Buenos días").
- **Eliminación del patrón WhatsApp-list:** Los `DashboardItem` dejarán de ser la estructura principal. Las listas solo se usarán para elementos secundarios como asignaciones pasadas o información adicional.
- **Uso de componentes UI reutilizables:** `Button`, `FormGroup`, `TextInput` ya creados junto con nuevas variantes de Card que seguirán el mismo sistema de diseño.

## Capabilities

### New Capabilities
- `mobile-dashboard`: Rediseño visual completo de la pantalla de inicio del profesor en la app mobile con Hero Card, accesos rápidos y header contextual.

### Modified Capabilities
- (ninguna)

## Impact

- **Código afectado:** `apps/mobile/app/(professor)/(tabs)/index.tsx`
- **Componentes nuevos posibles:** `HeroCard`, `QuickAccessGrid` en `apps/mobile/components/dashboard/`
- **Sin cambios de API:** No se añaden ni modifican endpoints. Los datos ya se obtienen correctamente.
- **Sin cambios en navegación:** Las rutas y el sistema de tabs permanecen iguales.
