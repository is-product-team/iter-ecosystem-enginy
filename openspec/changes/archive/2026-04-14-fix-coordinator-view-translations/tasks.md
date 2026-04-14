## 1. Localization Synchronization

- [x] 1.1 Add missing utility keys (`duration_label`, `places_label`, `previous`, `next`, `page`, `of`, `showing`) to `apps/web/messages/en.json` under the `Common` namespace.
- [x] 1.2 Translate and synchronize the new `Common` keys to `apps/web/messages/es.json`.
- [x] 1.3 Translate and synchronize the new `Common` keys to `apps/web/messages/ca.json`.
- [x] 1.4 Translate and synchronize the new `Common` keys to `apps/web/messages/ar.json`.

## 2. Shared Component Refactoring

- [x] 2.1 Refactor `apps/web/components/Pagination.tsx` to use the `useTranslations('Common')` hook for all navigational labels.
- [x] 2.2 Update the `itemName` default value or usage in `Pagination.tsx` to ensure it is also localized.

## 3. Coordinator View Refactoring

- [x] 3.1 Refactor `apps/web/app/[locale]/center/assignments/page.tsx` to replace all hardcoded English headers, placeholders, and labels with translation keys.
- [x] 3.2 Refactor `apps/web/app/[locale]/center/requests/page.tsx` to remove hardcoded strings like "Workshops available" and use localized formatting for duration and capacity.
- [x] 3.3 Audit `apps/web/app/[locale]/center/page.tsx` (Dashboard) for any residual hardcoded English strings.
- [ ] 3.4 Refactor `apps/web/app/[locale]/center/monitoring/page.tsx` (tabs, empty states, toasts).
- [ ] 3.5 Refactor monitoring sub-components (`KPIOverview`, `AssignmentMonitorCard`, `IncidentFeed`).
- [x] 3.6 Refactor `apps/web/app/[locale]/center/sessions/page.tsx` (date localization).

## 4. Verification and Quality Assurance

- [ ] 4.1 Verify that the Assignments view correctly reflects language changes across all supported locales (ES, CA, EN, AR).
- [ ] 4.2 Verify that the Requests view and its modals correctly display localized labels and formatted values.
- [ ] 4.3 Perform a regression check on the Admin dashboard to ensure shared components (like Pagination) still work as expected.
