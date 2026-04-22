## MODIFIED Requirements

### Requirement: Unified DataTable Core Component
The system SHALL provide a reusable `DataTable` component in the shared UI library that standardizes data presentation across the web application.

#### Scenario: Rendering data in a table
- **WHEN** a developer provides an array of data and a column configuration to the `DataTable`
- **THEN** the component MUST render a responsive, styled table following the "Premium" design pattern defined in `globals.css`.

#### Scenario: Rendering interactive cell content
- **WHEN** a column configuration includes a `render` function that returns interactive elements (e.g., buttons, inputs)
- **THEN** the `DataTable` MUST correctly mount these elements and maintain their internal state during re-renders.

#### Scenario: Rendering table with different styling variants
- **WHEN** the `variant` prop is set to `'simple'`
- **THEN** the `DataTable` MUST NOT render the blue top border (`border-t-2 border-t-consorci-darkBlue`).
- **WHEN** the `variant` prop is omitted or set to `'default'`
- **THEN** the `DataTable` MUST render the blue top border.
