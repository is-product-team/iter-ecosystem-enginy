## ADDED Requirements

### Requirement: Localization Integrity
The mobile application SHALL ensure that all user-facing strings are correctly localized in both Catalan and Spanish, with no raw translation keys (variables) visible to the user.

#### Scenario: Verify translation keys are absent in Dashboard
- **WHEN** a teacher accesses the Dashboard screen
- **THEN** all labels, greetings, and status messages MUST display the translated text, not keys like `Dashboard.greeting_morning`.

### Requirement: Structural Validity of Locale Files
Locale JSON files MUST NOT contain duplicate top-level keys.

#### Scenario: No duplicated Session block
- **WHEN** the `es.json` or `ca.json` files are parsed by the build system or i18next
- **THEN** only one `Session` object SHALL be present, containing the union of all required session-related keys.
