## 1. Authentication & Core Types

- [x] 1.1 Refactor `apps/web/lib/auth.ts`: Rename `nom_complet` -> `fullName`, `nom_rol` -> `name`, `codi_center` -> `centerCode`.
- [x] 1.2 Update `AuthContext.tsx` to ensure `login` and `user` state handle the new properties.
- [x] 1.3 Implement a migration helper in `AuthContext` to clear legacy `localStorage` user data.

## 2. API Service Layer

- [x] 2.1 Refactor `apps/web/services/assignmentService.ts` for English response handling.
- [x] 2.2 Refactor `apps/web/services/workshopService.ts` for English response handling.
- [x] 2.3 Refactor `apps/web/services/teacherService.ts` for English response handling.

## 3. Dashboard Components

- [x] 3.1 Update `Navbar` and `Sidebar` to display `user.fullName`.
- [x] 3.2 Update `Assignments` table to use `assignment.status` and `assignment.startDate`.
- [x] 3.3 Update `Profile` page to use `user.fullName` and `user.phone`.

## 4. Verification

- [x] 4.1 Run `npm run type-check --workspace=web` to confirm zero errors.
- [x] 4.2 Perform manual smoke test of the login flow and data population.
