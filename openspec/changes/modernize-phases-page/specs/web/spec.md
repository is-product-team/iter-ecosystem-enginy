## ADDED Requirements

### Requirement: Modernized Phase Management UI
The Phase Management interface SHALL follow the "Minimalist Sharp" design system, ensuring visual consistency with other admin pages.

#### Scenario: Visual consistency
- **WHEN** the user navigates from the Admin Dashboard to the Phase Management page
- **THEN** the font weights, spacing, and card styles MUST remain consistent (e.g., using `font-medium` instead of `font-black`).

### Requirement: Standardized Status Indicators
Active phases SHALL be indicated using clear, theme-consistent badges and subtle border highlights.

#### Scenario: Phase activation state
- **WHEN** a phase is active
- **THEN** it MUST be marked with a `consorci-darkBlue` badge and a subtle border, avoiding oversized 8px borders.
