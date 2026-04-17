## Context

The unified `DataTable` component is working well, but needs a "finishing touch" to match the high standards of the Iter Ecosystem's visual identity. Specific issues include the instability of the lateral hover indicator (due to `border-collapse`) and the lack of context during long scrolls.

## Goals / Non-Goals

**Goals:**
- Improve scrolling context with a sticky, blurred header.
- Fix visual flickering of the lateral hover indicator.
- Make loading states feel more organic and less "robotic".
- Provide flexibility for high-density data views.

**Non-Goals:**
- Implementation of actual sorting logic (this change is visual-only for headers).
- Changes to the underlying pagination state management.

## Decisions

### 1. Sticky Header with Blur
We will use `sticky top-0` on the `thead` element.
- **Visuals**: `bg-background-subtle/80 backdrop-blur-md` ensures readability while maintaining a premium "glass" feel.
- **Z-index**: High enough to stay above row content but below global overlays (modals/drawers).

### 2. Stable Lateral Indicator
Instead of applying `border-l` to the `tr`, we will apply it to the first `td`.
- **Logic**: Use `group-hover:border-l-consorci-darkBlue` on the first cell. This bypasses the rendering issues of `border-collapse` on table rows.

### 3. Randomized Skeleton Widths
The `TableSkeleton` will vary the width of its bars.
- **Implementation**: Use a helper function or a static set of widths (e.g., `['w-2/3', 'w-1/2', 'w-3/4']`) based on the column index to create a natural "ragged" look.

### 4. Density Prop
A new `density` prop will be added to `DataTableProps`.
- **Mapping**:
    - `compact`: `py-3 text-[12px]`
    - `normal`: `py-6 text-[13px]` (Default)
    - `spacious`: `py-10 text-[14px]`

## Risks / Trade-offs

- **[Risk] Sticky Header Occlusion** → [Mitigation] Ensure the container `overflow-hidden` doesn't clip the sticky element prematurely.
- **[Risk] Browser Support for Backdrop-blur** → [Mitigation] Use a fallback opaque background color for browsers that don't support blur.

## Open Questions
- Should we add a `max-h` prop to the table to trigger internal scroll? (Decision: Leave as container-controlled for now).
