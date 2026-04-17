## ADDED Requirements

### Requirement: Standardized Data Presentation
The web application SHALL use the unified `DataTable` component for all tabular data presentation to ensure consistency across Admin and Coordinator views.

#### Scenario: Admin views workshop requests
- **WHEN** the user navigates to a list-based page (e.g., `/requests`)
- **THEN** the system MUST employ the `DataTable` component for rendering the list of entities.
