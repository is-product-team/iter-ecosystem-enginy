# Specification: Frontend Internationalization

The frontend internationalization (i18n) system ensures that the application provides a localized experience for all users, supporting multiple languages and locales through a robust infrastructure.

## Requirements

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

### Requirement: Shared Component Internationalization
All shared UI components used across different role-based views (Admin, Coordinator, Teacher) MUST be fully internationalized and MUST NOT contain any role-specific or language-specific hardcoded strings.

#### Scenario: Pagination component usage
- **WHEN** the `Pagination` component is rendered in any view (e.g., Coordinator Assignments)
- **THEN** all navigational labels ("Previous", "Next", "Page", "of", "Showing") MUST be translated using the current locale's `Common` namespace.

### Requirement: Resource Attribute Translation
Resource-specific attributes such as durations, capacities, and counts MUST be formatted using localized labels defined in the `Common` namespace.

#### Scenario: Displaying workshop duration
- **WHEN** a workshop duration is displayed in the UI (e.g., "12h")
- **THEN** the value MUST be formatted using the `duration_label` key from the `Common` namespace (e.g., `{hours}h`).

#### Scenario: Displaying workshop capacity
- **WHEN** a workshop capacity is displayed in the UI (e.g., "25 Places")
- **THEN** the value MUST be formatted using the `places_label` key from the `Common` namespace (e.g., `{count} Places`).
