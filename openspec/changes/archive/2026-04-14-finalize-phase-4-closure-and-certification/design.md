## Context

The current system has the data models for Phase 4 (Certificates, Evaluations, Questionnaires) but lacks the operational logic and user interface to finalize the training cycle. Administrators have no way to "close" a course, and students see a "not implemented" message when trying to download their certificates.

## Goals / Non-Goals

### Goals:
- Implement a robust `CertificateService` for PDF generation and storage.
- Create a "Closure Dashboard" for Admins to finalize assignments in bulk.
- Integrate Phase 4 surveys into the Student and Center dashboards.
- Enforce the `COMPLETED` status to lock assignment data and enable certification.

### Non-Goals:
- Automated email delivery of certificates (out of scope for now, download only).
- Advanced analytics for Phase 4 surveys (beyond basic completion tracking).

## Decisions

### 1. PDF Generation Strategy
**Decision**: Use a server-side PDF generation service (based on `pdf-lib` or `jspdf` on Node.js) with a standardized template.
**Rationale**: Server-side generation ensures consistency and security. 
**Alternatives**: Client-side generation (browser dependent, harder to sign/validate later).

### 2. Mandatory Surveys for Students
**Decision**: Students MUST complete their "Self-Consultation" survey before the download button for their certificate is enabled.
**Rationale**: High response rates for phase 4 metrics are critical for program funding.
**Flow**:
```
[Student Dashboard] --(If Phase 4 AND Status != COMPLETED)--> [Incomplete Notice]
[Student Dashboard] --(If Phase 4 AND Status == COMPLETED AND !SurveyDone)--> [Survey Form]
[Student Dashboard] --(If Phase 4 AND Status == COMPLETED AND SurveyDone)--> [Download Certificate]
```

### 3. State Locking Mechanism
**Decision**: Transitioning an assignment to `COMPLETED` will lock all associated `Session`, `Attendance`, and `Enrollment` records via middleware or application logic.
**Rationale**: Prevents post-certification data tampering.

## Risks / Trade-offs

- **Memory Usage on PDF Generation**: [Risk] Generating many PDFs simultaneously could strain the server. -> [Mitigation] Implement a dedicated worker or queue if volume increases, for now use on-demand generation with caching.
- **Incomplete Evaluations**: [Risk] Centers might not fill their surveys, delaying student certificates. -> [Mitigation] Allow Admin override or set a soft-deadline.
