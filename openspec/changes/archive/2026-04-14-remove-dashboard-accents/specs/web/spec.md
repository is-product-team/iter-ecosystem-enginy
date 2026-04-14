## ADDED Requirements

### Requirement: Minimalist Dashboard Cards
Dashboard navigation cards SHALL NOT include decorative absolute-positioned elements (ribbons or corner shapes).

#### Scenario: Card appearance
- **WHEN** the dashboard is loaded
- **THEN** navigation cards MUST have a clean, border-only appearance without decorative "picos" or side ribbons.

### Requirement: Standardized Hover Border
Dashboard cards SHALL NOT increase their border width on hover. They SHALL only change the border color to indicate interactivity.

#### Scenario: Card interaction
- **WHEN** the user hovers over a navigation card
- **THEN** the border color MUST change (to `consorci-darkBlue`), but the border width MUST remain consistent.
