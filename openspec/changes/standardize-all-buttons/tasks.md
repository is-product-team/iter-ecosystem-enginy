## 1. Global Navigation & Layout Refactor

- [ ] 1.1 Migrate manual buttons in `apps/web/components/Navbar.tsx` (Logo triggers, mobile menu).
- [ ] 1.2 Refactor `apps/web/components/LanguageSelector.tsx` to use `Button`.
- [ ] 1.3 Update `apps/web/components/Pagination.tsx` for consistent scaling and states.

## 2. Shared Modals & Components

- [ ] 2.1 Refactor `apps/web/components/ClosureModal.tsx`.
- [ ] 2.2 Refactor `apps/web/components/ConflictDialog.tsx`.
- [ ] 2.3 Refactor `apps/web/components/CreateCenterModal.tsx`.
- [ ] 2.4 Refactor `apps/web/components/SyncCalendarModal.tsx`.
- [ ] 2.5 Refactor `apps/web/components/StudentSelectionDrawer.tsx`.
- [ ] 2.6 Refactor `apps/web/components/DocumentUpload.tsx`.

## 3. Administrative Monitoring & Feed Components

- [ ] 3.1 Refactor `apps/web/components/monitoring/IncidentFeed.tsx`.
- [ ] 3.2 Refactor `apps/web/components/monitoring/AssignmentMonitorCard.tsx`.
- [ ] 3.3 Refactor `apps/web/components/monitoring/CloseWorkshopSection.tsx`.

## 4. Dashboard Page Migrations

- [ ] 4.1 Refactor buttons in `apps/web/app/[locale]/profile/page.tsx`.
- [ ] 4.2 Refactor buttons in `apps/web/app/[locale]/reports/page.tsx`.
- [ ] 4.3 Refactor buttons in `apps/web/app/[locale]/verifications/page.tsx`.
- [ ] 4.4 Final audit of all remaining `app/[locale]/center/*` subpages.

## 5. Quality Assurance

- [ ] 5.1 Run `turbo run lint --filter=@iter/web`.
- [ ] 5.2 Run `turbo run type-check --filter=@iter/web`.
- [ ] 5.3 Manual verification of hover/active states in the browser.
