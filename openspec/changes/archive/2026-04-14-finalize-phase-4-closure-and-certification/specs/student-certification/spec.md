## ADDED Requirements

### Requirement: Certificate View
The system SHALL display a list of earned certificates in the student dashboard for any assignment with `COMPLETED` status.

#### Scenario: Student views their certificates
- **WHEN** a student logs into their dashboard and has completed workshops
- **THEN** the system SHALL show a card for each completed workshop with teacher evaluations and survey completion.

### Requirement: PDF Generation
The system SHALL generate a PDF certificate containing the student name, workshop title, duration, and completion date.

#### Scenario: Student downloads a certificate
- **WHEN** a student clicks the "Download PDF" button in their dashboard
- **THEN** the system SHALL generate and stream a PDF file with the official program template.

### Requirement: Conditional Download
The system SHALL only enable the certificate download button if the student has completed the related satisfaction survey.

#### Scenario: Download blocked by missing survey
- **WHEN** a student has not completed the survey for a workshop
- **THEN** the "Download PDF" button SHALL be disabled or lead to the survey form.
