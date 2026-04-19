## Why

Phase 4 (Closure & Certification) has undergone several critical refinements to ensure fair certification and robust security. This change consolidates the final state of the implementation into a structured report for the Pull Request, ensuring that the logic for attendance, notifications, and individual survey validation is clearly documented and verified.

## What Changes

- **Finalized Closure Logic**: Implementation of `ClosureService` with a mandatory requirement of at least one teacher evaluation per workshop before closing.
- **Inclusive Attendance Policy**: Refactored `CertificateService` to include `JUSTIFIED_ABSENCE` in the 80% attendance calculation for certificate eligibility.
- **Targeted Notification System**: Optimization of the notification flow to only alert students who successfully earned a certificate, avoiding spam to unqualified participants.
- **Security Fix (Survey Gate)**: Resolution of a per-student isolation bug in `CertificateController`, ensuring that each student must complete their own survey before downloading their certificate.
- **Consolidated Monitoring UI**: Integration of the `CloseWorkshopSection` in the Coordinator Dashboard to allow manual triggering of the closure process.

## Capabilities

### New Capabilities
- `phase4-final-verification`: Orchestration of the final verification and reporting process for the Closure and Certification phase.

### Modified Capabilities
- `closure-orchestration`: Refinement of the workshop closure workflow, including targeted notifications.
- `certificate-access-control`: Implementation of individual survey gates and inclusive attendance logic.

## Impact

- **Affected Code**: `apps/api/src/services/closure.service.ts`, `apps/api/src/services/certificate.service.ts`, `apps/api/src/controllers/certificate.controller.ts`, `apps/web/components/monitoring/CloseWorkshopSection.tsx`.
- **APIs**: Enhanced security for `GET /certificates/download/:assignmentId` and more accurate response for `GET /certificates/my-certificates`.
- **System**: Improved data integrity and user experience for the final stage of the educational workshop lifecycle.
