# Proposal: Phase 3 Monitoring and Reliability Fixes

## Problem
Phase 3 (Operational Execution) is currently a collection of list views that lack an intuitive overview for coordinators. Additionally, several technical "smells" threaten data integrity:
1. **Staff Wipe-out**: Syncing course dates deletes existing session staff assignments.
2. **Disconnected Incidents**: Incidents are tied to centers but not to the sessions where they happen.
3. **Implicit Relations**: Attendance is linked to assignments and dates but not directly to session objects.

## Proposed Solution
Convert the Phase 3 experience into a **Visual Monitoring Hub** and fix core service logic:
- **Intuitive Dashboard**: A "Command Center" view for coordinators with progress tracking and attendance alerts.
- **Relational Integrity**: Link incidents to sessions and protect staff assignments during date synchronization.
- **Unified Progress**: Calculate attendance "health" at the assignment level.

## Scope
- New Coordinator Dashboard for Phase 3.
- Prisma schema updates for `Issue` relations.
- Reliability improvements to `SessionService`.
- Integration of "Status Semaphores" (Green/Yellow/Red) for session monitoring.
