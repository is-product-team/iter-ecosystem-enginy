## ADDED Requirements

### Requirement: Unified Screen Header Pattern
All primary screens (Inici, Calendari, Perfil) SHALL use a standardized header pattern consisting of a large, light-weight title followed by a normal-weight subtitle, left-aligned at the top of the scrollable content.

#### Scenario: Unified header on Dashboard
- **WHEN** user navigates to the Dashboard (Inici)
- **THEN** the screen displays a large greeting title and a contextual subtitle below it, following the standard typography.

#### Scenario: Unified header on Calendar
- **WHEN** user navigates to the Calendar (Calendari)
- **THEN** the screen displays "Calendari" as the large title and "Agenda acadèmica" as the subtitle below it.

### Requirement: Neutral Dark Theme Palette
The mobile application's dark mode SHALL prioritize neutral dark colors (matching the web's `#171717`) for page backgrounds, avoiding blue-tinted backgrounds in primary navigation containers.

#### Scenario: Dark mode background check
- **WHEN** the system is set to dark mode
- **THEN** the `bg-background-page` variable resolves to the neutral `#171717` color.

### Requirement: Theme-Aware Native Header Tints
Native navigation headers SHALL use theme-aware tint colors for interactive elements (like Back buttons) to ensure accessibility and aesthetic integration, explicitly avoiding hardcoded system defaults like `#007AFF`.

#### Scenario: Back button color check
- **WHEN** navigating into a detail view in dark mode
- **THEN** the native back button displays in a neutral or brand-aligned color defined by the current theme.
