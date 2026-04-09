## ADDED Requirements

### Requirement: Theme-Specific Logo Assets
The web frontend SHALL use specific logo assets for light and dark modes instead of CSS filters like `invert` to ensure brand consistency and optimal visual quality.

#### Scenario: Login logo theme switching
- **WHEN** the user is in light mode
- **THEN** the `logo.png` asset MUST be displayed.
- **WHEN** the user is in dark mode
- **THEN** the `logo-invers.png` asset MUST be displayed.
