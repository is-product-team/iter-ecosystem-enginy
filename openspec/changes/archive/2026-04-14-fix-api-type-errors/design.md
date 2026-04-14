## Context

Following a recent refactor of the Prisma schema to use English model and property names (e.g., `Center`, `Workshop`, `Assignment`), the application code in the `api` workspace is failing to compile. The codebase is still using Catalan property names in its Prisma queries (e.g., `prisma.centre`, `prisma.taller`), leading to hundreds of TypeScript errors.

## Goals / Non-Goals

**Goals:**
- Resolve all TypeScript errors in `apps/api`.
- Align all query accessors, relation names, and field names with the generated Prisma client.
- Fix broken many-to-many relations (specifically `Assignment` to `User/Teacher`).
- Standardize the `rootDir` and `shared` package imports in `tsconfig.json`.

**Non-Goals:**
- Changing the external API endpoint surface (REST interface remains unchanged).
- Refactoring business logic beyond what is required for typing.
- Altering the database schema (already updated).

## Decisions

### 1. Naming Mapping Strategy
We will perform a systematic migration of all Prisma-related tokens:

| Catalan (Current Code) | English (Prisma Schema) | Context |
|-------------------------|-------------------------|---------|
| `centre`                | `center`                | Model & Relations |
| `taller`                | `workshop`              | Model & Relations |
| `peticio`               | `request`               | Model & Relations |
| `assignacio`            | `assignment`            | Model & Relations |
| `inscripcio`            | `enrollment`            | Model & Relations |
| `alumne`                | `student`               | Model & Relations |
| `assistencia`           | `attendance`            | Model & Relations |
| `professors`            | `teachers`              | Assignment Relation |
| `data_sessio`           | `data_session`          | Session Field |
| `id_sessio`             | `id_session`            | Session Field |
| `competencia`           | `competence`            | Model & Field |

### 2. Structural Fixes
- **Teachers**: `Assignment` no longer uses `teacher1_id` / `teacher2_id` directly in the schema (it uses `AssignmentTeacher` relation). The code will be updated to use the `teachers` include and relation.
- **Repositories**: Standardize repository constructors to match the new Prisma client types.

### 3. Build System
- Update `tsconfig.json` to include the `shared` package in the build scope via `rootDir: "./"` and `include: ["src/**/*", "../../packages/shared/**/*"]`.

## Risks / Trade-offs

- **Query Depth**: Some queries might become more complex due to nested relations (e.g., fetching teachers through a join table).
- **Manual Labor**: The scale of change is large, requiring careful search-and-replace to avoid replacing user-facing strings or local variables unintentionally.
