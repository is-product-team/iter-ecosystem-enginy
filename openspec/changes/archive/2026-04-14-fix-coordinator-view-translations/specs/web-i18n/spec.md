## ADDED Requirements

### Requirement: Shared Component Internationalization
All shared UI components used across different role-based views (Admin, Coordinator, Teacher) MUST be fully internationalized and MUST NOT contain any role-specific or language-specific hardcoded strings.

#### Scenario: Pagination component usage
- **WHEN** the `Pagination` component is rendered in any view (e.g., Coordinator Assignments)
- **THEN** all navigational labels ("Previous", "Next", "Page", "of", "Showing") MUST be translated using the current locale's `Common` namespace.

### Requirement: Resource Attribute Translation
Resource-specific attributes such as durations, capacities, and counts MUST be formatted using localized labels defined in the `Common` namespace.

#### Scenario: Displaying workshop duration
- **WHEN** a workshop duration is displayed in the UI (e.g., "12h")
- **THEN** the value MUST be formatted using the `duration_label` key from the `Common` namespace (e.g., `{hours}h`).

#### Scenario: Displaying workshop capacity
- **WHEN** a workshop capacity is displayed in the UI (e.g., "25 Places")
- **THEN** the value MUST be formatted using the `places_label` key from the `Common` namespace (e.g., `{count} Places`).
