## Why

The Iter Ecosystem handles the full lifecycle of vocational training workshops, but Phase 4 (Closure) is currently unimplemented in the user interface. While the database schema and some backend services exist, students cannot download their certificates, satisfaction surveys are not integrated, and administrators lack a formal way to finalize assignments and generate course-ending quality reports. Completing this phase is essential to fulfill the program's promise of certification and data-driven quality tracking.

## What Changes

- **Certificate Generation**: Implement the backend logic to generate official PDF certificates for students who have successfully completed their workshops.
- **Student Satisfaction Surveys**: Integrate the "Student Self-Consultation" into the student dashboard, allowing them to provide feedback before accessing their certificates.
- **Center Satisfaction Surveys**: Implement the questionnaire system for coordinators to evaluate the workshop quality and teacher performance.
- **Admin Closure Workflow**: Create a dedicated interface for administrators to review assignment metrics and trigger the final "Closure" of assignments, which locks attendance and enables certification.
- **Status Progression**: Formalize the transition to the `COMPLETED` status in the `AssignmentStatus` enum, ensuring it locks the data and triggers the generation of final reports.

## Capabilities

### New Capabilities
- `student-certification`: Provides the infrastructure and UI for issuing and downloading workshop completion certificates in PDF format.
- `quality-surveys`: Manages the distribution and collection of satisfaction questionnaires for students and centers during Phase 4.
- `assignment-closure-management`: Implements the administrative flow to review, validate, and officially close assignments.

### Modified Capabilities
- `assignment-workflow`: Update existing assignment status transitions to include the final Move to Phase 4 and the implications of the `COMPLETED` status.

## Impact

- **Backend (API)**: New `CertificateService` and `ClosureService`. Extension of `QuestionnaireService` and `EvaluationService`.
- **Frontend (Web)**:
  - Updated Student Dashboard with survey integration and certificate downloads.
  - New Admin view for assignment closure and quality metrics summary.
  - New Center view for performing center-level evaluations.
- **Database**: New entries in `Certificate` table and updates to `Assignment` statuses.
