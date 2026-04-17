## MODIFIED Requirements

### Requirement: Unified DataTable Core Component
The system SHALL provide a reusable `DataTable` component in the shared UI library that standardizes data presentation across the web application.

#### Scenario: Rendering data in a table
- **WHEN** a developer provides an array of data and a column configuration to the `DataTable`
- **THEN** the component MUST render a responsive, styled table following the "Premium" design pattern defined in `globals.css`.

#### Scenario: Rendering interactive cell content
- **WHEN** a column configuration includes a `render` function that returns interactive elements (e.g., buttons, inputs)
- **THEN** the `DataTable` MUST correctly mount these elements and maintain their internal state during re-renders.

#### Scenario: Aligning interactive actions
- **WHEN** a column is designated for row actions (e.g., Approve, Reject, Edit)
- **THEN** the system SHALL allow centering these elements to improve visual balance in dense admin views.
- **WHEN** space is limited or a cleaner aesthetic is required
- **THEN** row actions MUST use intuitive iconography with accessible labels instead of text-only buttons.
