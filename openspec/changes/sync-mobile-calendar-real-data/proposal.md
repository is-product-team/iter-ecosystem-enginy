# Proposal: Sincronización de Calendario con Datos Reales

Este cambio tiene como objetivo dotar a la base de datos de los registros necesarios para que la App móvil sea plenamente operativa y veraz sin depender de mocks, alineando el estado del sistema con la Fase 3 (Execució) solicitada por el usuario.

## Problema

Actualmente, el calendario móvil se muestra vacío para Jordi Soler y otros profesores porque:
1. El seeder no crea registros en `Assignment` ni `Session` vinculados a los profesores.
2. El sistema está configurado por defecto en la fase de `Solicitud` (Fase 1), lo que oculta el flujo de ejecución en el Dashboard y Calendario.
3. Los hitos de las fases (milestones) no existen en la tabla `CalendarEvent` del calendario.

## Solución Propuesta

### 1. Actualización de Datos (Back/Seeder)
- **Fase Activa**: Configurar `PHASES.EXECUTION` como la fase activa por defecto en el seeder.
- **Asignaciones**: Crear registros de `Assignment` para los talleres del catálogo en los centros piloto.
- **Agenda Real**: Generar una serie de `Sessions` programadas para el mes corriente para cada profesor del seed, permitiendo que el calendario móvil las pinte automáticamente.
- **Hitos**: Insertar eventos de tipo `milestone` en `CalendarEvent` para marcar hitos del programa (Inicio de talleres, Seguimiento, etc.).

### 2. Limpieza de App Móvil
- **Remoción de Mocks**: Desactivar los interceptores de fallback en `apps/mobile/services/api.ts` para los endpoints de `/calendar`, `/phases` y `/assignments`. Esto forzará el uso de datos del backend real.

## Resultados Esperados

- Jordi Soler y otros profesores verán sus sesiones programadas en el Calendario de la App.
- El Dashboard mostrará la fase de "Execució" y los KPIs correspondientes.
- Desaparecerán las discrepancias visuales entre lo que hay en base de datos y lo que la App muestra.
