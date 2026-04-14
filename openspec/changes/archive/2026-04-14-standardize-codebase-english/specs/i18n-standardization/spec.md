## ADDED Requirements

### Requirement: Internal Language Standardization
The system codebase (variable names, functions, internal models, and file names) SHALL be standardized to English to ensure maintainability and professional standards.

#### Scenario: Code Refactoring
- **WHEN** a developer reads any part of the codebase (backend, frontend, or shared)
- **THEN** they MUST see English naming conventions for all internal symbols.

### Requirement: User Interface Localization
The system SHALL maintain full support for Catalan and Spanish in the user interface, independent of the internal code language.

#### Scenario: Switching UI Language
- **WHEN** a user selects "Català" in the application settings
- **THEN** all user-facing text MUST be displayed in Catalan, even if internal data structures use English.

### Requirement: External Data Mapping
The system SHALL map external data sources (like Excel imports with Catalan/Spanish headers) to internal English models to ensure data integrity.

#### Scenario: Importing Students via Excel
- **WHEN** an admin uploads an Excel file with a column named "nom"
- **THEN** the system MUST correctly map it to the `fullName` field in the internal English model.
