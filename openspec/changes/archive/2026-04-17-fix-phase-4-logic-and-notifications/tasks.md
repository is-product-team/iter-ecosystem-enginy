## 1. Backend: Bug Fixes (Survey Gate)

- [x] 1.1 Fix `getMyCertificates` in `certificate.controller.ts` to correctly filter enrollments by the authenticated student's ID for survey completion check
- [x] 1.2 Fix `downloadCertificate` in `certificate.controller.ts` to ensure the survey completion check validates the specific student's record

## 2. Backend: Attendance Logic

- [x] 2.1 Update `issueCertificatesForAssignment` in `certificate.service.ts` to include `JUSTIFIED_ABSENCE` in the attendance count

## 3. Backend: Targeted Notifications

- [x] 3.1 Refactor `issueCertificatesForAssignment` to return the list of student IDs who were issued certificates
- [x] 3.2 Update `ClosureService.closeAssignment` to only send notifications to the student IDs returned by the issuance service

## 4. Validation

- [x] 4.1 Update `phase-lifecycle-sanity.test.ts` to include a scenario with a `JUSTIFIED_ABSENCE` that results in a successful certificate issuance
- [x] 4.2 Add a test case to verify that notifications are NOT sent to students who didn't qualify
