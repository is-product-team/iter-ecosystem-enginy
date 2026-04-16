## 1. Style System Refactor (Web)

- [ ] 1.1 Support `text color` hover transitions without background changes in the global button and row styles.
- [ ] 1.2 Update `globals.css` with a `.table-grid-full` utility to enforce `border-r border-b` on all cells.
- [ ] 1.3 Audit all `DataTable` instances and ensure `bg-background-subtle` is replaced with `bg-transparent` or white.

## 2. Core DataTable Enhancements

- [ ] 2.1 **Density Update**: Set default font-size to `text-[12px]` and paddings to `p-1.5`.
- [ ] 2.2 **Full Grid Implementation**: Update the `table`, `thead`, and `tbody` structure to use the new grid borders.
- [ ] 2.3 **Hover Logic**: Modify the `tr` hover classes to change text color (e.g., `group-hover:text-consorci-darkBlue`) instead of background.
- [ ] 2.4 **Column Resizing Logic**:
    - [ ] Create `useColumnResizer` hook or internal state for widths.
    - [ ] Add the resize handle `div` in the `th` component.
    - [ ] Implement storage logic (`localStorage.setItem('table_widths_' + tableId, ...)`).
- [ ] 2.5 **Sticky Index**: Ensure `#` column is pinned to the left with `z-index`.

## 3. FilterPanel & Footer Redesign

- [ ] 3.1 **FilterPanel Cleanup**: Remove surface background and simplify borders to match the grid.
- [ ] 3.2 **Footer Sync**: Refactor the bottom toolbar to include the "X-Y of Z Records" counter on the right side.

## 4. Maintenance & Cleanup

- [ ] 4.1 Remove old `premium-table-container` shadow gradients if they conflict with the "Raw" aesthetic.
- [ ] 4.2 Verify that all specialized tables (like `Phase2Table`) inherit these global changes correctly.

## 5. Verification

- [ ] 5.1 Verify column resizing persists after page reload.
- [ ] 5.2 Verify high-density layout works on laptop screens (13-14").
- [ ] 5.3 Verify "No Background" rule is consistent across all web admin pages.
