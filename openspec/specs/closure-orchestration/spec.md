## MODIFIED Requirements

### Requirement: Automated Certification and Notification
Upon successful closure of an assignment, the system SHALL automatically issue certificates for all eligible students and trigger a notification only to those who qualified.

#### Scenario: Full closure flow with targeted notifications
- **WHEN** an assignment is closed and has 5 students with $\ge$ 80% attendance (including justified absences) and 2 students with < 80%
- **THEN** the system SHALL create 5 `Certificate` records, update the assignment status to `COMPLETED`, and dispatch a `PHASE_CLOSURE` notification ONLY to the 5 students who earned a certificate.
