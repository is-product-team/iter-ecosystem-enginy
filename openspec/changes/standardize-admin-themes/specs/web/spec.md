## ADDED Requirements

### Requirement: Semantic Color Usage in Admin
All administrative interface elements SHALL use semantic CSS variables (CSS variables prefixed with `--bg-`, `--text-`, `--border-`) instead of hardcoded hex or Tailwind default color scales.

#### Scenario: Dark theme background adaptation
- **WHEN** the application is in dark mode
- **THEN** all dashboard cards and data tables MUST use `bg-background-surface` (dark gray) instead of `bg-white`.

#### Scenario: Border visibility in dark mode
- **WHEN** the application is in dark mode
- **THEN** borders MUST use `border-border-subtle` to remain visible and high-quality without being harsh white or light gray.

### Requirement: Hover State Consistency
Hover states in admin lists and tables SHALL use standard background sub-surface colors that adapt to the current theme.

#### Scenario: List item hover
- **WHEN** a user hovers over a table row or list item in dark mode
- **THEN** the background MUST change to `bg-background-subtle` instead of `bg-gray-50`.
