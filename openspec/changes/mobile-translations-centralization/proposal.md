# Mobile Translations Centralization

Externalize all hardcoded strings in the mobile application to localization files (`ca.json` and `es.json`) to ensure full multi-language support and maintainable code.

## Goal

The primarily objective is to eliminate all remaining hardcoded strings in the mobile app. This will allow the application to be fully translated into other languages without touching the source code and will improve the overall code quality by centralizing all user-facing text.

## User Stories

- As a developer, I want all user-facing strings to be in JSON files so I can easily manage translations.
- As a user, I want the application to be consistently translated into my preferred language across all screens.

## Technical Details

- **i18n Framework**: `react-i18next` already configured in `apps/mobile/i18n.ts`.
- **Translation Files**: `apps/mobile/locales/ca.json` and `apps/mobile/locales/es.json`.
- **Pattern**: Use the `useTranslation` hook from `react-i18next` and the `t()` function to retrieve strings.
- **Scope**: Scan all components in `apps/mobile/components` and pages in `apps/mobile/app`.

## Related Specifications

- [Mobile Core Architecture](file:///Users/kore/Documents/Code/Projects/iter-ecosystem-enginy/openspec/specs/mobile-dashboard/spec.md) (Implicitly relates to overall mobile quality)
