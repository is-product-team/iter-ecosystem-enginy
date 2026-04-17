## Why

The `CreateWorkshopModal` component in the web application is currently experiencing runtime errors because it attempts to resolve the translation key `Forms.create_title` which is missing from the `es.json` locale file (and others). Additionally, the component's JSX contains significant code duplication for several UI elements (technical details header, duration labels, etc.), which makes maintenance difficult and prone to errors.

## What Changes

- **Add missing translation keys**: Add `create_title` to the `Forms` namespace in `es.json`, `en.json`, `ca.json`, and `ar.json`.
- **Refactor `CreateWorkshopModal.tsx`**: Remove duplicate JSX elements and ensure clean, idiomatic React code.
- **Generic Title support**: Ensure the `Forms` namespace has consistent `edit_title` and `create_title` keys for general use.

## Capabilities

### Modified Capabilities
- `web-i18n`: Fulfilling the requirement for "Full Internationalization Coverage" by ensuring all user-facing strings in `CreateWorkshopModal` are properly localized and available in all supported locales.

## Impact

- **Affected files**: 
  - `apps/web/messages/*.json` (all locale files)
  - `apps/web/components/CreateWorkshopModal.tsx`
- **User Experience**: Fixes a crash/error when opening the Create Workshop modal in Spanish and potentially other languages. Improves code quality and maintainability.
