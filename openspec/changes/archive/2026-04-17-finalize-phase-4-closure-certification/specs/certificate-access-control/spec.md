## ADDED Requirements

### Requirement: Secure Certificate Retrieval
The system SHALL ensure that students can only retrieve their own certificates and that administrators can view all certificates.

#### Scenario: Student attempts to retrieve certificates
- **WHEN** a user with the STUDENT role (ID: 10) calls `GET /api/certificates/my-certificates`
- **THEN** the system SHALL return only certificates where `studentId` is 10.

#### Scenario: Admin attempts to retrieve student certificates
- **WHEN** a user with the ADMIN role calls `GET /api/certificates/my-certificates?studentId=10`
- **THEN** the system SHALL return the certificates for student 10.

### Requirement: Single Certificate PDF Download
The API SHALL provide an endpoint to download a specific certificate as a PDF file, restricted to the certificate owner or an administrator.

#### Scenario: Authorized PDF download
- **WHEN** a student (ID: 10) calls `GET /api/certificates/download/:assignmentId` for their own certificate
- **THEN** the system SHALL return the PDF buffer with a `Content-Type: application/pdf` header.

#### Scenario: Unauthorized PDF download
- **WHEN** a student (ID: 10) calls `GET /api/certificates/download/:assignmentId` for another student's certificate
- **THEN** the system SHALL return a 403 Forbidden error.

### Requirement: Survey Mandatory for Certificate Access
The system SHALL prevent students from downloading their certificates until they have completed the associated workshop satisfaction survey.

#### Scenario: Download blocked by missing survey
- **WHEN** a student with a pending survey attempts to download their certificate
- **THEN** the system SHALL return a 403 Forbidden error with a "SURVEY_REQUIRED" message.

#### Scenario: Download allowed after survey completion
- **WHEN** a student who has submitted their survey attempts to download their certificate
- **THEN** the system SHALL allow the PDF download.
