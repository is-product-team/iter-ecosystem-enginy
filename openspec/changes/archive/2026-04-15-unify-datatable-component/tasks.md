## 1. Core Component Implementation

- [x] 1.1 Create `DataTable.tsx` in `apps/web/components/ui/` with the defined generic API.
- [x] 1.2 Implement the "Premium" visual structure (wrappers, gradients, scrollbars).
- [x] 1.3 Integrate the project's standard `Loading` and `Pagination` components.
- [x] 1.4 Add support for empty states and internationalized messages.

## 2. Refactor Workshop Requests (Admin)

- [x] 2.1 Define the column configuration for the Admin Workshop Requests view.
- [x] 2.2 Replace the legacy table implementation in `apps/web/app/[locale]/requests/page.tsx` with the `DataTable`.
- [x] 2.3 Verify that approve/reject actions and pagination still work as expected.

## 3. Refactor Workshop Requests (Center)

- [x] 3.1 Define the column configuration for the Center Workshop Requests view.
- [x] 3.2 Replace the legacy table implementation in `apps/web/app/[locale]/center/requests/page.tsx` with the `DataTable`.
- [x] 3.3 Verify that the "Selected" state and editing modals work correctly with the new component.

## 4. Gradual Migration & Cleanup

- [x] 4.1 Migrate the Workshop Management table in `apps/web/app/[locale]/workshops/page.tsx`.
- [x] 4.2 Perform a project-wide type-check and linting to ensure no regressions.

