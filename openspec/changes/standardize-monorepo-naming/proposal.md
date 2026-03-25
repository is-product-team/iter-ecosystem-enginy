## Why

The monorepo currently suffers from a "hybrid" language state (English/Catalan) that has introduced several critical issues:
- **Build Failure**: TypeScript errors in `@iter/shared` due to incorrect ESM imports (using `.ts` extensions).
- **Logic Mismatches**: Shared constants (e.g., `REQUEST_STATUSES`) use English values that do not match the Catalan strings stored in the database, breaking API logic and UI filters.
- **Inconsistency**: A mix of hardcoded strings and constants across the API and Web workspaces makes the codebase hard to maintain and prone to bugs.

Standardizing this now is essential for a "professional" and stable development environment.

## What Changes

- **Fix @iter/shared Imports**: Remove illegal `.ts` extensions in import statements to satisfy TypeScript's ESM rules.
- **Constant Standardization**: Update `ROLES`, `REQUEST_STATUSES`, and `PHASES` in `@iter/shared` to ensure their values match the actual database schema while keeping keys in English.
- **API Controller Audit**: Refactor `apps/api` (specifically `assignacio.controller.ts` and others) to stop using hardcoded strings and instead rely on the standardized constants from `@iter/shared`.
- **Prisma Schema Alignment**: Verify and documented the mapping between English Prisma models and Catalan database tables/fields to prevent future regressions.

## Capabilities

### Modified Capabilities
- `shared`: Standardize domain constants and fix monorepo type-check issues.
- `database`: Ensure consistent entity mapping between the English-first schema and the Catalan-mapped database.

## Impact

1. **@iter/shared**: Changes to `index.ts` and `theme.ts` imports.
2. **apps/api**: Widespread refactoring of controllers and services to use shared constants.
3. **apps/web**: Potential updates to UI components that rely on the affected constants.
4. **Maintenance**: Significant improvement in codebase legibility and "professional" feel by following a strict English-first convention with explicit DB mapping.
