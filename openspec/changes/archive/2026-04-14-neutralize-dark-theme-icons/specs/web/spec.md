## ADDED Requirements

### Requirement: Neutral Icon Pattern in Dark Mode
The web frontend SHALL use neutral colors (white or light gray) for icons on dark backgrounds to ensure high contrast and a premium look.

#### Scenario: Icon contrast in dark mode
- **WHEN** the application is in dark mode
- **THEN** icons MUST be rendered in a neutral color (`text-text-primary` or `white`) instead of the institutional dark blue.

### Requirement: Fill-only Brand Color Usage
The institutional dark blue SHALL ONLY be used as a solid background color when combined with white text/icons in dark mode.

#### Scenario: Active/Hover states
- **WHEN** an element is hovered or active in dark mode
- **THEN** the background MAY become the institutional dark blue, provided the foreground (icon/text) is white.
