# Tasks - Automated Session Generation

## Phase 1: Backend - Early Session Generation
- [ ] Modify `assignment.controller.ts` -> `createAssignmentFromRequest` to call `SessionService.syncSessionsForAssignment` after creation. `[assigned:api]`
- [ ] Modify `auto-assignment.service.ts` to ensure `SessionService` is triggered for batch assignments. `[assigned:api]`
- [ ] Verify that manual approval from Admin now populates the `sessions` table immediately.

## Phase 2: Backend - Automated Activation
- [ ] Create `checkAndActivateAssignment` private helper in `assignment.controller.ts` or a shared service. `[assigned:api]`
- [ ] Implement validation logic: check all enrollments for completion of all documented fields.
- [ ] Integrate helper into `validateEnrollmentDocument` PATCH endpoint.
- [ ] Deprecate `confirm-registration` endpoint (optional, keep it for backward compatibility but hidden from UI).

## Phase 3: Frontend - UI Polish
- [ ] Remove the "Confirm i Generar Sessions" section in `apps/web/app/[locale]/center/assignments/[id]/page.tsx`. `[assigned:web]`
- [ ] Update assignment status badges to reflect automatic activation.
- [ ] Verify coordinator view shows active sessions as soon as documents are validated.

## Phase 4: Verification
- [ ] Test end-to-end: Request -> Approve -> Validate last student -> Check status is `IN_PROGRESS` and notification is sent.
