## 1. Backend: Core Foundation & PDF Services

- [x] 1.1 Add `pdf-lib` or similar to `@iter/api` dependencies
- [x] 1.2 Implement `CertificateService.generatePDF` with a standard template
- [x] 1.3 Create `CertificateController` with endpoint `GET /certificates/:id/download`
- [x] 1.4 Implement `ClosureService` logic to validate and transition assignments to `COMPLETED`
- [x] 1.5 Update `AssignmentController` with `POST /assignments/:id/close`

## 2. Frontend: Admin Closure Workflow

- [ ] 2.1 Create Admin Closure management page at `admin/closure`
- [ ] 2.2 Implement bulk selection and validation for assignments ready to be closed
- [ ] 2.3 Integrate closure API calls with real-time feedback and state locking

## 3. Frontend: Student Dashboard & Surveys

- [ ] 3.1 Implement the Phase 4 Satisfaction Survey (Self-Consultation) modal/page
- [ ] 3.2 Update student dashboard to show survey prompt for `COMPLETED` assignments
- [ ] 3.3 Connect "Download Certificate" button to the new backend PDF endpoint
- [ ] 3.4 Ensure download is disabled until survey is submitted

## 4. Frontend: Center Dashboard Surveys

- [ ] 4.1 Update Center dashboard to show Phase 4 survey cards for coordinators
- [ ] 4.2 Implement the Center-level satisfaction questionnaire form

## 5. Verification & Testing

- [ ] 5.1 Verify PDF generation with correct student and workshop data
- [ ] 5.2 Test state locking: ensure `COMPLETED` assignments cannot be edited
- [ ] 5.3 Verify that certificates are only accessible after survey completion
