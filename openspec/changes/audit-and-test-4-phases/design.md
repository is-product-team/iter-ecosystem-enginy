## Context

The Iter Ecosystem manages the lifecycle of vocational workshops through 4 sequential phases. Currently, these phases are loosely coupled at the data level, leading to potential inconsistencies:
- **Phase 1 (Solicitud)**: Requests can remain orphaned if not properly converted to assignments.
- **Phase 2 (Planificación)**: Document verification relies on brittle string-based property access in the frontend.
- **Phase 3 (Ejecución)**: Statistics reporting has minor bugs (missing center names) and staff gap detection is simplistic.
- **Phase 4 (Cierre)**: Closure logic triggered manually but lack automated validation of prerequisites.

## Goals / Non-Goals

**Goals:**
- Implement a **Phase Sanity Test** that validates the state transition from Phase 1 to Phase 4.
- Standardize phase nomenclature across API and Web.
- Refactor the Admin document verification interface for robustness.
- Fix identified bugs in Phase 3 statistics reporting.

**Non-Goals:**
- Changing the underlying database schema.
- Implementing new UI features beyond fixing current bugs.

## Decisions

### 1. Integration Testing Strategy
We will implement an E2E API test using `vitest` and `supertest`. 
- **Rationale**: While unit tests cover individual functions, the phase transitions require verifying the state in the database across multiple API calls.
- **Alternatives**: Playwright (too heavy for logic verification), Manual testing (not scalable).

### 2. Document Field Mapping Refactor
Introduce a `DOCUMENT_SCHEMA` constant to map technical backend fields to user-friendly labels and UI metadata.
- **Rationale**: Currently, `verifications/page.tsx` uses `.replace('is', '').replace('Validated', 'Url')`. This is fragile. A static map ensures stability.

### 3. Unified Phase Flow Diagram

```ascii
+----------------+       +-------------------+       +-------------------+       +----------------+
|   SOLICITUD    | ----> |   PLANIFICACIÓN   | ----> |     EJECUCIÓN     | ----> |     CIERRE     |
| (Request.PEND) |       | (Assig.PUBLISHED) |       | (Assig.IN_PROG)   |       | (Assig.COMPL)  |
+-------+--------+       +---------+---------+       +---------+---------+       +--------+-------+
        |                          |                           |                          |
   Admin Approves           Enroll Students             Generate Sessions          Issue Certs
   & Creates Assig          & Upload Docs               & Track Attendance         & Evaluations
```

## Risks / Trade-offs

- **[Risk]** Test Side Effects → **[Mitigation]** Use a unique "TEST_WORKSHOP" prefix and delete created data in `afterAll`.
- **[Risk]** Breaking existing UI with nomenclature changes → **[Mitigation]** Ensure `i18n` keys are updated in sync with constant changes.
