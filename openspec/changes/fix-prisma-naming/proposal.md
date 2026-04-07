# Propuesta: Estandarización de Nombres en Prisma y API

## Goal
Resolver las inconsistencias de nomenclatura entre el esquema de Prisma (English/CamelCase) y el cliente generado (Snake_case/Catalan), eliminando los errores de lint actuales y los "workarounds" de tipo `as any` en los controladores del API.

## Scope
- **Prisma Schema & Client**: Asegurar que `@prisma/client` use correctamente los nombres de propiedad en inglés (`assignmentId`, `enrollmentId`) independientemente del mapeo en la base de datos.
- **Refactorización de Controladores**: Actualizar `AssignmentController`, `SessionService` y otros archivos afectados para usar exclusivamente CamelCase, eliminando el uso de nombres en snake_case (`id_assignment`, `id_enrollment`).
- **Eliminación de cast `as any`**: Restaurar la seguridad de tipos en las consultas de Prisma.
- **Consistencia API**: Verificar que las respuestas JSON del API sigan siendo consistentes con lo que espera el Frontend.

## Motivation
Actualmente existe un desfase crítico entre la arquitectura deseada (en inglés) y el estado del cliente generado por Prisma en el entorno local. Esto ha provocado que el código nuevo de la Fase 3 tenga que usar nombres "feos" y casting `as any` para compilar, introduciendo deuda técnica y dificultando el mantenimiento. Estandarizar esto es vital para la salud del proyecto a largo plazo.
