# Tasks: Complete Admin Localization

## Dictionary Updates
- [ ] Add explicit text variables for `CreateWorkshopModal` in `ca.json` and `en.json` (inside the `Forms` namespace).
  - e.g.: "General Information", "Technical Details", "Add Time Slot", etc.
- [x] Add generic keys for `Pagination` and widgets in the `Common` dictionary space.
- [ ] Add Center Assignments, Sessions, and Teachers hardcoded texts into target language dictionaries.

## Component Refactoring
- [x] Refactor `apps/web/components/CreateWorkshopModal.tsx` to use `tForm(...)`.
- [x] Refactor `apps/web/components/Pagination.tsx` and `NextEventsWidget.tsx` to use `tc(...)`.
- [x] Refactor `apps/web/components/ui/Calendar.tsx` to dynamically translate "No hi ha activitat planificada".
- [ ] Refactor Center Assignments page views (`apps/web/app/[locale]/center/assignments/page.tsx` and its children like `/teachers`, `/evaluations`).
- [ ] Refactor Center Sessions page views (`apps/web/app/[locale]/center/sessions/[id]/page.tsx` and `/attendance/[num]/page.tsx`).
- [ ] Refactor notifications and requests empty states (`No pending alerts`, `No workshops found`).

## Validation
- [ ] Render the Admin app locally and browse to the Workshops, Centers, and Notifications tabs in Catalan state to guarantee zero visible English keys.
- [ ] Double-check fallback safety in dictionaries.
