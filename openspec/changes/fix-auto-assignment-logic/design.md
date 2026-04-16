## Context

The current automatic assignment flow is disjointed:
- **Frontend**: Calls `/api/assignments/tetris`.
- **Backend (Old)**: `tetris.controller.ts` calls `TetrisService.processVacancies()`.
- **Backend (New)**: `AutoAssignmentService.generateAssignments()` contains the desired refactored logic but is not triggered by the dashboard.

## Goals / Non-Goals

**Goals:**
- Bridge the "Tetris" button to the `AutoAssignmentService`.
- Normalize API responses for UI feedback.
- Preserve the capacity-filling distribution logic.

**Non-Goals:**
- Changing the distribution algorithm (already refactored).
- Implementing student-level auto-enrollment (Phase 2).

## Decisions

### 1. Controller Mapping
We will modify `tetris.controller.ts` to instantiate and use `AutoAssignmentService`.
- **Old**: `tetrisService.processVacancies()`
- **New**: `autoAssignmentService.generateAssignments()`

*Rationale:* This allows the existing frontend infrastructure to benefit from the new logic without changing API routes.

### 2. Standardize Output
The `AutoAssignmentService.generateAssignments` return object will be updated:
- **From**: `{ processed: number }`
- **To**: `{ assignmentsCreated: number }`

*Rationale:* The frontend specifically looks for `assignmentsCreated` to show the toast notification.

### 3. Data Flow Diagram
```
┌─────────────────┐       ┌────────────────────────┐       ┌────────────────────────┐
│  Admin Dashboard │       │   Tetris Controller    │       │ AutoAssignmentService  │
│ (Run Assignment) │──────▶│    (POST /tetris)      │──────▶│ (generateAssignments)  │
└─────────────────┘       └────────────────────────┘       └───────────┬────────────┘
         ▲                                                             │
         │                ┌────────────────────────┐                   │
         └────────────────┤   Response with        │◀──────────────────┘
                          │   assignmentsCreated   │
                          └────────────────────────┘
```

## Risks / Trade-offs

- **[Risk]** The old `TetrisService` functionality (filling existing VACANT assignments) might be bypassed.
- **[Mitigation]** The new `AutoAssignmentService` calculates `remainingCapacity` based on total places minus current enrollments, effectively covering "vacancies" during the generative process.
