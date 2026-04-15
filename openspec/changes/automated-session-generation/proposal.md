## Why

Currently, school coordinators must manually click a "Confirm and Generate Sessions" button after validating all student documentation. This creates unnecessary friction and a disconnect between fulfilling requirements (Phase 2) and starting the workshop (Phase 3). By automating this, we ensure that as soon as a workshop is "ready" (all docs validated), it becomes "active" without human intervention, improving the platform's perceived intelligence and efficiency.

## What Changes

- **Backend Logic**: 
    - Automate session generation to occur as soon as an assignment is created (starting in a `PROVISIONAL` or `DATA_ENTRY` state).
    - Implement an automatic trigger in `validateEnrollmentDocument` that transitions the assignment to `IN_PROGRESS` once all required documents are validated for all enrolled students.
- **Frontend UI**:
    - Remove the redundant "Confirm and Generate Sessions" button from the coordinator's assignment view.
    - Added clear visual feedback when a workshop is automatically activated.

## Capabilities

### New Capabilities
- `automated-activation`: Workshops automatically transition to active status upon meeting documentation requirements.

### Modified Capabilities
- `assignment-management`: Unified the manual approval and automatic activation flows.

## Impact

- **User Experience**: Coordinators no longer need to perform a final manual step to start a workshop.
- **Data Consistency**: Sessions are always generated early, allowing early visibility in calendars.
- **API**: Deprecates the explicit `confirm-registration` endpoint in favor of automatic triggers during validation.
