# Tasks: Mobile Translations Centralization

- [ ] **Phase 1: Preparation**
    - [ ] Update `locales/ca.json` with new keys
    - [ ] Update `locales/es.json` with new keys

- [ ] **Phase 2: Core Components**
    - [ ] Refactor `apps/mobile/app/(professor)/(tabs)/index.tsx` (Dashboard)
    - [ ] Refactor `apps/mobile/components/dashboard/HeroCard.tsx`
    - [ ] Refactor `apps/mobile/components/CalendarView.tsx`

- [ ] **Phase 3: Support Screens**
    - [ ] Refactor `apps/mobile/app/login.tsx`
    - [ ] Refactor `apps/mobile/app/(professor)/coordination.tsx`
    - [ ] Refactor `apps/mobile/components/WorkshopDetailModal.tsx`

- [ ] **Phase 4: Audit & Cleanup**
    - [ ] Global search for strings in `apps/mobile` (Grepping for quotes in JSX)
    - [ ] Verify that Catalan/Spanish toggle works correctly in all screens
    - [ ] Remove any unused keys from localization files
