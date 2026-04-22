## MODIFIED Requirements

### Requirement: Unified DataTable Core Component
The system SHALL provide a reusable `DataTable` component in the shared UI library that standardizes data presentation across the web application. The component SHALL support visual integration with the `DataTableToolbar` by optionally omitting its top border to prevent doubling.

#### Scenario: Rendering data in a table
- **WHEN** a developer provides an array of data and a column configuration to the `DataTable`
- **THEN** the component MUST render a responsive, styled table following the "Premium" design pattern defined in `globals.css`.

#### Scenario: Rendering interactive cell content
- **WHEN** a column configuration includes a `render` function that returns interactive elements (e.g., buttons, inputs)
- **THEN** the `DataTable` MUST correctly mount these elements and maintain their internal state during re-renders.

#### Scenario: Integration with DataTableToolbar
- **WHEN** the `DataTable` is used in conjunction with a `DataTableToolbar`
- **THEN** it MUST allow for a `hideTopBorder` or similar prop to ensure perfect visual continuity with the toolbar's bottom border.
