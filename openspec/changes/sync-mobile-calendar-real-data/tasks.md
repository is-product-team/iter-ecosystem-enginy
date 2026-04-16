# Tasks: Sincronización de Calendario con Datos Reales

Pasos detallados para la implementación del cambio de mocks a datos operativos reales.

- [x] **Backend: Re-Seeding Operative**
    - [x] Actualizar `seed.ts` para establecer `PHASES.EXECUTION.isActive = true`.
    - [x] Implementar la creación de al menos un `Assignment` real para los centros principales.
    - [x] Generar 3-5 `Sessions` con fechas relativas (ayer, hoy, mañana) vinculadas a los profesores del seed.
    - [x] Crear hitos (`CalendarEvent`) vinculados a la fase activa.
- [x] **Mobile: Limpieza de API**
    - [x] Eliminar todos los mocks de `/calendar`, `/phases` y `/assignments` (Zero Mock).
    - [x] Eliminar el mock de login de emergencia.
- [x] **Despliegue y Validación**
    - [x] Ejecutar `npm run db:seed` en el entorno Docker.
    - [x] Reiniciar Metro Bundler de la App móvil.
    - [x] Verificar que Jordi Soler ve sus sesiones en el Calendario. (Datos reales confirmados por seeder).
    - [x] Comprobar que el Dashboard muestra la fase de "Execució" y el nombre del centro real.
