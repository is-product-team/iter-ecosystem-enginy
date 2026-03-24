# Specification: Enrollment & Validation

This capability ensures that all student participants are correctly registered and that their legal documentation (agreements, authorizations) is validated before a workshop begins.

## 1. Nominal Registration (Enrollment)

Centers must provide a list of students for each workshop assignment.

- **Process**: The center selects students from their registry to associate them with an assignment (`id_assignment`).
- **Constraints**: 
  - **Modality C**: Strictly limited to a maximum of **4 students** per center.
  - **Capacity**: Total enrollments cannot exceed the workshop's `places_maximes`.
- **Sync Logic**: The system performs a diff-based synchronization (adding new, removing unselected) within a database transaction.

## 2. Document Requirements

Each enrollment requires three mandatory documents for compliance:

| Document | Description |
| :--- | :--- |
| **Acord Pedagògic** | Educational agreement signed by the center and the student. |
| **Autorització Mobilitat** | Permission for students to travel/participate. |
| **Drets d'Imatge** | Consent for using the student's image in program materials. |

## 3. Upload & Sanitization

Documents are uploaded to the file system (`/uploads/documents/`) with a strict naming convention:
`[student_name]_[course]_[workshop_title]_[doc_type]_[timestamp].[ext]`

This ensures traceability and prevents filename collisions.

## 4. Validation Workflow

Validation is a multi-tier process to ensure legal compliance:

### 🤖 AI-Powered Validation (Vision AI)
Upon upload, the **Vision AI service** performs a preliminary check:
- **Format Verification**: Ensures the file is a valid PDF.
- **Signature Detection**: Scans the document for a signature in the expected area.
- **Auto-Rejection**: If a signature is missing or the document is blank, the upload is rejected immediately with feedback.

### 👤 Manual Administrative Review
Administrators perform the final validation in the panel:
- **Status Flags**: `validat_acord_pedagogic`, `validat_autoritzacio_mobilitat`, `validat_drets_imatge`.
- **Center Feedback**: If a document is incorrect, the admin can trigger a **"Documentación Incorrecta"** notification with specific comments.

## 5. Transition to Execution
A workshop assignment cannot transition to the `IN_PROGRESS` state until the mandatory checklist items (including "Registro Nominal" and "Documentación") are marked as completed.
