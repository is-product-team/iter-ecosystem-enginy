# Specification: Testing Infrastructure

This document defines the requirements and standards for the automated testing infrastructure across the Iter Ecosystem.

## 1. Testing Framework: Vitest

All automated tests (Unit, Integration) must use **Vitest**.

### Requirements:
- **Environment**: `node` for backend and shared packages, `jsdom` (if needed later) for web.
- **Transpilation**: Native ESM with `tsx` or `vite` runner support.
- **Configuration**: Each package must have its own `vitest.config.ts`.

## 2. CI/CD Integration

The deployment pipeline must enforce quality gates to prevent regressions in production.

### Quality Gates:
1. **Linting**: No ESLint errors in modified files.
2. **Type-Checking**: No global TypeScript errors (`tsc --noEmit`).
3. **Unit Tests**: 100% pass rate for all unit tests.

### Workflow:
The `.github/workflows/deploy-self-hosted.yml` must include a `verify` job that executes these gates before the `deploy` job starts.

## 3. Implementation Standards

- **Naming**: Test files must end in `.test.ts` or `.spec.ts`.
- **Location**: Place tests alongside the implementation (e.g., `service.ts` next to `service.test.ts`) or in a `__tests__` subdirectory.
- **Mocking**: Use `vi.mock()` for external dependencies and the Prisma client to ensure tests are isolated and fast.
- **Database**: Integration tests needing a database should use a dedicated test schema or in-memory SQLite if possible.

## 4. Priority Areas

Initial test coverage must prioritize high-complexity business logic:
- `AutoAssignmentService`: Fair distribution algorithm verification.
- `NLPService`: Pattern matching for attendance and competency scores.
- `VisionService`: Mock document validation logic.
- `@iter/shared`: Zod schema validation.
