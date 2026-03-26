## 1. Shared Constants & Types

- [x] 1.1 Add `ASSIGNMENT_STATUSES` to `/shared/index.ts` containing all enum values from Prisma.
- [/] 1.2 Export `ASSIGNMENT_STATUSES` and ensure ESM compatibility. (Fixing module resolution in Web)

## 2. Backend (API) Refactor

- [x] 2.1 Refactor `ReminderService.ts`: Standardize notifications to Catalan and fix "rprogramada" typo.
- [x] 2.2 Refactor `TetrisService.ts`: Replace hardcoded status strings with shared constants and standardize language.
- [x] 2.3 Refactor `PeticioController.ts`: Standardize error messages to Catalan (fix "ya" -> "ja") and clean up redundant checks.

## 3. Frontend (Web) Refactor

- [x] 3.1 Refactor `ChartComponents.tsx`: Replace hardcoded categories and fallback logic with `@iter/shared` constants.
- [x] 3.2 Audit other UI views for hardcoded status labels and replace them with shared logic.

## 4. Verification

- [x] 4.1 Run `npm run verify` to ensure no TypeScript or Linting regressions.
- [x] 4.2 Verify Docker build and runtime connectivity.
- [x] 4.3 Manually verify notification content and chart rendering.
