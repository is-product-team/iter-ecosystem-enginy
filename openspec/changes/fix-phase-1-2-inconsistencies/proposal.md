# Proposal: Fix Phase 1 & 2 Inconsistencies

## Problem
During the analysis of the ecosystem's core flows, several critical implementation gaps and bugs were identified:
1. **Field Mismatch**: The Shared Zod schema uses `approxStudents` while the API/Database uses `studentsAprox`. This causes validation errors and data inconsistency.
2. **Broken Checklist**: The auto-update of the "Designate Teachers" step in Phase 2 fails because the step name literal in the creation logic (`DESIGNATE_TEACHERS`) does not match the search literal in the update logic (`Referent Teachers`).
3. **Missing Audit Logs**: There is no tracking in the `AuditLog` table for Request approvals or rejections, making the system less transparent for administrators.
4. **Weak Phase Enforcement**: Phase 2 lacks global checks against the system phase calendar, relying purely on manual assignment statuses.

## Solution
We propose a comprehensive fix that standardizes the flow between Phase 1 and Phase 2:
1. **Standardize Field Names**: Rename `approxStudents` to `studentsAprox` across the entire monorepo (Shared Schema, API, and Web App).
2. **Sync Checklist Steps**: Introduce a centralized constant for checklist step names in the `shared` library and use it throughout the API.
3. **Enhance Auditability**: Add systematic audit logging for all status changes in the `Request` model.
4. **Refine Logic**: Ensure teachers designated in Phase 1 (Request) are correctly and robustly transferred to Phase 2 (Assignment).

## Benefits
- **Reliability**: Eliminates validation errors and ensures data flows correctly from request to assignment.
- **Maintainability**: Centralizing checklist names prevents future bugs caused by "magic strings".
- **Accountability**: Provides a full audit trail for administrative decisions.
