## ADDED Requirements

### Requirement: Integrated DataTable Toolbar
The system SHALL provide a `DataTableToolbar` component that integrates title, actions, and filtering into a single, cohesive unit for data-heavy administrative views.

#### Scenario: Rendering the toolbar with all elements
- **WHEN** the `DataTableToolbar` is rendered with `title`, `icon`, `resultsCount`, `search`, `filters`, and `actions`
- **THEN** it MUST display the title and icon on the top-left, the results count and actions on the top-right, and the filter grid immediately below the header.

### Requirement: Sharp Grid Filtering System
The `DataTableToolbar` SHALL implement a "sharp" filter grid with no rounded corners or shadows, using consistent borders and background colors.

#### Scenario: Displaying the filter grid
- **WHEN** filters are provided to the toolbar
- **THEN** the system MUST render them in a grid where each item is enclosed in a cell with `1px border-border-subtle` and `bg-background-subtle`.

#### Scenario: Grid border alignment
- **WHEN** the toolbar is placed immediately above a `DataTable`
- **THEN** the vertical and horizontal borders MUST align perfectly without doubling or gaps.

### Requirement: Responsive Filter Layout
The `DataTableToolbar` SHALL provide a responsive layout that adapts the filter grid based on viewport size.

#### Scenario: Toolbar on mobile devices
- **WHEN** the viewport width is less than 768px
- **THEN** the filter grid MUST stack all filters vertically in a single column.

#### Scenario: Toolbar on desktop devices
- **WHEN** the viewport width is greater than 1024px
- **THEN** the filter grid MUST distribute filters across multiple columns (up to 4) to optimize space.
