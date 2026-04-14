## ADDED Requirements

### Requirement: Unified Phase Sanity Check
The system SHALL provide a mechanism to verify the full workshop lifecycle, from initial request to closure, ensuring data integrity at each transition point.

#### Scenario: Full lifecycle validation
- **WHEN** a test execution triggers the creation of a Request
- **THEN** following approval, an Assignment MUST be created and capable of student enrollment and session generation.

### Requirement: Request to Assignment Transition
The system MUST ensure that once a Request is APPROVED, it can be linked to a valid Assignment with teachers and dates.

#### Scenario: Successful transition
- **WHEN** an Admin approves a pending request
- **THEN** the system SHALL allow the creation of a PUBLISHED assignment based on the request data.

### Requirement: Document-to-Session Validation
The system SHALL prevent session generation if mandatory enrollment documents are missing or invalid, ensuring legal compliance.

#### Scenario: Compliance gating
- **WHEN** a coordinator attempts to confirm registration without valid documents
- **THEN** the system SHALL block the transition to IN_PROGRESS.

### Requirement: Automated Certificate Issuance
Upon assignment CLOSURE, the system MUST automatically trigger evaluation surveys and prepare certificates for students with sufficient attendance.

#### Scenario: Closure automation
- **WHEN** an Admin closes an IN_PROGRESS assignment
- **THEN** evaluation tokens SHALL be generated and certificates marked as ready for students meeting the 80% attendance threshold.
