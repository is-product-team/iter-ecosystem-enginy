## Why

The current `DataTable` implementation has minor visual flaws and missing high-fidelity features (like sticky headers and realistic loading states) that prevent it from feeling like a truly polished "Apple-style" premium component. This change addresses these refinements to achieve 100% aesthetic excellence in data presentation.

## What Changes

- **Sticky Header with Glassmorphism**: Implement a sticky `thead` with `backdrop-blur-md` and semi-transparent background.
- **Stable Lateral Indicator**: Move the hover lateral indicator from the `tr` to the `td:first-child` for pixel-perfect stability.
- **Realistic Skeletons**: Randomize skeleton widths to mimic real-world data variety.
- **Density Control**: Add a `density` prop (`compact` | `normal` | `spacious`) to adjust row padding dynamically.
- **Sorting Visuals**: Add subtle, minimalist icons to headers to indicate sortable columns (visual-only for now).

## Capabilities

### Modified Capabilities
- `shared-ui-datatable`: Update visual requirements to include sticky header behavior, density control, and realistic skeleton patterns.

## Impact

- **Components**: `apps/web/components/ui/DataTable.tsx` will be significantly refactored for aesthetics.
- **User Experience**: Enhanced readability and context preservation during scrolling across all admin views.
