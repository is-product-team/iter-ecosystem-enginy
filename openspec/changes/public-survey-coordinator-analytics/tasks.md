# Tasks: Public Survey & Coordinator Analytics

- [x] **Phase 1: Database & Core Logic**
    - [x] Add `email` field to `Student` and `User` in `schema.prisma`.
    - [x] Add `email` to `StudentRepository`.
    - [x] Create `PublicController` with `verifyStudent` and `submitSurvey` (unauthenticated).

- [x] **Phase 2: Analytics & Bulk Certification**
    - [x] Implement `QuestionnaireService.getAggregatedStats(assignmentId)`.
    - [x] Implement `CertificateService.generateZip(assignmentId)`.
    - [x] Create API routes for zip download (authenticated for Coordinators).

- [x] **Phase 3: Public Frontend**
    - [x] Create `app/[locale]/survey/page.tsx`.
    - [x] Implement multi-step flow: Email Verification -> Survey Form -> Success.

- [x] **Phase 4: Coordinator Dashboard**
    - [x] Add "Analytics" tab or section in Center Dashboard.
    - [x] Integrate **Recharts** for survey results.
    - [x] Add "Download All Certificates" button.

- [x] **Verification**
    - [x] Verify survey submission without login.
    - [x] Verify chart accuracy.
    - [x] Verify zip generation and contents.
