## Why

The codebase currently suffers from a "linguistic identity crisis," mixing Catalan, Spanish, and English across variable names, API contracts, Prisma schemas, and frontend components. This inconsistency leads to maintenance overhead, onboarding friction, and literal bugs (e.g., in Excel imports where field names are mixed up). Standardizing the internal codebase to English is essential for professional standards, tool compatibility (like Copilot/LLMs), and system reliability.

## What Changes

- **Codebase Standardization**: All internal variables, functions, and file names will be transitioned to English.
- **Prisma Schema Alignment**: Models and fields will be renamed to English camelCase/PascalCase, using `@map` and `@@map` to maintain compatibility with the existing Catalan database structure.
- **API Contract Update**: **BREAKING** API response and request payloads will be standardized to English.
- **Shared Schemas & Constants**: Zod validation schemas and shared constants will be updated to match the English naming convention.
- **Frontend Refactor**: React components in both Web and Mobile apps will be updated to consume the new English API contracts and internal property names.
- **Internationalization (i18n)**: Ensure that while the *code* is English, the *user interface* remains fully localized in Catalan and Spanish using i18n libraries.

## Capabilities

### New Capabilities
- `i18n-standardization`: Formalizing the separation between internal code language (English) and external UI language (Catalan/Spanish) across all apps.

### Modified Capabilities
- `api-core`: Standardizing naming across all core API endpoints.
- `database-schema`: Updating the Prisma schema naming conventions.
- `mobile-api`: Refactoring mobile-specific API interactions to use the new English contracts.
- `web-admin`: Updating admin-facing web components to match new data structures.

## Impact

- **Database**: No direct impact on table/column names (preserved via `@map`), but requires a Prisma client regeneration.
- **API**: Breaking changes for all consumers of the API (Web and Mobile).
- **Shared Library**: Significant updates to Zod schemas used for validation.
- **Maintenance**: Improved developer experience and reduced risk of naming-related bugs.
