## ADDED Requirements

### Requirement: Full Internationalization Coverage
The web application MUST NOT contain any hardcoded user-facing strings in the UI components or pages. All strings MUST be managed through the `next-intl` infrastructure and stored in the respective locale JSON files.

#### Scenario: User switches language
- **WHEN** the user selects a different language from the `LanguageSelector`
- **THEN** all UI elements, including labels, placeholders, buttons, and system messages, MUST immediately update to the selected locale without requiring a full page reload (where possible by Next.js 15).

### Requirement: Localized System Notifications
All toast notifications (success, error, info) and API-related error messages displayed to the user MUST be internationalized.

#### Scenario: API error occurs
- **WHEN** an API call fails and an error message is displayed via `toast`
- **THEN** the message shown MUST be the translation corresponding to the current active locale, not a raw error string from the server (unless the server provides localized messages).

### Requirement: Missing Translation Fallback
The system MUST provide a consistent fallback mechanism for missing translation keys to avoid showing raw keys or empty spaces to the user.

#### Scenario: Key missing in secondary locale
- **WHEN** a translation key is present in the default locale ('es') but missing in the current locale ('en')
- **THEN** the system SHALL fallback to the default locale's message as defined in the `request.ts` configuration.

### Requirement: Language Selector Accessibility
The `LanguageSelector` component MUST be fully internationalized and accessible, allowing users to identify and select their preferred language clearly.

#### Scenario: Open language selector
- **WHEN** the user opens the language selector dropdown
- **THEN** the header and all utility options (e.g., "System Default") MUST be displayed in the current active language.
