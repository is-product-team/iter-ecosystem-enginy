## ADDED Requirements

### Requirement: I18n Patterns for New Development
All future web pages and components MUST use `next-intl` for all UI text, ensuring that no hardcoded strings are introduced during new development.

#### Scenario: New Component Development
- **WHEN** a new component is created
- **THEN** it uses `useTranslations` for all labels and text, and keys are added to the corresponding JSON files in `apps/web/messages/`.
