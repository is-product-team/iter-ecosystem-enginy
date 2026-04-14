## ADDED Requirements

### Requirement: Admin Closure Dashboard
The system SHALL provide a view for administrators to see a summary of all assignments and their current verify/completion status.

#### Scenario: Admin reviews assignments for closure
- **WHEN** an administrator logs in and navigates to the Phases/Closure management
- **THEN** the system SHALL show only assignments that are in Phase 3 or later and have pending closure actions.

### Requirement: Bulk Closure Action
The system SHALL allow administrators to select multiple assignments and transition their status to `COMPLETED`.

#### Scenario: Admin closes assignments
- **WHEN** an administrator selects several verified assignments and clicks "Finalize & Close"
- **THEN** the system SHALL update their status to `COMPLETED` and trigger any background certification tasks.

### Requirement: Closure Validation
The system SHALL prevent closing an assignment if critical teacher evaluations are missing.

#### Scenario: Blocked closure due to missing data
- **WHEN** an admin tries to close an assignment with 0 teacher evaluations performed
- **THEN** the system SHALL show a warning and prevent the status change.
