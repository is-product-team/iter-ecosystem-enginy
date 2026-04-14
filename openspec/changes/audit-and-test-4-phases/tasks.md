## 1. Backend: Phase Sanity Infrastructure

- [ ] 1.1 Create `apps/api/__tests__/phase-lifecycle-sanity.test.ts` using Vitest and Supertest
- [ ] 1.2 Implement mock Request creation and Admin approval (Phase 1)
- [ ] 1.3 Implement mock Assignment publication and Student Enrollment (Phase 2)
- [ ] 1.4 Implement Session generation and Attendance tracking verification (Phase 3)
- [ ] 1.5 Implement Assignment Closure and Certificate status validation (Phase 4)

## 2. API Bug Fixes & Improvements

- [ ] 2.1 Update `apps/api/src/controllers/phase3-stats.controller.ts` to correctly map center names
- [ ] 2.2 Standardize Phase nomenclature across `assignment.controller.ts` and `request.controller.ts`
- [ ] 2.3 Ensure audit logs are consistently generated for all phase transitions

## 3. Frontend: Verification UX Refactor

- [ ] 3.1 Define a robust `DOCUMENT_CONFIG` object in `verifications/page.tsx` to map fields to labels
- [ ] 3.2 Replace brittle string-based property access with the new configuration object
- [ ] 3.3 Optimize Bulk Approval to use the standardized field mappings
- [ ] 3.4 Verify consistent phase naming across the dashboard components
