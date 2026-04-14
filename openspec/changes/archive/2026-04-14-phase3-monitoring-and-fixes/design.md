# Design: Phase 3 Monitoring and Reliability Fixes

## Architecture

### 1. Data Model Enhancements
Modify `Issue` (incidencies) to support optional linkage to specific sessions:
```prisma
model Issue {
  // ... existing fields
  assignmentId Int?
  assignment   Assignment? @relation(fields: [assignmentId], references: [assignmentId])
  sessionId    Int?
  session      Session?    @relation(fields: [sessionId], references: [sessionId])
}
```

### 2. Service Logic (SessionService)
Update `syncSessionsForAssignment` to:
1. Identify existing `SessionTeacher` assignments.
2. If sessions are recreated, migrate the staff assignments to the new sessions based on `sessionNumber` or date proximity.
3. Throw error or prevent sync if significant attendance data exists (already partially implemented, but needs refinement).

### 3. API - Monitoring Endpoint
New endpoint: `GET /api/stats/center/:id/phase3`
Returns:
- `activeAssignments`: Summary of progress per assignment.
- `pendingAttendance`: Count of sessions passed with no attendance recorded.
- `recentIncidents`: Latest issues relevant to this center.

### 4. Frontend - Phase 3 Monitor
A grid-based dashboard using:
- **KPI Cards**: Big numbers for sessions today and pending sheets.
- **Assignment Hub**: Cards with `<ProgressBar value={completed} total={total} />` and a status icon for attendance.
- **Quick Action Drawer**: To add incidents directly from a session view.

## UI/UX Design

### Status Indicators
- **Healthy (Green)**: All passed sessions have attendance.
- **Warning (Yellow)**: Future sessions have no staff assigned.
- **Critical (Red)**: Passed sessions missing attendance or active incidents.
