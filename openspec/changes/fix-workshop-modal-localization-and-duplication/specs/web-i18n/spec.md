## ADDED Requirements

### Requirement: Consistent Form Titles
The system SHALL provide consistent `edit_title` and `create_title` keys within the `Forms` namespace (and its sub-namespaces) to allow generic and specific form titles across the application.

#### Scenario: Opening a form for creation
- **WHEN** a user opens a modal or page for creating a new resource (e.g., Workshop)
- **THEN** the title SHALL resolve correctly without throwing `MISSING_MESSAGE` errors.

### Requirement: CreateWorkshopModal Localization
The `CreateWorkshopModal` component MUST use the `Forms` namespace and resolve both `edit_title` and `create_title` correctly based on the `initialData` state.

#### Scenario: Opening CreateWorkshopModal in Spanish
- **WHEN** the active locale is `es` and `initialData` is null
- **THEN** the modal title SHALL display "Crear" (or the localized equivalent from `Forms.create_title`).
