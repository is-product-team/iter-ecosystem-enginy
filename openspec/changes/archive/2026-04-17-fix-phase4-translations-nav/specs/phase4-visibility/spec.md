## ADDED Requirements

### Requirement: Tabbed Workshop Separation
The Monitoring page SHALL implement a tabbed interface to distinguish between active workshops (Phase 3) and completed workshops (Phase 4).

#### Scenario: Switching to Completed tab
- **WHEN** the user selects the "Completed" tab
- **THEN** the system SHALL filter the list to show only assignments with status 'COMPLETED'

#### Scenario: Navigation from Dashboard
- **WHEN** the user clicks the Phase 4 card in the Dashboard
- **THEN** the system SHALL redirect to `/center/monitoring?tab=completed` and activate the corresponding tab automatically

### Requirement: Translation Integrity
The system MUST provide valid translation keys for `Monitoring.description`, `Closure.title`, and `Closure.description` within the `Center` namespace in all supported languages.

#### Scenario: Dashboard rendering
- **WHEN** the Coordinator Dashboard is loaded
- **THEN** the system SHALL NOT emit `MISSING_MESSAGE` console errors for the Phase 3 or Phase 4 cards
