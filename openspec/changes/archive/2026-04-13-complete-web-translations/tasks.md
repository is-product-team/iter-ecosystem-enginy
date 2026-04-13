## 1. i18n Dictionary Synchronization

- [x] 1.1 Audit all locale files (`ca.json`, `es.json`, `en.json`, `ar.json`) and identify missing keys.
- [x] 1.2 Add missing keys for `LanguageSelector` (header and "System Default").
- [x] 1.3 Add missing keys for common UI badges (e.g., "WORKSHOP", "PENDING", "COMPLETED").
- [x] 1.4 Standardize `Common` namespace keys across all languages.

## 2. Component Refactoring

- [x] 2.1 Refactor `LanguageSelector.tsx` to use `useTranslations` for all labels.
- [x] 2.2 Refactor `Navbar.tsx` to ensure all user roles and center labels are correctly localized.
- [x] 2.3 Refactor `DashboardLayout.tsx` to remove any potential hardcoded breadcrumb or title text.

## 3. Page Localization

- [x] 3.1 Internationalize `apps/web/app/[locale]/centers/page.tsx` (table headers, search labels, placeholders, empty states).
- [x] 3.2 Internationalize `apps/web/app/[locale]/workshops/page.tsx` (table headers, filters, modal labels).
- [x] 3.3 Internationalize `apps/web/app/[locale]/login/page.tsx` (all sections including "Access via Mobile App").
- [x] 3.4 Internationalize `apps/web/app/[locale]/student/dashboard/page.tsx` (workshop badges, toast messages).
- [x] 3.5 Systematic audit and fix of all other pages in `apps/web/app/[locale]` (Calendar, Requests, Phases, etc.).

## 4. Notifications and Errors

- [x] 4.1 Update all `toast` calls in the web app to use translated strings.
- [x] 4.2 Localize API error handling in `catch` blocks across all services and components.

## 5. Final Validation

- [x] 5.1 Perform a full sweep of the web application in all 4 languages to verify 100% coverage.
- [x] 5.2 Run a script or grep to ensure no user-facing hardcoded strings remain in `apps/web/app/[locale]`.
