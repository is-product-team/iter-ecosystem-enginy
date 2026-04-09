## 1. Research and Identification

- [x] 1.1 List all `page.tsx` in `apps/web/app/[locale]` that use `max-w-*` or `mx-auto` in their top-level container.

## 2. Global Standardization

- [x] 2.1 Refactor `apps/web/app/[locale]/profile/page.tsx` to remove `max-w-4xl mx-auto`.
- [x] 2.2 Scan and refactor other pages (e.g., `requests/page.tsx`, `reports/page.tsx`, `stats/page.tsx`) to ensure a consistent `w-full pb-20` wrapper pattern.
- [x] 2.3 Ensure vertical and horizontal consistency across all top-level page components.

## 3. Verification

- [x] 3.1 Manually verify that all pages maintain correct layout when navigating between sections.
- [x] 3.2 Confirm that no `max-w-* mx-auto` top-level wrappers remain in the internal pages.
