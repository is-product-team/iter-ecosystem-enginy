## Why

The coordinator dashboard and its related management pages (Assignments, Requests, etc.) currently have significant hardcoded English text and missing translation keys in Spanish and Catalan. This results in a broken, inconsistent, and unprofessional user experience for non-English speaking coordinators, which is the primary user base for the platform.

## What Changes

- **Internationalize hardcoded strings**: Remove all static English text from `AssignmentsPage`, `RequestsPage`, and the `Pagination` component, replacing them with proper translation keys.
- **Synchronize message files**: Ensure all keys used in the coordinator view are present and translated in `en.json`, `es.json`, `ca.json`, and `ar.json`.
- **Add missing Common keys**: Specifically add `duration_label`, `places_label`, and pagination navigation keys (`previous`, `next`, `page`, `of`, `showing`) to the `Common` namespace in all languages.
- **Fix broken dynamic translations**: Ensure that components using parameterized translations (like `t('dashboard.title', { name: ... })`) are working correctly across all views.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `web-i18n`: Expanding the required translation coverage to include all coordinator-specific management workflows.
- `web`: Updating the coordinator dashboard and sub-pages to strictly adhere to the internationalization standards.

## Impact

- **Frontend**: All pages under `apps/web/app/[locale]/center/` and shared UI components like `Pagination.tsx`.
- **Localization**: All JSON files in `apps/web/messages/`.
- **User Experience**: Consistent language support across the entire coordinator management lifecycle.
