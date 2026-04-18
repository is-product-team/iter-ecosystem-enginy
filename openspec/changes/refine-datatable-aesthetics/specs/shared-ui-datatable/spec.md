## MODIFIED Requirements

### Requirement: Unified DataTable Core Component
The system SHALL provide a reusable `DataTable` component in the shared UI library that standardizes data presentation across the web application.

#### Scenario: Rendering data in a table
- **WHEN** a developer provides an array of data and a column configuration to the `DataTable`
- **THEN** the component MUST render a responsive table that implements a "Premium Minimalist" design, featuring a sticky header with `backdrop-blur` and a stable lateral hover indicator on the first cell.

#### Scenario: Adjusting table density
- **WHEN** a developer provides a `density` prop (`compact`, `normal`, or `spacious`) to the `DataTable`
- **THEN** the component MUST adjust the row padding and font-size configurations to match the requested visual density.

### Requirement: Standardized Loading and Empty States
The `DataTable` component SHALL provide consistent visual feedback during data fetching or when no results are found.

#### Scenario: Data is being fetched
- **WHEN** the `loading` prop is set to `true`
- **THEN** the `DataTable` MUST display a row-based skeleton state with randomized widths for placeholders to mimic realistic data patterns.
