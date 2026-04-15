# Task List - Execution Phase Refactor

## Phase 1: Database & Data Integrity
- [x] Update `prisma/schema.prisma` to link `Attendance` with `Session`.
- [x] Run `npx prisma generate`.
- [ ] Create a migration script (or script in `scripts/`) to populate `sessionId` for existing attendance records.
- [ ] Verification: Check that `Attendance` counts match before and after migration.

## Phase 2: Backend API & Logic
- [ ] Implement `bulkAssignTeacherToSessions` in `assignment.controller.ts`.
- [ ] Create route `POST /assignments/:id/sessions/bulk-assign`.
- [ ] Update `AttendanceStatus` enum if needed (ensure sync with Mobile).
- [ ] Refactor `SessionService.ensureAttendanceRecords` to use the new `sessionId` relation.
- [ ] Update Mobile-facing endpoints to include `imageRightsValidated` flag for students.

## Phase 3: Web Dashboard Improvements
- [ ] Add "Asignar Profesor Referente a todo el taller" button in Assignment details (Phase 3 tab).
- [ ] Link button to the new bulk assignment endpoint.
- [ ] Add visual indicator in the session list for "Staff Gaps".

## Phase 4: Mobile App Polish (Simulation/Code)
- [ ] Update the Attendance screen UI to show the Image Rights warning icon.
- [ ] Implement the "Mark All Present" toggle logic in the attendance form.
- [ ] Add the sync status badge in the header.

## Phase 5: Testing & Verification
- [ ] Test the transition from Phase 2 (automatic activation) and check if sessions are correctly assignable.
- [ ] Verify that taking attendance in one session doesn't affect others with the same number in different assignments.
- [ ] Verify that deleting a session correctly cascades (or handles) linked attendance records.
