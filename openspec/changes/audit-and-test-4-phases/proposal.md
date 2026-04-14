## Why

The Iter Ecosystem's 4 core phases (Solicitud, Planificación, Ejecución, Cierre) currently lack unified end-to-end validation. My initial audit revealed brittle UI logic for document verification, inconsistent nomenclature in the backend, and hardcoded gaps in statistics reporting. 

This change will establish a robust testing and monitoring layer for the entire workshop lifecycle to ensure data integrity and a seamless coordinator experience.

## What Changes

- **Backend Logic**:
    - Refactor `phase3-stats.controller.ts` to correctly map center names and staff gaps.
    - Standardize phase naming in `assignment.controller.ts` and related services.
- **Automated Testing**:
    - **[NEW]** `phase-sanity.test.ts`: A complete integration test covering the transition of a Workshop from Phase 1 (Request) to Phase 4 (Closure).
- **Frontend Refinement**:
    - Refactor `verifications/page.tsx` to use type-safe document field mapping instead of brittle string replacements.
- **Shared Constants**:
    - Update `PHASES` constants to ensure alignment between API, Web, and Database.

## Capabilities

### New Capabilities
- `phase-lifecycle-assurance`: Unified framework for validating workshop state transitions and document compliance across all 4 phases.

### Modified Capabilities
- `testing/validation`: Enhancing core validation requirements to include automated phase sanity checks.

## Impact

- **Affected Code**: `apps/api/src/controllers/`, `apps/web/app/[locale]/verifications/`, `packages/shared/`.
- **APIs**: Minor updates to Phase 3 stats response structure for better naming.
- **System**: Improved reliability of the workshop lifecycle transitions.
