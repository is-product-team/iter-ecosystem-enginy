## Why

The Iter web application currently has incomplete internationalization, with numerous hardcoded strings across multiple pages (Centers, Workshops, Login, Dashboard, etc.). This leads to a fragmented user experience where English, Spanish, and Catalan are mixed inconsistently. Completing the translation ensures a professional, accessible, and high-quality experience for all users regardless of their preferred language.

## What Changes

- **Incomplete Internationalization Fix**: Systematic replacement of hardcoded strings in `.tsx` files with `next-intl` translation keys (`t()` and `tCommon()`).
- **Missing Keys Synchronization**: Identification and addition of missing translation keys in `en.json`, `es.json`, `ca.json`, and `ar.json` to ensure consistency.
- **Enhanced Toast & Error Messaging**: Updating all `toast` notifications and API error messages to support localization.
- **Component Refactoring**: Modernizing key components like `LanguageSelector`, `DashboardLayout`, and common UI badges to fully support the i18n infrastructure.
- **Verification & Cleanup**: Final audit of the web application to ensure no "language leaks" remain and all translations are accurate across supported locales.

## Capabilities

### New Capabilities
- `web-i18n`: Comprehensive internationalization requirements for the web frontend, ensuring all user-facing strings are localizable.

### Modified Capabilities
- `web`: Updating the general web specification to include full i18n support as a core requirement for all future UI development.

## Impact

The changes affect the entire `apps/web` codebase, primarily focusing on `app/[locale]` pages and shared `components`. No backend API changes are required, but frontend services (`services/`) will be updated to handle localized error responses correctly. No breaking changes are expected in functionality, only in the internal string management and component signatures (where `useTranslations` is added).
