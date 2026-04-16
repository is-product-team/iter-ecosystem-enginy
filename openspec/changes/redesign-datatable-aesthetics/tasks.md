# Tasks: Redesign DataTable Aesthetics

## Frontend

- [x] Update `Column` interface in `DataTable.tsx` to include an optional `icon` property.
- [x] Refactor `thead` in `DataTable.tsx`:
    - [x] Change background to `bg-background-subtle`.
    - [x] Add vertical borders between headers.
    - [x] Implement icon rendering next to header labels.
    - [x] Add a default `#` index column logic or component.
- [x] Refactor `tbody` in `DataTable.tsx`:
    - [x] Add vertical borders (`border-r`) to all cells.
    - [x] Adjust padding for compact layout (`px-4 py-3`).
    - [x] Implement consistent hover logic.
- [x] Modify `FilterPanel.tsx` for integration:
    - [x] Add a `variant` prop to handle "flush" or "inline" styling.
    - [x] Match borders and background with the new table standard.
    - [x] Add Lucide icons to clear buttons and labels.
- [x] Update global styles in `globals.css` if necessary for the "grid" borders (e.g., `border-collapse` adjustments).

## Verification

- [ ] Verify Light Mode aesthetics against the provided mockup.
- [ ] Verify Dark Mode aesthetics against the provided mockup.
- [ ] Test table responsiveness with multiple columns.
- [ ] Ensure `FilterPanel` looks cohesive when placed alongside/above the table.
