## Why

The current web application has multiple hardcoded strings in English across key pages (Admin and Center dashboards), bypassing the established `next-intl` translation system. This results in an inconsistent user experience for Catalan and Spanish users, who see a mix of translated and untranslated content depending on the page they are visiting.

## What Changes

- Refactor `AdminDashboardPage` to use `useTranslations` and remove all hardcoded English strings.
- Refactor `CenterDashboard` to use `useTranslations` and remove all hardcoded English strings.
- Standardize the usage of `useTranslations` across all shared components (Navbar, Breadcrumbs, etc.).
- Ensure all error messages in `login/page.tsx` are properly localized.
- Audit and extract any remaining hardcoded strings in other views (Workshops, Centers, Requests, etc.).

## Capabilities

### New Capabilities
- `web-i18n`: Comprehensive internationalization support for the Next.js web application, ensuring all UI text is driven by the locale-specific JSON messages.

### Modified Capabilities
- `web`: Update the general web specification to include mandatory i18n patterns for all new pages and components.

## Impact

- **Affected Code**: `apps/web/app/`, `apps/web/components/`.
- **APIs**: No changes to backend APIs, but frontend will rely heavily on `next-intl` context.
- **Dependencies**: Continued use of `next-intl`.
- **User Experience**: Consistent localization for all roles (Admin, Coordinator, Teacher).
