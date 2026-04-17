## ADDED Requirements

### Requirement: Unified monitoring namespace
The system SHALL resolve all monitoring-related translation keys (title, subtitle, description, KPI metadata) from the `Center.Monitoring` namespace.

#### Scenario: Dashboard translation resolution
- **WHEN** the Coordinator Dashboard is rendered in any supported locale (ca, es, en, ar)
- **THEN** the `Monitoring.description` key MUST resolve without `MISSING_MESSAGE` console errors

### Requirement: Removal of translation shadowing
The system SHALL NOT contain duplicate `Monitoring` keys at different nesting levels within the same locale file to prevent ambiguous lookups.

#### Scenario: Single definition lookup
- **WHEN** a translation key for `Monitoring` is requested
- **THEN** only one instance of the `Monitoring` object SHALL exist in the locale JSON to ensure predictable resolution
