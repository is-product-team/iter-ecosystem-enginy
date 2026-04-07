# Diseño: Estandarización de Nombres en Prisma y API

## Estrategia Técnica

### 1. Auditoría y Corrección de Prisma Schema
Se realizará una revisión exhaustiva de `apps/api/prisma/schema.prisma` para asegurar que:
- Todos los campos usen **CamelCase** para su nombre de propiedad en TypeScript.
- Se utilice el atributo `@map("nombre_columna_db")` para mantener la compatibilidad con la base de datos existente (snake_case/Catalan).
- Las relaciones estén correctamente nombradas y mapeadas.

### 2. Sincronización del Cliente (`prisma generate`)
- Se ejecutará una limpieza de `node_modules/.prisma` para eliminar cualquier versión anterior "cacheada" o mal generada.
- Se ejecutará `npx prisma generate --schema=apps/api/prisma/schema.prisma`.
- Se verificará que el archivo generado en `node_modules/@prisma/client/index.d.ts` contenga las propiedades en CamelCase.

### 3. Refactorización Sistemática del API
Se actualizarán los archivos clave para eliminar el uso de `as any` y nombres en snake_case:
- **`AssignmentController.ts`**: Actualizar todos los métodos (list, get, attendance) para usar `assignmentId`, `enrollmentId`, `sessionNumber`, etc.
- **`SessionService.ts`**: Cambiar nombres de campos en las consultas de `Session` y `Attendance`.
- **`RequestController.ts`** (si aplica): Verificar consistencia en la gestión de peticiones.

### 4. Plan de Validación de Tipos
La validación se considerará exitosa cuando:
1.  `npx tsc --noEmit` en el subproyecto `api` no devuelva errores de acceso a propiedades en los modelos de Prisma.
2.  Los tests de integración (como `verify-phase3.ts`) funcionen utilizando los nuevos nombres CamelCase.
3.  El Frontend siga funcionando sin cambios (ya que el API ya devolvía CamelCase gracias al mapeo manual previo).

## Riesgos y Mitigaciones
- **Riesgo**: Algún campo que no tenga `@map` podría dejar de funcionar si la DB lo esperaba en snake_case.
- **Mitigación**: Revisar exhaustivamente el schema comparándolo con la base de datos real (vía `Adminer` o `sql shell`).
