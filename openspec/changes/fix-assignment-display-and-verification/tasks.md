# Tasks: Fix Assignment Display and Verification

## Phase 1: Backend Fixes
- [ ] Implement `mapAssignmentForFrontend` utility in `assignment.controller.ts`
- [ ] Update `getAssignments` (Admin) to include `sessions`, `request`, and use the mapper
- [ ] Update `getAssignmentsByCenter` and `getAssignmentById` to use the mapper

## Phase 2: Frontend Fixes
- [ ] Update `verifications/page.tsx` date display logic
- [ ] Update `verifications/page.tsx` document URL fallback logic
- [ ] Verify `Phase2Table.tsx` handles the flattened data structure correctly

## Phase 3: Verification
- [ ] Manual verification as Admin
- [ ] Manual verification as Center Coordinator
