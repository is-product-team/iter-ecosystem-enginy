## 1. Foundation

- [x] 1.1 Create `DataTableToolbar` component in `apps/web/components/ui/DataTableToolbar.tsx`
- [x] 1.2 Implement the Header Bar layout (Title, Icon, Results Count, Actions)
- [x] 1.3 Implement the Integrated Filter Grid with CSS Grid and sharp styling
- [x] 1.4 Add `FilterSelect` and `SearchInput` sub-components for the toolbar grid cells

## 2. DataTable Integration

- [x] 2.1 Add `hideTopBorder` prop to `DataTable.tsx` to prevent border doubling when used with toolbar
- [x] 2.2 Ensure the `table-database` CSS classes in `globals.css` (or equivalent) support the sharp grid look
- [x] 2.3 Verify pixel-perfect alignment between toolbar grid cells and table headers/borders

## 3. Page Migration

- [x] 3.1 Replace manual filters in Admin Requests page (`app/[locale]/requests/page.tsx`) with `DataTableToolbar`
- [x] 3.2 Replace manual filters in Center Students page (`app/[locale]/center/students/page.tsx`) with `DataTableToolbar`
- [x] 3.3 Replace manual filters in Center Requests page (`app/[locale]/center/requests/page.tsx`) with `DataTableToolbar`
- [x] 3.4 Replace manual filters in Workshops page (`app/[locale]/workshops/page.tsx`) with `DataTableToolbar`

## 4. Verification and Cleanup

- [x] 4.1 Conduct a visual audit to ensure 100% "Sharp" design compliance (no rounded corners, no shadows)
- [x] 4.2 Verify responsive behavior (stacking grid) on mobile and tablet viewports
- [x] 4.3 Update `FilterPanel.tsx` or mark it as legacy if it's completely superseded by the new toolbar
