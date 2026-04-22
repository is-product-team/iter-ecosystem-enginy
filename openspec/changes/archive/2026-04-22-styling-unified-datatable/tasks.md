## 1. Core Component Styling

- [x] 1.1 Update `DataTable` container with institutional top-accent border (2px var(--consorci-darkBlue)).
- [x] 1.2 Refine table header typography and spacing (tracking-[0.15em], text-[10px], font-bold).
- [x] 1.3 Implement lateral hover indicator (border-l-2) and smooth background transition on rows.
- [x] 1.4 Add subtle zebra striping pattern to data rows (bg-background-subtle/5 on even rows).

## 2. States and Feedback

- [x] 2.1 Implement `TableSkeleton` sub-component for high-fidelity loading state.
- [x] 2.2 Refactor `DataTable` to use `TableSkeleton` when `loading` is true, replacing the central spinner.
- [x] 2.3 Redesign empty state with a centered container, minimalist icon, and refined "No results" typography.

## 3. Hierarchy and Polish

- [x] 3.1 Standardize cell typography to distinguish between primary information (text-[13px]) and secondary metadata (text-[10px] text-muted).
- [x] 3.2 Ensure responsiveness and horizontal scroll behavior remains smooth in `premium-table-container`.
- [x] 3.3 Verify styling consistency across major admin pages: Centers, Workshops, and Phases.
