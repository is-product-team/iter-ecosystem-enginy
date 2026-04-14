# Tasks: Phase 3 Monitoring and Reliability Fixes

## Phase 0: Research & Planning
- [x] Understand Phase 3 requirements (Operational Execution)
- [x] Audit current session synchronisation logic
- [x] Identify orphan incident tracking issues

## Phase 1: Relational Integrity & Backend Support
- [x] Link `Issue` model to `Assignment` and `Session` in Prisma
- [x] Refactor `SessionService.syncSessionsForAssignment` to preserve staff
- [x] Implement `Phase3StatsController` for aggregated health metrics
- [x] Register new monitoring routes in `api/src/routes/index.ts`

## Phase 2: Localization & Frontend Scaffolding
- [x] Add Monitoring translation keys in `ca.json` and `es.json`
- [x] Merge duplicate keys and clean up JSON structure
- [x] Update `Navbar.tsx` with "Monitoring" link for Coordinators

## Phase 3: Dashboard UI Implementation
- [x] Create `Phase3Monitor` page component
- [x] Implement `KPIOverview` for operational metrics
- [x] Implement `AssignmentMonitorCard` with progress and health "semaphores"
- [x] Implement `IncidentFeed` for real-time issue tracking

## Phase 4: Verification & Handover
- [x] Fixed syntax errors in backend routes
- [x] Resolved duplicate keys in translation files
- [x] Created comprehensive walkthrough
- [x] Add "Monitoring" tab/view to the existing `SessionsListPage`.
- [x] Update `AssignmentCard` in the main dashboard to show progress.
- [x] Final verification of "Cascade Wipe-out" fix with a script.
