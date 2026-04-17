## MODIFIED Requirements

### Requirement: Unified DataTable Core Component
The system SHALL provide a reusable `DataTable` component in the shared UI library that standardizes data presentation across the web application.

#### Scenario: Rendering data in a table
- **WHEN** a developer provides an array of data and a column configuration to the `DataTable`
- **THEN** the component MUST render a responsive table that implements a "Premium Minimalist" design, including a 2px top-accent border, refined typography (10px tracking-widest for headers), and a subtle zebra-striping pattern.

#### Scenario: Rendering interactive cell content
- **WHEN** a column configuration includes a `render` function that returns interactive elements (e.g., buttons, inputs)
- **THEN** the `DataTable` MUST correctly mount these elements and maintain their internal state during re-renders, while ensuring they follow the project's interactive hierarchy (primary vs. muted text).

#### Scenario: User hovers over a data row
- **WHEN** the user moves the pointer over a row in the `DataTable`
- **THEN** the component MUST provide high-fidelity feedback, including a lateral 2px indicator in the project's brand color and a smooth background transition.

### Requirement: Standardized Loading and Empty States
The `DataTable` component SHALL provide consistent visual feedback during data fetching or when no results are found.

#### Scenario: Data is being fetched
- **WHEN** the `loading` prop is set to `true`
- **THEN** the `DataTable` MUST display a row-based skeleton state that maintains the table's structural integrity (columns, header) while providing an "Apple-style" shimmer or pulse animation.

#### Scenario: No results found
- **WHEN** the data array provided to the `DataTable` is empty
- **THEN** the component MUST display a centered, standardized "No results" message featuring a minimalist icon and internationalized text following the premium design system.
