# Tasks: Refine Grid and Requests UI

## Component Refinement (DataTable)

- [x] Update `DataTable.tsx`:
    - [x] Remove `bg-background-subtle/5` from the index column (`showIndex`).
    - [x] Set default `align` to `center` in both headers and body for "centered everything" look.
    - [x] Update `TableSkeleton` to match the new neutral style.

## Feature Refinement (Admin Requests)

- [x] Update `AdminRequestsPage.tsx`:
    - [x] Status Column:
        - [x] Replace the colored dot/badge with SVG icons (CheckCircle, XCircle, Clock).
        - [x] Remove all `border` and `bg-*` classes from the status wrapper.
        - [x] Ensure text color matches the status (`text-green-600`, `text-red-600`, `text-orange-600`).
    - [x] Ensure all columns are centered by default (or explicitly where needed).
    - [x] Fine-tune the "Teachers" and "Center/Date" layout for better centering.

## Verification

- [ ] Visual inspection of the Requests table:
    - [ ] Centered headers.
    - [ ] Centered rows.
    - [ ] No background color in index column.
    - [ ] No background color or border in status column.
    - [ ] New icons for status indicators.
- [ ] Check other tables (e.g. Centers) to ensure global centering looks good.
