# Tasks: Fix Phase 1 & 2 Inconsistencies

- [x] **Standardize Shared Library**
    - [x] Rename `approxStudents` to `studentsAprox` in `shared/index.ts`
    - [x] Add `CHECKLIST_STEPS` constants to `shared/index.ts`
- [x] **Refactor API Controllers**
    - [x] Update `apps/api/src/controllers/request.controller.ts` with `studentsAprox` and Audit Logging
    - [x] Update `apps/api/src/controllers/assignment.controller.ts` to use `CHECKLIST_STEPS` constants
    - [x] Verify checklist synchronization in `designateTeachers`
- [x] **Update Frontend (Web App)**
    - [x] Update `apps/web/services/assignmentService.ts`
    - [x] Update Request pages: `apps/web/app/[locale]/center/requests/page.tsx` and `apps/web/app/[locale]/requests/page.tsx`
    - [x] Update Assignment student pages: `apps/web/app/[locale]/center/assignments/[id]/page.tsx` and `.../students/page.tsx`
- [x] **Verification**
    - [x] Manual verification of data flow between Request and Assignment
    - [x] Verify AuditLog entries for Requests
