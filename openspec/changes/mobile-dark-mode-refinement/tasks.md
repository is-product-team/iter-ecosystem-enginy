# Tasks: Mobile Dark Mode Refinement

## Phase 1: Foundation
- [x] Update `apps/mobile/global.css` with full set of theme variables from `shared/theme.ts` (light and dark).
- [x] Update `apps/mobile/tailwind.config.js` to use CSS variables for semantic tokens (`background`, `text`, `border`).
- [x] Verify `apps/mobile/app/_layout.tsx` correctly applies the `StatusBar` style based on `colorScheme`.

## Phase 2: Core Screens Refactoring
- [x] Refactor `apps/mobile/app/(professor)/(tabs)/index.tsx` (Dashboard):
    - Replace `bg-background-subtle` with `bg-background-page`.
    - Replace hardcoded text colors with semantic classes.
- [x] Refactor `apps/mobile/components/dashboard/SessionCarousel.tsx`:
    - Convert `style` objects to Tailwind classes where possible.
    - Use `useColorScheme` for dynamic colors in non-Tailwind components.
- [x] Refactor `apps/mobile/components/dashboard/QuickAccessGrid.tsx` to ensure icon backgrounds work in dark mode.

## Phase 3: Secondary Components Refactoring
- [x] Refactor `apps/mobile/components/WorkshopDetailModal.tsx`:
    - Remove inline background colors.
    - Update text and border tokens.
- [x] Refactor `apps/mobile/components/CalendarView.tsx`:
    - Update calendar grid and agenda list to use semantic tokens.
- [x] Refactor `apps/mobile/components/MobileNavbar.tsx`:
    - Ensure it adapts or remains consistent with the brand colors in both modes.

## Phase 4: Validation
- [x] Verify color contrast in the most critical screens in Dark Mode.
- [x] Ensure no regressions in Light Mode.
- [x] Check `ActivityIndicator` colors across all loading states.
