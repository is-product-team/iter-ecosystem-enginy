## Context

The project is currently transitioning from a Catalan-based naming convention to an English-first approach. This transition has stalled in a "hybrid" state where some constants in `@iter/shared` have been translated into English values (e.g., `'Approved'`), while the underlying PostgreSQL database (via Prisma) and the API controllers still expect the original Catalan strings (e.g., `'Aprovada'`). Additionally, ESM import rules in the monorepo are being violated by the use of `.ts` extensions in source files.

## Goals / Non-Goals

**Goals:**
- Resolve all TypeScript errors in the `shared` package to allow `npm run verify` to pass.
- Standardize domain constants (`ROLES`, `REQUEST_STATUSES`, `PHASES`) to ensure binary compatibility with the current database state.
- Audit and refactor `apps/api` to use these standardized constants, eliminating hardcoded strings.

**Non-Goals:**
- Renaming existing database columns or tables via migrations (this task focuses on code-level mapping and constants).
- Full translation of the `apps/mobile` or `apps/web` UI text (outside of functional constants).

## Decisions

### 1. Unified Domain Constants
We will use English keys in `@iter/shared` for developer ergonomics, but the values will match the current database strings (Catalan/Spanish) to avoid immediate data migrations.

```typescript
// @iter/shared/index.ts
export const REQUEST_STATUSES = {
  PENDING: 'Pendent',  // Matches DB
  APPROVED: 'Aprovada', // Matches DB
  REJECTED: 'Rebutjada' // Matches DB
} as const;
```

### 2. ESM Import Compliance
We will remove the `.ts` extension from all internal imports in `@iter/shared`.

### 3. Controller Refactoring
API controllers will be audited to replace logic like `if (status === 'Aprovada')` with `if (status === REQUEST_STATUSES.APPROVED)`.

### Architecture Overview

```text
┌────────────────────────┐      ┌────────────────────────┐
│     @iter/shared       │      │       apps/api         │
│  (English Keys,        │─────▶│  (Uses constants for   │
│   Catalan Values)      │      │   logic and queries)   │
└────────────────────────┘      └────────────────────────┘
            │                               │
            │                               │
            ▼                               ▼
┌────────────────────────┐      ┌────────────────────────┐
│      apps/web          │      │     PostgreSQL DB      │
│  (Uses constants for   │      │   (Stores Catalan      │
│   filters and state)   │      │    strings)            │
└────────────────────────┘      └────────────────────────┘
```

## Risks / Trade-offs

- **Risk**: Updating the value of a shared constant (e.g., from `'Approved'` back to `'Aprovada'`) might break UI components in `apps/web` or `apps/mobile` that were already updated to expect the English string.
- **Mitigation**: Perform a global grep search for the affected strings before applying changes to ensure all references are updated.
