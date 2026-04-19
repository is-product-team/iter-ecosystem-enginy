## 1. Global Theme & Navigation Foundations

- [ ] 1.1 Neutralize dark mode backgrounds in `apps/mobile/global.css` (Sync with web palette `#171717`).
- [ ] 1.2 Update `darkVars` in `apps/mobile/app/_layout.tsx` to ensure JS-level theme consistency.
- [ ] 1.3 Configure global `headerTintColor` and `headerStyle` in `apps/mobile/app/(professor)/_layout.tsx` to neutralize "System Blue" and dark blue headers.

## 2. Core UI Components

- [ ] 2.1 Create `apps/mobile/components/ui/PageHeader.tsx` implementing the unified Title/Subtitle pattern.
- [ ] 2.2 Ensure `PageHeader` correctly leverages `SafeAreaInsets` for top padding.

## 3. Dashboard (Inici) Refactoring

- [ ] 3.1 Replace local header logic in `apps/mobile/app/(professor)/(tabs)/index.tsx` with unified `PageHeader`.
- [ ] 3.2 Remove redundant avatar from the dashboard header (as agreed with user).

## 4. Calendar (Calendari) Refactoring

- [ ] 4.1 Replace local header in `apps/mobile/app/(professor)/(tabs)/calendar.tsx` with `PageHeader`.
- [ ] 4.2 Reorder layout to show Title ("Calendari") above the Subtitle ("Agenda acadèmica").
- [ ] 4.3 Standardize background to use semantic theme tokens instead of hardcoded hex colors.

## 5. Profile (Perfil) & Sub-pages Refactoring

- [ ] 5.1 Integrate `PageHeader` at the top of `apps/mobile/app/(professor)/(tabs)/profile.tsx`.
- [ ] 5.2 Reorganize identity card into an integrated, left-aligned list pattern.
- [ ] 5.3 Neutralize hardcoded colors in `apps/mobile/app/(professor)/session/[id].tsx` (specifically `headerTintColor: '#007AFF'`).
