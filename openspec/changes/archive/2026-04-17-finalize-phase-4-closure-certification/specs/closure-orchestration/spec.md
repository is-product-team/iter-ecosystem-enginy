## ADDED Requirements

### Requirement: Workshop Closure Authorization
The API SHALL restrict the workshop closure operation to users with the ADMIN role or the COORDINATOR role belonging to the center where the workshop is held.

#### Scenario: Unauthorized closure attempt by student
- **WHEN** a user with the STUDENT role attempts to POST to `/api/assignments/:id/close`
- **THEN** the system SHALL return a 403 Forbidden error.

#### Scenario: Authorized closure by center coordinator
- **WHEN** a user with the COORDINATOR role for Center A attempts to close an assignment belonging to Center A
- **THEN** the system SHALL allow the operation and proceed with closure.

### Requirement: Automated Certification and Notification
Upon successful closure of an assignment, the system SHALL automatically issue certificates for all eligible students and trigger a notification.

#### Scenario: Full closure flow
- **WHEN** an assignment is closed and has 5 students with $\ge$ 80% attendance
- **THEN** the system SHALL create 5 `Certificate` records, update the assignment status to `COMPLETED`, and dispatch a `PHASE_CLOSURE` notification to all enrolled students.

### Requirement: Robust Audit Logging
The system SHALL record an audit log for every assignment status transition, ensuring the `userId` is correctly attributed to the initiator or a valid system administrator.

#### Scenario: Audit log with authenticated user
- **WHEN** Coordinator (ID: 50) closes an assignment
- **THEN** the system SHALL create an `AuditLog` record with `userId: 50` and the action `Status change... from IN_PROGRESS to COMPLETED`.
