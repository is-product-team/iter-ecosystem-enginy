# Tasks: Advanced Grid Features Implementation

## Phase 1: Core Components
- [ ] **DataTable.tsx Refactor**
    - [ ] Add `sortConfig`, `groupBy`, and `collapsedGroups` state.
    - [ ] Implement `handleSort` function.
    - [ ] Implement `sortedData` useMemo with multi-type support.
    - [ ] Implement `groupedData` useMemo.
    - [ ] Update Header rendering with sort triggers and icons.
    - [ ] Update Body rendering with group headers and collapsible logic.
- [ ] **DataTableToolbar.tsx Refactor**
    - [ ] Add `groupByOptions` prop.
    - [ ] Render Group By selector in the grid.

## Phase 2: Administrative Pages (Enabled Features)
- [ ] **Students Page**
    - [ ] Define group options (Curs, Gènere).
- [ ] **Workshops Page**
    - [ ] Define group options (Sector, Modalidat).
- [ ] **Requests Page**
    - [ ] Define group options (Centre, Estat).
- [ ] **Teachers Page**
    - [ ] Define group options (Centre).

## Phase 3: Verification & Polish
- [ ] Test sorting on all data types.
- [ ] Verify group sticky headers behavior.
- [ ] Ensure 1px border consistency is maintained with new elements.
