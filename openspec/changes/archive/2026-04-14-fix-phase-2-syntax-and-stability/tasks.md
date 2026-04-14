# Tasks: Fix Phase 2 Syntax and Stability

## Frontend: Assignment Details Page
- [x] Fix syntax in `apps/web/app/[locale]/center/assignments/[id]/page.tsx`
  - [x] Simplify `subtitle` prop value.
  - [x] Ensure correct tag formatting for `DashboardLayout`.
  - [x] Verify `useParams` and `useTranslations` usage.
- [x] Ensure `locale` prefixing in all `router.push` calls.

## Frontend: Center Dashboard Page
- [x] Fix layout hierarchy in `apps/web/app/[locale]/center/page.tsx`
  - [x] Repair the "Direct Access" grid `div` nesting.
  - [x] Restore missing `Monitoring` card.

## Stability & Verification
- [x] Verify web application build/start sequence.
- [x] Test navigation between `/center` and `/assignments/[id]`.
- [x] Confirm Phase 2 Table and AI Matcher correctly render without 500 errors.
