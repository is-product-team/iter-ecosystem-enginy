## ADDED Requirements

### Requirement: E2E Phase Sanity Tests
The API backend MUST implement an automated integration test that validates the workshop lifecycle from Phase 1 to Phase 4.

#### Scenario: Full lifecycle integration
- **WHEN** `npm run test:sanity` is executed
- **THEN** the system SHALL verify a complete workshop flow (Solicitud -> Planificación -> Ejecución -> Cierre).
