## 1. Componentes de Dashboard

- [x] 1.1 Crear `apps/mobile/components/dashboard/HeroCard.tsx` con el diseño de tarjeta grande para la próxima sesión (taller, centro, fecha, hora, estado vacío si no hay sesión)
- [x] 1.2 Crear `apps/mobile/components/dashboard/QuickAccessGrid.tsx` con el grid 2×2 que incluye las cuatro tarjetas compactas (Notificaciones con badge, Fase Activa, Coordinación, Evaluaciones)

## 2. Refactorizar la pantalla de inicio

- [x] 2.1 Actualizar `apps/mobile/app/(professor)/(tabs)/index.tsx`: eliminar los `DashboardItem` y `SectionHeader` del render principal
- [x] 2.2 Integrar `HeroCard` como elemento focal principal justo debajo del header
- [x] 2.3 Integrar `QuickAccessGrid` debajo de la Hero Card como bloque de accesos secundarios
- [x] 2.4 Implementar el header contextual dinámico: saludo según hora del día y subtexto adaptado al estado de sesiones (`getContextualGreeting()`)

## 3. Limpieza y verificación

- [x] 3.1 Eliminar los componentes locales `DashboardItem` y `SectionHeader` del archivo `index.tsx` si ya no se usan en ningún otro lugar
- [x] 3.2 Verificar estados vacíos: sin sesiones, sin fase activa, sin notificaciones
