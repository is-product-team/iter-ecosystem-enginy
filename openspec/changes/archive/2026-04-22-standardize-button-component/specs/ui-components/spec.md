## ADDED Requirements

### Requirement: Standardized Button Variants
The system SHALL provide a centralized Button component in the web application with three distinct visual variants:
- **Primary**: Solid background using the institutional dark blue color.
- **Outline**: Transparent background with a dark blue border and text.
- **Link**: Transparent background with underlined dark blue text.

#### Scenario: Switching between variants
- **WHEN** a developer sets the `variant` prop to `primary`, `outline`, or `link`
- **THEN** the button SHALL render with the corresponding visual style consistently across the application.

### Requirement: Standardized Button Sizes
The Button component SHALL support three sizes to manage information density:
- **Small (sm)**: 12px font size with compact padding.
- **Medium (md)**: 14px font size with standard padding.
- **Large (lg)**: 16px font size with generous padding.

#### Scenario: Applying different sizes
- **WHEN** a developer sets the `size` prop to `sm`, `md`, or `lg`
- **THEN** the button SHALL adjust its font size and padding to match the specified density.

### Requirement: Subtle Interactive States
The system SHALL ensure that hover and active states for buttons are subtle and professional, avoiding decorative scale transformations (enlarging/shrinking).
- **Hover**: SHALL transition the text or background color to a lighter blue (`consorci-lightBlue`).
- **Active**: SHALL maintain the hover color or apply a slightly darker tone without changing the element's scale.

#### Scenario: Hovering over a primary button
- **WHEN** the user moves the cursor over a primary button
- **THEN** the background SHALL smoothly transition to the light blue brand color over a 0.2s duration.

### Requirement: Right-Aligned Icon Support
The Button component SHALL support the inclusion of an icon positioned to the right of the button label, with appropriate spacing.

#### Scenario: Button with right-aligned icon
- **WHEN** a developer provides an `icon` prop to the Button component
- **THEN** the icon SHALL render to the right of the text label with consistent gap spacing.

### Requirement: Content-Based Sizing
By default, the Button component SHALL be `inline-flex`, occupying only the width required by its content. It SHALL also provide an optional `fullWidth` prop to fill the parent container.

#### Scenario: Default vs Full Width
- **WHEN** the `fullWidth` prop is absent, the button SHALL shrink to fit its text
- **WHEN** the `fullWidth` prop is true, the button SHALL expand to 100% of its parent container.
