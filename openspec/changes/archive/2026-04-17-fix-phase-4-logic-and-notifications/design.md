## Context

The initial Phase 4 implementation has three main logical flaws:
1.  **Survey Check Bug**: The backend used `cert.assignment.enrollments[0]` which checked survey status against an arbitrary student instead of the authenticated student requesting the certificate.
2.  **Attendance Exclusion**: Students with `JUSTIFIED_ABSENCE` were being penalized, missing the 80% threshold even if their absences were authorized.
3.  **Notification Spam**: All students in a workshop were receiving "Certificate Ready" notifications, even if they failed to meet the attendance or evaluation requirements.

## Goals / Non-Goals

**Goals:**
- Fix the individual survey validation in `certificate.controller.ts`.
- Update `CertificateService` to treat `JUSTIFIED_ABSENCE` as attended for calculation purposes.
- Refactor `ClosureService` to only trigger notifications for students who actually received a certificate record.

**Non-Goals:**
- Changing the 80% threshold value.
- Redesigning the notification message templates.

## Decisions

### 1. Per-Student Survey Filtering
Instead of relying on a flattened array of enrollments, we will use a specific Prisma `include` with a `where` clause that matches the student ID of the requester.
- **Rationale**: Ensures that the `surveyCompleted` boolean reflects the actual user's progress.

### 2. Inclusive Attendance Calculation
Modify the filter in `issueCertificatesForAssignment` to include `JUSTIFIED_ABSENCE`.
- **Logic**: `a.status === 'PRESENT' || a.status === 'LATE' || a.status === 'JUSTIFIED_ABSENCE'`.

### 3. Targeted Notification Dispatch
`ClosureService.closeAssignment` will now fetch the list of successfully created `Certificate` records and use those IDs to dispatch notifications.

```ascii
[ ClosureService ]
       |
       v
1. [ Issue Certs ] ----> Returns List of Student IDs who earned it
       |
       v
2. [ Filter Enrollment ] -> Only those Student IDs
       |
       v
3. [ Notify Student ] -> "Your certificate is ready"
```

## Risks / Trade-offs

- **[Risk]** Over-notifying students who earned a certificate in a previous manual run → **[Mitigation]** `upsert` in certificate issuance prevents duplicate records, but the notification will still fire if we aren't careful. We will ensure only those with a certificate are in the loop.
- **[Trade-off]** `JUSTIFIED_ABSENCE` might be abused if center coordinators are not rigorous → **[Assumption]** Coordinators are the source of truth for justified absences as per program rules.
