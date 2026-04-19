## Why

The Phase 4 (Closure & Certification) of the Iter Ecosystem is currently incomplete and contains critical security and operational gaps. The API allows unauthorized access to certificates, the closure process lacks robust validation and RBAC, and the user interface for both students and coordinators is missing essential Phase 4 modules (surveys and certificate downloads). This change ensures the workshop lifecycle is securely and fully completed.

## What Changes

- **Security & RBAC**:
    - Implement Role-Based Access Control for the `closeAssignment` endpoint to restrict it to ADMIN and COORDINATOR (for their own center).
    - Fix the `getMyCertificates` security leak by ensuring users can only see their own certificates (unless they are ADMIN).
- **Backend Logic & Services**:
    - Implement a dedicated endpoint for downloading a single certificate PDF for students.
    - Fix the `logStatusChange` fallback mechanism to avoid foreign key violations in test environments.
    - Enhance `ClosureService` to integrate with the `NotificationService` for automated "Certificate Ready" alerts.
- **Automated Testing**:
    - Refactor `phase-lifecycle-sanity.test.ts` to include attendance registration in Phase 3, ensuring Phase 4 actually generates certificates.
    - Implement a robust cleanup strategy in tests to avoid "already exists" errors.
- **Frontend Refinement**:
    - **[NEW]** Phase 4 module for the Center Dashboard (Coordinators) to monitor closure status and download bulk certificates.
    - Implement the "Survey Gate" in the Student Dashboard: students must complete the satisfaction survey before the "Download Certificate" button is enabled.
    - Connect the "Download PDF" button in the Student Dashboard to the new backend endpoint.

## Capabilities

### New Capabilities
- `closure-orchestration`: Unified logic for finalization, certificate issuance, and notification.
- `certificate-access-control`: Secure, per-user and per-role access to generated certification documents.

### Modified Capabilities
- `testing/validation`: Enhancing the sanity test suite to cover the full lifecycle including attendance and certification results.
- `quality-surveys`: Ensuring surveys are a mandatory prerequisite for student-facing certification.

## Impact

- **Affected Code**: `apps/api/src/controllers/`, `apps/api/src/services/`, `apps/api/__tests__/`, `apps/web/app/[locale]/student/`, `apps/web/app/[locale]/center/`.
- **APIs**: New `GET /certificates/:id/download` endpoint; modified `GET /certificates/my-certificates`.
- **System**: Secure completion of the 4-phase workshop lifecycle.
