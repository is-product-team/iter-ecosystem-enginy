# Design - Automated Session Generation

## Overview
This design implements a "Live Sync" approach where sessions are generated early in the process and the workshop activation happens automatically once all regulatory requirements (documentation) are met.

## Architectural Changes

### 1. Early Session Generation (Backend)
- **Manual Approval**: Modify `assignmentController.createAssignmentFromRequest` in `apps/api/src/controllers/assignment.controller.ts` to call `SessionService.syncSessionsForAssignment(assignment.id)` immediately after creation.
- **Automatic Approval (Tetris)**: Modify `AutoAssignmentService.generateAssignments` in `apps/api/src/services/auto-assignment.service.ts` to ensure sessions are triggered for every new assignment created by the engine.
- **Status Initial State**: Assignments will start in `DATA_ENTRY` status, but with sessions already populated (in a "Tentative/Provisional" logical state, though stored in the same `Session` table).

### 2. Automated Activation Trigger (Backend)
- **New Helper**: Create `assignmentService.checkAndActivateAssignment(assignmentId)` in the backend.
- **Logic**:
    1. Fetch the assignment with all its `enrollments`.
    2. Check if every enrollment has all 3 required documents validated (`isPedagogicalAgreementValidated`, `isMobilityAuthorizationValidated`, `isImageRightsValidated`).
    3. If all documents for ALL enrolled students are valid:
        - Set `cebRegistrationConfirmed: true` for all enrollments.
        - Update assignment status to `IN_PROGRESS`.
        - Send the `registration_confirmed` notification to the center.
- **Integration**: Call this helper at the end of `validateEnrollmentDocument` in `assignment.controller.ts`.

### 3. UI Simplification (Frontend)
- **Assignment View**: Remove the "Finalize" section / "Confirm i Generar Sessions" button in `apps/web/app/[locale]/center/assignments/[id]/page.tsx`.
- **Status Indicators**: Ensure the UI clearly shows "Taller en proceso" (In Progress) and "Documentación pendiente" based on the current `status` field.

## Data Schema
No changes to the schema are strictly required as we already have `AssignmentStatus.IN_PROGRESS` and `AssignmentStatus.DATA_ENTRY`.

## Risks & Considerations
- **Session Refinement**: If a coordinator changes the number of students after sessions are generated, we must ensure `syncSessionsForAssignment` handles updates cleanly.
- **Notification Noise**: Ensure the notification only fires once when the status transitions to `IN_PROGRESS`.
