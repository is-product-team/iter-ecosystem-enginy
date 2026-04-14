# Tasks: Test & Optimize Performance

Implementation breakdown for the optimization and testing architecture.

### Tests implementation
- [x] Set up minimal Vitest suite for the API controllers ensuring they can mount properly.
- [x] Write integration test targeting the Phase 3 functionality (Attendance Checkers).
- [x] Write integration test targeting the Phase 4 logic (`closeAssignment` constraints).

### Frontend Performance
- [x] Audit the Initial Application Load (`apps/web/app/[locale]/page.tsx` & `/login/page.tsx`).
- [x] Convert heavy secondary components inside the Dashboard into lazy-loaded `next/dynamic` instances.
- [x] Optimize global Font Loading and Image tags for quicker rendering.
