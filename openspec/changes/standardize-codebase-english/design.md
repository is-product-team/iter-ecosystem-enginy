## Context

The current codebase uses a mixture of languages. The goal is to move to an English-first codebase internally while preserving Catalan/Spanish for the user interface. This requires changes at the database mapping layer (Prisma), the API layer (contracts), and the frontend components.

## Goals / Non-Goals

**Goals:**
- Standardize all internal symbols (variables, functions, types, constants) to English.
- Use English names for all Prisma models and fields in the TypeScript layer.
- Ensure API request and response payloads use English keys.
- Maintain existing database table and column names in Catalan using Prisma's `@map` and `@@map`.
- Ensure all user-facing strings are handled through i18n and localized.

**Non-Goals:**
- Renaming the physical database tables or columns (out of scope to avoid complex migrations).
- Translating data stored within the database (e.g., descriptions, names).
- Refactoring core business logic (this is strictly a renaming refactor).

## Decisions

### 1. Prisma Mapping Strategy
We will rename all Prisma models to PascalCase English and fields to camelCase English. We will use the `@map` attribute for fields and the `@@map` attribute for models to point to the existing Catalan database names.

**Rationale:** This allows the code to be English-centric while avoiding a dangerous database schema migration that would require data movement.

```prisma
// Example
model Workshop {
  id Int @id @map("id_taller")
  title String @map("titol")
  @@map("tallers")
}
```

### 2. API Layer Transformation
The API layer will be refactored to use the new English Prisma model names. All API routes and controllers will be updated to reflect the standardized English naming.

**Flow:**
```
[Frontend (English Property)] 
      ──▶ [API Request (English Key)] 
            ──▶ [Express Controller (English Variable)] 
                  ──▶ [Prisma Client (English Model/Field)] 
                        ──▶ [Database (Catalan Table/Column via @map)]
```

### 3. Shared Zod Schemas
Zod schemas in the `shared` package will be renamed and updated to use English property names, matching the new Prisma fields.

## Risks / Trade-offs

- **[Risk] Breaking Frontend/Mobile**: Renaming API keys will break the frontend and mobile apps if not updated simultaneously. → **Mitigation**: Update API and frontends in coordinated, incremental steps or use a "Big Bang" approach within a single feature branch.
- **[Risk] Missing Refactors**: Some hidden Catalan strings or variables might be missed in a large refactor. → **Mitigation**: Use thorough grep searches and TypeScript compiler errors to ensure all references are updated.
- **[Risk] Breaking Excel Imports**: Excel imports often rely on specific Catalan header names. → **Mitigation**: Add a mapping layer in the import controller that explicitly maps Catalan headers to the new English internal fields.

## Migration Plan

1. **Phase 1: Prisma & Shared**: Update the Prisma schema with `@map` and rename models/fields. Regenerate the Prisma client. Update Zod schemas.
2. **Phase 2: API Refactor**: Systematically rename controllers, services, and routes in the `apps/api` package. Update variable names and API contracts.
3. **Phase 3: Frontend Refactor**: Update the `apps/web` and `apps/mobile` apps to consume the new English API contracts.
4. **Phase 4: i18n Audit**: Ensure all user-facing strings are correctly localized and not hardcoded in Catalan/Spanish within the components.
