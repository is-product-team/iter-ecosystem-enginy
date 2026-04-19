## Context

Phase 4 (Closure) is the final stage of the Iter workshop lifecycle. It involves transitioning assignments to `COMPLETED`, issuing certificates to students with $\ge$ 80% attendance, and collecting satisfaction surveys. Currently, the implementation is fragmented: the backend has basic closure logic but lacks security and notification triggers, while the frontend is mostly a placeholder.

## Goals / Non-Goals

**Goals:**
- Secure the Phase 4 API endpoints (RBAC and data isolation).
- Automate certificate issuance and user notification upon closure.
- Implement the "Survey Gate" to ensure quality data collection.
- Provide a functional Phase 4 UI for students and coordinators.
- Fix the broken integration tests for the workshop lifecycle.

**Non-Goals:**
- Modifying the existing certificate PDF template design.
- Implementing Phase 4 for the Teacher Mobile App (out of scope for this web-focused change).
- Historical data migration for previously closed workshops.

## Decisions

### 1. RBAC & Security Layer
We will implement a middle-ware based check for `closeAssignment` and a repository-level filter for `getMyCertificates`.
- **Rationale**: `closeAssignment` must be restricted to the Admin or the Coordinator of the specific center to prevent cross-tenant state changes. `getMyCertificates` must explicitly filter by `req.user.studentId` to prevent data leakage.
- **Alternatives**: Checking roles inside every controller (too repetitive/error-prone).

### 2. The "Survey Gate" Logic
The "Download Certificate" button will only be enabled if `enrollment.selfConsultation` is not null.
- **Rationale**: This is the strongest lever we have to ensure students provide feedback before leaving the program. 
- **User Experience**: If the survey is missing, the button will redirect the student to the survey page instead of downloading the PDF.

### 3. Notification Integration
`ClosureService` will call `NotificationService.notify` after successful certificate issuance.
- **Rationale**: Closing a workshop is a major event. Students should be proactively notified via the platform (and email, as per existing notification logic) that their certification is available.

### 4. Test Infrastructure Fix (logStatusChange)
Standardize `logStatusChange` to use the authenticated `userId` from the request, falling back to a dynamically fetched Admin if no user is provided, instead of a hardcoded `1`.
- **Rationale**: Hardcoded IDs cause foreign key violations in clean environments.

### 5. Data Flow Diagram

```ascii
[ Coordinator ] --( POST /assignments/:id/close )--> [ ClosureService ]
                                                           |
                                                           v
                                              +-------------------------+
                                              | 1. Validate Attendance  |
                                              | 2. Status -> COMPLETED  |
                                              | 3. Issue Certificates   |
                                              | 4. Log Audit (Fixed)    |
                                              | 5. Dispatch Notifs      |
                                              +-------------------------+
                                                           |
                                                           v
[ Student ] <--( Notify: "Cert Ready" )--------------------+
    |
    +--( GET /dashboard )--> [ Check Survey Done? ]
                                   |
              +--------------------+--------------------+
              |                                         |
    [ NO: Show "Take Survey" ]                [ YES: Show "Download PDF" ]
              |                                         |
              v                                         v
    ( Redirect to /survey )                 ( GET /certificates/:id/download )
```

## Risks / Trade-offs

- **[Risk]** High attendance threshold (80%) might exclude students due to missing data → **[Mitigation]** The sanity test will now explicitly register 100% attendance to ensure the "happy path" is always validated.
- **[Risk]** Breaking existing manual closure workflows → **[Mitigation]** Ensure the RBAC allows both ADMIN (global) and COORDINATOR (local) access.
- **[Risk]** Notification spam → **[Mitigation]** `NotificationService` already has a 10s deduplication window.
