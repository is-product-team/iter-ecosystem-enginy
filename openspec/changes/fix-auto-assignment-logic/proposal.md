## Why

The automatic assignment feature (Tetris) was failing to process requests because it remained linked to a legacy `TetrisService` that only fills existing vacant spots. Following the refactor in `@refactor-auto-assignment`, the system should now use `AutoAssignmentService`, which creates assignments by distributing workshop capacity among pending requests. This change bridges the gap between the frontend trigger and the new backend engine.

## What Changes

- **Backend Controller**: Update `tetris.controller.ts` to use `AutoAssignmentService` instead of `TetrisService`.
- **API Response**: Standardize the response from `AutoAssignmentService.generateAssignments` to include `assignmentsCreated` to match frontend expectations.
- **Frontend Integration**: Ensure the `AdminRequestsPage` correctly handles the response and displays success messages with the count of assignments made.

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- `auto-assignment`: Update the scheduling logic to support generative capacity-based distribution rather than just vacancy filling.

## Impact

- **API**: `/api/assignments/tetris` behavior changes from vacancy-filling to generative distribution.
- **Services**: `TetrisService` becomes deprecated/secondary to `AutoAssignmentService`.
- **UI**: Improved reliability of the "Run automatic assignment" button in the Requests management view.
