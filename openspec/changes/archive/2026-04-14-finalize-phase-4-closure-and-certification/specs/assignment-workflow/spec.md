## ADDED Requirements

### Requirement: Transition to Phase 4
The system SHALL support transitioning assignments to `COMPLETED` when Phase 4 (Closure) is active and requirements are met.

#### Scenario: Assignment reaches final state
- **WHEN** an administrator manually completes an assignment OR the system reaches the course end date
- **THEN** the assignment status SHALL be updated to `COMPLETED`.

### Requirement: Immutability of Completed Assignments
The system SHALL prevent any modification to attendance, student lists, or teacher assignments once an assignment is `COMPLETED`.

#### Scenario: User tries to edit completed assignment
- **WHEN** a coordinator tries to add a student to a `COMPLETED` assignment
- **THEN** the system SHALL return an error or disable the action in the UI.
