## Context

Phase 4 (Closure & Certification) is the final stage of the workshop lifecycle in the Iter Ecosystem. Previously, this stage had several logical gaps: justified absences were not recognized, notifications were sent indiscriminately, and a security bug allowed students to bypass survey requirements or validate against other students' data. This design documents the finalized, robust architecture implemented to resolve these issues.

## Goals / Non-Goals

**Goals:**
- **Robust Closure Orchestration**: Ensure workshops only close when necessary data (evaluations) is present.
- **Fair Certification**: Implement an attendance logic that respects authorized absences.
- **Secure Access**: Enforce individual survey completion as a mandatory gate for certificate downloads.
- **Segmented Communication**: Only notify students who have actually earned a certificate.

**Non-Goals:**
- Changing the 80% threshold.
- Modifying the PDF template design.
- Implementing automatic closure based on dates (closure remains a manual coordinator action).

## Decisions

### 1. Inclusive Attendance Logic
The attendance percentage is now calculated by treating `JUSTIFIED_ABSENCE` as a valid attendance state, alongside `PRESENT` and `LATE`.
- **Rationale**: Students with medical or official justifications should not be penalized for missing sessions if the coordinator has authorized the absence.
- **Implementation**: `a.status === 'PRESENT' || a.status === 'LATE' || a.status === 'JUSTIFIED_ABSENCE'`.

### 2. Targeted Notification Dispatch
Instead of notifying all students enrolled in a workshop, the `ClosureService` now receives a list of student IDs from `CertificateService` who successfully met the criteria.
- **Rationale**: Reduces noise and prevents misleading students who did not pass the workshop into thinking they have a certificate available.

### 3. Individual Survey Gate Enforcement
The `CertificateController` now uses a specific filter when checking for survey completion (`selfConsultation`).
- **Rationale**: Prevents a bug where the system checked the first enrollment of the assignment instead of the specific user requesting the certificate.

### 4. Component-Based Closure UI
The closure process is triggered via the `CloseWorkshopSection` component, which provides a pre-closure summary.
- **Rationale**: Allows coordinators to see exactly who will be certified before committing to the final closure.

### Architecture Overview

```ascii
[ Coordinator UI ] --(POST /close)--> [ ClosureService ]
                                            |
                                            v
                                     1. Check Evaluations
                                            | (At least 1 required)
                                            v
                                     2. Set status COMPLETED
                                            |
                                            v
                                     3. [ CertificateService ]
                                            |
                                            v
                                     a. Calc 80% Attendance (incl. Justified)
                                     b. Create Certificate DB Records
                                     c. Return Qualified Student IDs
                                            |
                                            v
                                     4. [ NotificationService ]
                                            |
                                            v
                                     Notify Qualified Students ONLY
```

## Risks / Trade-offs

- **[Risk]** Data Locking → **[Mitigation]** Once closed, attendance and evaluation data become read-only to preserve the integrity of the issued certificates.
- **[Trade-off]** Manual Closure Requirement → **[Rationale]** Gives coordinators the final word on when a workshop is officially "finished," allowing for last-minute adjustments before certification.
