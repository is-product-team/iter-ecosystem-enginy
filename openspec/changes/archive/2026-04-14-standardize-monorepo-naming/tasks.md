## 1. @iter/shared Cleanup

- [x] 1.1 Remove `.ts` extension from `import { THEME } from './theme.ts'` in `index.ts`.
- [x] 1.2 Update `REQUEST_STATUSES` values to match Prisma/DB strings:
    - `PENDING: 'Pendent'`
    - `APPROVED: 'Aprovada'`
    - `REJECTED: 'Rebutjada'`
- [x] 1.3 Update `ROLES` values to match database strings:
    - `ADMIN: 'ADMIN'`
    - `COORDINATOR: 'COORDINADOR'`
    - `TEACHER: 'PROFESSOR'`
- [x] 1.4 Perform a global search for `'Approved'` and `'Teacher'` to ensure no UI components are broken by the value change.

## 2. API Controller Refactoring

- [x] 2.1 Audit `apps/api/src/controllers/assignacio.controller.ts` and replace all hardcoded role and status strings with `@iter/shared` constants.
- [x] 2.2 Audit `apps/api/src/controllers/taller.routes.ts` (and others) for similar hardcoded logic.
- [x] 2.3 Ensure `apps/api/src/lib/prisma.ts` (or equivalent) is correctly generating types that match these constants.

## 3. Verification

- [x] 3.1 Run `npm run verify` in the root directory and ensure `@iter/shared` pass.
- [x] 3.2 Run `npm run verify` in `apps/api`.
- [x] 3.3 Validate the "Assignment from Request" flow in the API to confirm the `Aprovada` status check works as expected.
