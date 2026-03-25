## Why

The `api` workspace currently fails to pass the `type-check` gate due to a naming mismatch between the Prisma schema (which uses English model and property names) and the application code (which still references Catalan names like `centre`, `taller`, `alumne`, etc.). This blocks CI/CD pipelines and makes the codebase fragile for future development.

## What Changes

This change will perform a systematic refactor of the API layer to align with the current Prisma schema:
- Rename all Prisma model accessors (e.g., `prisma.centre` -> `prisma.center`).
- Align relation names in `include` and `where` clauses (e.g., `peticio` -> `request`).
- Correct field names in database interactions (e.g., `data_sessio` -> `data_session`).
- Resolve structural errors in many-to-many relations (e.g., `Assignment` teachers).
- Fix dependency and rootDir issues in `tsconfig.json`.

## Capabilities

### New Capabilities
- `api-type-safety`: A fully typed API layer that aligns with the generated Prisma client, allowing for automated verification and reliable deployments.

### Modified Capabilities
- `api`: Updated data access patterns to use English-named models and relations.
- `auth`: Updated user and role relations to match the new schema naming.

## Impact

- **Affected Code**: All files in `apps/api/src/controllers`, `apps/api/src/repositories`, and `apps/api/src/services`.
- **APIs**: No functional changes to the external REST API surface, only internal implementation details and typing.
- **Dependencies**: Potential update to `@types/uuid` and other missing type definitions.
