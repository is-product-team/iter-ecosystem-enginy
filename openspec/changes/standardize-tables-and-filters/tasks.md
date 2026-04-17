## 1. Core Component Updates

- [x] 1.1 Update `DataTable.tsx` to support `variant` prop (`default` | `simple`).
- [x] 1.2 Create `FilterPanel.tsx` in `apps/web/components/ui` with standardized padding and layout.

## 2. Page Refactors (Filters)

- [x] 2.1 Refactor `apps/web/app/[locale]/workshops/page.tsx` to use the new `FilterPanel` component.
- [x] 2.2 Refactor `apps/web/app/[locale]/verifications/page.tsx` to use the new `FilterPanel` component.
- [x] 2.3 Refactor `apps/web/app/[locale]/requests/page.tsx` to use the new `FilterPanel` component.
- [x] 2.4 Refactor `apps/web/app/[locale]/center/assignments/page.tsx` to use the new `FilterPanel` component.

## 3. Table Refactors (DataTable)

- [x] 3.1 Replace manual `<table>` implementation in `apps/web/app/[locale]/requests/page.tsx` with `DataTable` (using `variant="simple"`).
- [x] 3.2 Replace manual `<table>` implementation in `apps/web/app/[locale]/center/assignments/page.tsx` with the existing `DataTable` component.
- [x] 3.3 Refactor `apps/web/components/Phase2Table.tsx` to use `DataTable` as its core rendering engine.

## 4. Verification

- [x] 4.1 Audit all refactored pages to ensure consistent "Premium" styling.
- [x] 4.2 Verify that pagination and filtering still work correctly after the component migration.
