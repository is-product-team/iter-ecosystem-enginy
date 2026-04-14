## 1. Component Refactoring

- [x] 1.1 Refactor `apps/web/app/[locale]/center/page.tsx` icons to be neutral by default in dark mode.
- [x] 1.2 Refactor `apps/web/app/[locale]/admin/page.tsx` icons to be neutral by default in dark mode.
- [x] 1.3 Refactor `apps/web/components/WorkshopIcon.tsx` to ensure neutral icon rendering on dark backgrounds.
- [x] 1.4 Refactor `apps/web/app/[locale]/reports/page.tsx` icons to use the neutral-first pattern.

## 2. Verification

- [x] 2.1 Manually verify that icons are white/high-clarity gray on dark backgrounds at rest.
- [x] 2.2 Confirm that institutional blue is used as a background on hover/active states with white content.
- [x] 2.3 Verify that the light mode remains unchanged and institutional blue icons are correctly displayed there.
