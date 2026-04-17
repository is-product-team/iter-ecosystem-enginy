## MODIFIED Requirements

### Requirement: Secure Certificate Retrieval
The system SHALL ensure that students can only retrieve their own certificates and that administrators can view all certificates.

#### Scenario: Student attempts to retrieve certificates
- **WHEN** a user with the STUDENT role (ID: 10) calls `GET /api/certificates/my-certificates`
- **THEN** the system SHALL return only certificates where `studentId` is 10.

#### Scenario: Admin attempts to retrieve student certificates
- **WHEN** a user with the ADMIN role calls `GET /api/certificates/my-certificates?studentId=10`
- **THEN** the system SHALL return the certificates for student 10.

### Requirement: Survey Mandatory for Certificate Access
The system SHALL prevent students from downloading their certificates until they have completed the associated workshop satisfaction survey, specifically validating the survey of the authenticated student.

#### Scenario: Download blocked by missing individual survey
- **WHEN** Student A attempts to download their certificate but has not submitted their survey (even if Student B in the same workshop has)
- **THEN** the system SHALL return a 403 Forbidden error with a "SURVEY_REQUIRED" message.

#### Scenario: Download allowed after individual survey completion
- **WHEN** a student who has submitted their own survey attempts to download their certificate
- **THEN** the system SHALL allow the PDF download.

## ADDED Requirements

### Requirement: Inclusive Attendance Calculation
The system SHALL treat `JUSTIFIED_ABSENCE` as attended time when calculating the 80% attendance threshold for certificate issuance.

#### Scenario: Student with justified absences qualifies
- **WHEN** a student has 70% 'PRESENT' status and 15% 'JUSTIFIED_ABSENCE' status (Total 85%)
- **THEN** the system SHALL issue a certificate for that student upon closure.
