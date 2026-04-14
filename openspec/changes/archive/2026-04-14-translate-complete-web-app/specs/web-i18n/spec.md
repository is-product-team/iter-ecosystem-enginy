## ADDED Requirements

### Requirement: Full UI Translation
The web application SHALL ensure that 100% of the user interface text is driven by the `next-intl` translation system, allowing the entire application to be viewed in Catalan or Spanish based on the active locale.

#### Scenario: Switching language on Admin Dashboard
- **WHEN** the user switches the language to "Català" on the Admin Dashboard
- **THEN** all titles, labels, and descriptions (e.g., "Workshop Management", "Center Management") are displayed in Catalan.

#### Scenario: Switching language on Center Dashboard
- **WHEN** the user switches the language to "Castellano" on the Center Dashboard
- **THEN** all dashboard cards and phase descriptions are displayed in Spanish.

### Requirement: Shared Component Localization
All shared components, including the Navbar, Breadcrumbs, and Footer, SHALL be fully localized and respond correctly to locale changes.

#### Scenario: Localized Navigation
- **WHEN** a user navigates between localized routes (e.g., `/ca/admin` to `/es/admin`)
- **THEN** the Navbar links and breadcrumbs update their text to match the target language.
