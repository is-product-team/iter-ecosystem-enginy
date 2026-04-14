## ADDED Requirements

### Requirement: Coordinator View Internationalization Compliance
All pages and sub-pages under the Coordinator role view (`/center/**`) MUST be fully internationalized, following the `web-i18n` specification. Hardcoded English text is strictly forbidden.

#### Scenario: Coordinator views assignments
- **WHEN** a coordinator navigates to the `/center/assignments` page
- **THEN** all UI text, including table headers, search placeholders, and empty state messages, MUST be translated.

#### Scenario: Coordinator requests a workshop
- **WHEN** a coordinator interacts with the workshop request form (`/center/requests`)
- **THEN** all informational text, labels, and feedback messages MUST be fully internationalized.
