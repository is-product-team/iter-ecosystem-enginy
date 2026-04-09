## MODIFIED Requirements

### Requirement: Web Application (Next-intl)
- New file: `messages/en.json` containing complete English translations for all keys.
- Update `middleware.ts` to include `en` as an accepted locale and potentially set it as default.
- All client-side components must use the `useTranslations` hook with English keys.
- **ADDED**: The application MUST support a "System Default" locale option that reverts to browser-detected settings.
- **ADDED**: Supported locales MUST be defined in a centralized configuration file used by both middleware and layouts.

#### Scenario: User selects English
- **WHEN** user selects "English" from the profile language picker
- **THEN** the application redirects to the `/en/` prefixed path
- **AND** the content displays in English

#### Scenario: User selects System Default
- **WHEN** user selects "System Default" from the profile language picker
- **THEN** the application clears the `NEXT_LOCALE` cookie
- **AND** redirects to the root path to trigger re-detection
- **AND** the application displays in the browser's preferred language
