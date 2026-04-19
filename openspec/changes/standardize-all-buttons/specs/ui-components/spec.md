## ADDED Requirements

### Requirement: Global Adoption of Button Component
The system SHALL mandate the use of the standardized `<Button />` component for all interactive triggers within the web application. Native `<button>` tags with manual Tailwind classes SHALL be considered deprecated technical debt and must be migrated.

#### Scenario: Replacing manual form buttons
- **WHEN** a developer is updating a form (e.g., Center Creation, Student Selection)
- **THEN** they SHALL use the `<Button />` component with the `primary` variant for submissions and `outline` or `link` for cancellations.

#### Scenario: Standardizing table and list actions
- **WHEN** interactive elements (edit, delete, view) are rendered in tables or lists
- **THEN** they SHALL use the `<Button />` component, leveraging the `size="sm"` prop and icon support to maintain high information density.

### Requirement: Interaction Consistency Audit
Every button migration SHALL be verified to ensure it maintains the correct brand alignment (`consorci-darkBlue` for primary actions) and provides consistent visual feedback through standardized hover and active states.

#### Scenario: Hover feedback verification
- **WHEN** a user hovers over any migrated button in the application
- **THEN** the button SHALL transition to the `consorci-lightBlue` color over a 0.2s duration, ensuring a predictable and unified user experience across all modules.
