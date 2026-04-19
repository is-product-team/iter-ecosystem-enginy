## 1. Backend: Security & RBAC

- [x] 1.1 Implement RBAC middleware check in `closeAssignment` (Admin or authorized Coordinator)
- [x] 1.2 Fix `getMyCertificates` to filter by `studentId` for STUDENT role and prevent data leakage
- [x] 1.3 Add survey completion check to certificate download logic
- [x] 1.4 Create `GET /certificates/download/:assignmentId` endpoint for single PDF download

## 2. Backend: Logic & Infrastructure

- [x] 2.1 Update `logStatusChange` in `assignment.controller.ts` to fix the hardcoded `userId: 1` fallback
- [x] 2.2 Enhance `ClosureService` to trigger `NotificationService` upon successful certificate issuance
- [x] 2.3 Ensure `issueCertificatesForAssignment` correctly handles empty attendance edge cases

## 3. Testing: Sanity Suite Refactor

- [x] 3.1 Update `phase-lifecycle-sanity.test.ts` to include attendance registration in Phase 3
- [x] 3.2 Improve `beforeAll` cleanup logic to handle existing test data more robustly
- [x] 3.3 Verify the full Phase 1 to Phase 4 flow with valid certificate generation in tests

## 4. Frontend: Student Dashboard

- [x] 4.1 Implement the "Survey Gate" UI logic: disable download if survey is pending
- [x] 4.2 Connect the "Download PDF" button to the new `/api/certificates/download/:id` endpoint
- [x] 4.3 Add a "Take Survey" call-to-action for certificates blocked by the gate

## 5. Frontend: Center Dashboard

- [x] 5.1 Create a new Phase 4 (Cierre) module/card in the Center Dashboard
- [x] 5.2 Implement a basic monitoring view for coordinators to see certificate issuance progress
- [x] 5.3 Enable bulk certificate download button for authorized coordinators
