## Why

During the implementation of Phase 4 (Closure & Certification), several logic bugs and UX edge cases were identified. Specifically, the survey completion check was incorrectly validating against the first student of the workshop instead of the individual student, justified absences were not counting towards the 80% attendance requirement, and notifications were being sent to students who did not qualify for a certificate. Fixing these issues is critical for the integrity and user experience of the certification process.

## What Changes

- **Individual Survey Validation**: Refactor the backend logic to ensure each student's certificate access is validated against their own survey submission status.
- **Attendance Logic Adjustment**: Modify the certificate issuance criteria to include `JUSTIFIED_ABSENCE` as a valid form of attendance for the 80% requirement.
- **Targeted Notifications**: Update the closure service to only notify students who have actually been issued a certificate.
- **Improved UI Messaging**: Ensure students who do not qualify for a certificate receive appropriate context if they attempt to access it.

## Capabilities

### Modified Capabilities
- `closure-orchestration`: Refine the finalization logic to include targeted notifications and individual survey checks.
- `certificate-access-control`: Update attendance criteria and fix per-user isolation bugs.

## Impact

- **Affected Code**: `apps/api/src/services/closure.service.ts`, `apps/api/src/services/certificate.service.ts`, `apps/api/src/controllers/certificate.controller.ts`.
- **APIs**: Behavior of `GET /certificates/my-certificates` and `GET /certificates/download/:assignmentId`.
- **System**: More accurate and fair certification process.
