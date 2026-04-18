## Context

The current `DataTable` implementation provides a professional grid, but the controls (search, filters, titles) are handled inconsistently across pages. Some pages use a floating `FilterPanel`, others use custom flex containers. This fragmentation breaks the "sharp" design language and makes maintenance difficult.

## Goals / Non-Goals

**Goals:**
- Create a unified `DataTableToolbar` component.
- Implement a strict grid-based filter system with no rounded corners or shadows.
- Ensure perfect visual alignment between the toolbar and the `DataTable`.
- Provide a responsive layout that scales gracefully.

**Non-Goals:**
- Modifying the internal logic of the `DataTable` (sorting, pagination).
- Implementing server-side filtering logic within the UI component (remains controlled by parent).
- Adding complex multi-stage filtering (e.g., query builders).

## Decisions

### 1. Unified Grid Architecture
We will use a CSS Grid for the filter area. Each filter item will be wrapped in a "cell" div.
- **Rationale**: Grid borders are easier to align than flex margins, ensuring that vertical lines in the filters can align with column boundaries in the table if desired.
- **Structure**:
  ```
  ┌───────────────────────────────────────────────────────────┐
  │ [Icon] Title                           [Count]  [Actions] │ <-- Header Bar
  ├─────────────┬─────────────┬─────────────┬─────────────────┤
  │ Search Input│ Filter A  v │ Filter B  v │ Clear Button    │ <-- Filter Grid
  └─────────────┴─────────────┴─────────────┴─────────────────┘
  ```

### 2. The "Sharp" Visual System
Strict exclusion of `rounded-*` and `shadow-*` classes.
- **Borders**: `border-border-subtle` (1px).
- **Backgrounds**: `bg-background-subtle` for filter cells to distinguish them from the pure white table surface.
- **Inputs**: Transparent backgrounds with zero default browser styling, relying on the grid cell for structure.

### 3. Responsive Breakpoints
- **Mobile (< 768px)**: `grid-cols-1`. Filters stack vertically.
- **Tablet (768px - 1024px)**: `grid-cols-2`.
- **Desktop (> 1024px)**: `grid-cols-4` or `flex` with equal widths.

### 4. Component Interface (Props)
```typescript
interface DataTableToolbarProps {
  title?: string;
  icon?: React.ReactNode;
  resultsCount?: number;
  itemName?: string; // for "X items" label
  actions?: React.ReactNode;
  search?: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  };
  filters?: React.ReactNode; // For passing custom FilterSelect components
  onClear?: () => void;
}
```

## Risks / Trade-offs

- **[Risk] Border Doubling** → The `DataTable` already has a border. If the toolbar is placed above, the borders might overlap or double.
- **[Mitigation]** → Use `border-b-0` on the toolbar container or `border-t-0` on the table component when a toolbar is detected/present.
- **[Risk] Filter Overflow** → Too many filters might look cramped on tablet.
- **[Mitigation]** → Use `grid-cols-1` earlier if the number of children in `filters` exceeds a threshold, or allow the grid to wrap.
