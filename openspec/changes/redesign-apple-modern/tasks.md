## 1. Global & Shared Design System Update

- [x] 1.1 Update `shared/theme.ts` with ChatGPT-style neutral tones.
- [x] 1.2 Update `apps/web/app/globals.css` with 0px radius and Inter fonts.
- [x] 1.3 Enforce `border-radius: 0 !important` and `box-shadow: none !important` in the global CSS.

## 2. Component Auditing & Refactoring

- [x] 2.1 Audit `apps/web/components/` for bold, uppercase, and shadows.
    - [x] Refactored `Avatar.tsx`, `ConfirmDialog.tsx`, `Loading.tsx`, `Checklist.tsx`.
    - [x] Standardized `Pagination.tsx` and `ui/Calendar.tsx`.
    - [x] Updated `ChartComponents.tsx` (semantic colors) and `WorkshopIcon.tsx` (thin strokes).
- [x] 2.2 Refactor button patterns to use Sentence case and no bold (Standardized across all modals and pages).
- [x] 2.3 Refactor Card and container patterns to use sharp borders instead of shadows.

## 3. Layout & Navigation Polishing

- [x] 3.1 Update `Navbar.tsx` and `DashboardLayout.tsx` with glassmorphism and modern typography.
- [x] 3.2 Adjust `Toaster` configuration in `layout.tsx` for minimalist aesthetics.
- [x] 3.3 Redesign `LoginPage` as the flagship for the new modern-minimalist design.

## 4. Final Polish & Validation

- [x] 4.1 Refine specialized widgets (`NextEventsWidget`, `ResourcesWidget`).
- [x] 4.2 Verify Dark Mode consistency across all surfaces.
