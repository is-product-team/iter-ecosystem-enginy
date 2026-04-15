## Why

Currently, the Phase 3 (Execution) logic has several structural weaknesses that hinder scalability and traceability:
1. **Traceability Gap**: Attendance records (`Attendance` model) are linked to a session number and date, but not to the `Session` entity itself. This means we don't have a reliable record of exactly which teacher (staff assigned to a session) took the attendance.
2. **Operational Friction**: School coordinators must manually assign teachers to each individual session. For a workshop with many sessions, this is a repetitive and error-prone task.
3. **Rigid Activation**: The current "All or Nothing" validation requirement (Phase 2 must be 100% complete before any Phase 3 action) doesn't reflect the messy reality of school start dates.
4. **Mobile UX Gaps**: The mobile app lacks a "Mark All Present" feature and doesn't clearly show the offline synchronization status, leading to teacher frustration.

## What Changes

- **Schema Evolution**: 
    - Link `Attendance` directly to `Session` ID.
    - Add a `referentTeacherId` to the `Assignment` model to allow for automatic/default teacher assignment across all sessions.
- **Backend Enhancements**:
    - Implement bulk teacher assignment endpoints.
    - Create a "Grace Period" logic that allows sessions to start even if some documentation is pending validation, with proper warnings.
- **Mobile App Polish**:
    - Add "Mark All Present" toggle in the attendance screen.
    - Implement a visual "Sync Status" indicator (Online/Offline/Pending).
    - Display "Image Rights" warnings next to student names for safety.
- **Coordination UI**:
    - Add a "Set Default Teacher" button in the Assignment details page that propagates to all empty sessions.

## Capabilities

### New Capabilities
- `default-teacher-auto-assignment`: Workshops can now have a primary teacher assigned by default to all its sessions.
- `session-attendance-linkage`: Guaranteed traceability between who was assigned to a session and who took the attendance.

### Modified Capabilities
- `attendance-tracking`: Improved with bulk actions and safety indicators (Image Rights).
- `workshop-activation`: Smoother transition from Phase 2 to Phase 3 with flexibility for pending validations.

## Impact

- **User Experience**: Coordinators save significant time on scheduling; Teachers have a faster, safer, and more reliable app experience.
- **Data Integrity**: We gain a perfect audit trail of attendance vs. assigned staff.
- **Safety**: Teachers are explicitly warned in the app about students without image rights.
