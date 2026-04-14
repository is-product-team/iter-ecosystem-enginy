## 1. Audit and Preparation

- [x] 1.1 Run a final audit to identify all hardcoded strings in the `apps/web/` directory.
- [x] 1.2 Ensure all required keys for Admin and Center dashboards are present in `ca.json` and `es.json`.

## 2. Admin Dashboard Refactor

- [x] 2.1 Refactor `apps/web/app/[locale]/admin/page.tsx` to use `useTranslations('Admin')`.
- [x] 2.2 Replace hardcoded dashboard titles and descriptions with localized strings.
- [x] 2.3 Localize the navigation section labels (e.g., "General", "Configuration") in the Admin dashboard.

## 3. Center Dashboard Refactor

- [x] 3.1 Refactor `apps/web/app/[locale]/center/page.tsx` to use `useTranslations('Center')`.
- [x] 3.2 Localize the "Iter 25-26 Program Status" section and its phase descriptions.
- [x] 3.3 Update the center management cards to use localized titles and descriptions.

## 4. Common Components and Login

- [x] 4.1 Update `Navbar` and `Breadcrumbs` to ensure consistent localization of all links and text.
- [x] 4.2 Localize all error and success messages in `apps/web/app/[locale]/login/page.tsx`.
- [x] 4.3 Ensure the "Loading..." messages across all pages are correctly localized using the `Common` namespace.

## 5. Other Web Views Refactor

- [x] 5.1 Refactor `apps/web/app/[locale]/workshops/page.tsx` to use translations.
- [x] 5.2 Refactor `apps/web/app/[locale]/calendar/page.tsx` to use translations.
- [x] 5.3 Refactor `apps/web/app/[locale]/questionnaires/page.tsx` and builder to use translations.
- [x] 5.4 Refactor `apps/web/app/[locale]/verifications/page.tsx` to use translations.
- [x] 5.5 Refactor `apps/web/app/[locale]/requests/page.tsx` to use translations.
- [x] 5.6 Refactor `apps/web/app/[locale]/stats/page.tsx` and `reports/page.tsx` to use translations.
- [x] 5.7 Refactor center sub-pages (students, teachers, sessions) to use translations.

## 6. Verification and Cleanup

- [x] 6.1 Run the translation audit script to confirm 100% coverage and no missing keys.
- [ ] 6.2 Manually verify the UI in both Catalan and Spanish to ensure layouts don't break with different text lengths.
