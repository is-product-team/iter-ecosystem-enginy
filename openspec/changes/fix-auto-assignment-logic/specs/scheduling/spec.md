## ADDED Requirements

### Requirement: Trigger Automatic Assignment
The system SHALL trigger the Fair Distribution Algorithm (AutoAssignmentService) when the "Run automatic assignment" (Tetris) process is initiated from the Admin Dashboard.

#### Scenario: Running automatic assignment for new workshops
- **WHEN** the administrator clicks "Run automatic assignment" in the Requests view
- **THEN** the system SHALL invoke the `AutoAssignmentService` to distribute workshop capacity among pending requests
- **AND** SHALL NOT require existing `VACANT` assignments to proceed

### Requirement: API Response Standardization for Auto-Assignment
The auto-assignment API SHALL return a standardized response including the count of newly created assignments to ensure correct UI feedback.

#### Scenario: Successful bulk assignment feedback
- **WHEN** the auto-assignment engine completes its run
- **THEN** the API response SHALL include an `assignmentsCreated` field with the integer count of assignments generated
- **AND** the frontend SHALL use this value to inform the user of the successful outcome
