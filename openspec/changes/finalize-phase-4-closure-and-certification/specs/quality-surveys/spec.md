## ADDED Requirements

### Requirement: Student Satisfaction Form
The system SHALL provide a multi-question form for students to rate their workshop experience and vocational impact.

#### Scenario: Student fills out self-consultation
- **WHEN** a student accesses the survey link for a completed workshop
- **THEN** the system SHALL allow them to rate experience, teachers, and interest using a 1-5 scale.

### Requirement: Center Quality Survey
The system SHALL provide a questionnaire for center coordinators to evaluate the workshop logistics and teacher performance.

#### Scenario: Coordinator completes center survey
- **WHEN** a center coordinator logs in during Phase 4
- **THEN** the system SHALL list pending surveys for all completed assignments in their center.

### Requirement: Response Persistence
The system SHALL store survey responses in the `respostes_questionari` or `autoconsultes_alumne` models and link them to the specific enrollment or assignment.

#### Scenario: Data saved successfully
- **WHEN** a user submits a completed questionnaire
- **THEN** the system SHALL save the responses and update the completion status for that survey token.
