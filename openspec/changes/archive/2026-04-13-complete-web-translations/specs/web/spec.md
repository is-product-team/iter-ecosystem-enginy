## ADDED Requirements

### Requirement: i18n-First UI Development
The web application SHALL enforce an i18n-first approach for all UI components, requiring all user-facing text to be localizable from the point of creation.

#### Scenario: Developer adds a new UI component
- **WHEN** a new component is added to the `apps/web/components` directory
- **THEN** it MUST use the `useTranslations` hook for all its text elements and reference keys in the central locale JSON files.
