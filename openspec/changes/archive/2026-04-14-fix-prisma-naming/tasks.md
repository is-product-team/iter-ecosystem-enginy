# Tareas: Estandarización de Nombres en Prisma y API

## Fase 1: Sincronización del Entorno
- [x] Limpiar caché de Prisma y regenerar cliente con `npx prisma generate` <!-- id: 10 -->
- [x] Auditar `schema.prisma` y asegurar que todos los campos relevantes tengan `@map` <!-- id: 11 -->
- [x] Verificar que el autocompletado del IDE reconozca las propiedades en CamelCase <!-- id: 12 -->

## Fase 2: Refactorización del Código
- [x] Actualizar `AssignmentController.ts`: Eliminar `as any` y usar nombres CamelCase <!-- id: 20 -->
- [x] Actualizar `SessionService.ts`: Eliminar `as any` y usar nombres CamelCase <!-- id: 21 -->
- [x] Revisar otros controladores para asegurar consistencia global <!-- id: 22 -->

## Fase 3: Fase 3: Verification
- [x] Ejecutar `npx tsc --noEmit` en el subproyecto `api` <!-- id: 30 -->
- [x] Ejecutar script de verificación con los nuevos nombres de campo <!-- id: 31 -->
- [x] Verificar que el Frontend sigue consumiendo los datos correctamente <!-- id: 32 -->
