## 1. Backend Logic Verification

- [x] 1.1 Verify `ClosureService` prevents workshop closure if no teacher evaluations exist.
- [x] 1.2 Validate that `CertificateService` correctly calculates $\ge$ 80% attendance including `JUSTIFIED_ABSENCE`.
- [x] 1.3 Confirm that `ClosureService` only triggers notifications for students with created `Certificate` records.

## 2. Security & Access Control Verification

- [x] 2.1 Verify `CertificateController.getMyCertificates` correctly filters surveys per-student.
- [x] 2.2 Test `CertificateController.downloadCertificate` for 403 Forbidden when individual survey is missing.
- [x] 2.3 Ensure coordinators and admins have appropriate bulk download access.

## 3. Frontend & UI Verification

- [x] 3.1 Verify `CloseWorkshopSection` displays correct certification status (Will Certify / Need Eval / No Cert).
- [x] 3.2 Test the "Close Workshop" button triggers the backend orchestration and reloads the data.

## 4. Documentation & PR Reporting

- [x] 4.1 Generate a consolidated Markdown report summarizing all Phase 4 improvements for the Pull Request description.
