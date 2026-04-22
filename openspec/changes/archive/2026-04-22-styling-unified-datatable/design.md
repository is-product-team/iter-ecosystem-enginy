## Context

The `DataTable` component is the backbone of data presentation in the `apps/web` project. While it currently supports core functionality (pagination, custom rendering), its visual design is basic. We need to implement a "Premium Minimalist" style that matches the project's institutional identity and "Apple-style" refined aesthetics.

## Goals / Non-Goals

**Goals:**
- Centralize all premium styling logic within `DataTable.tsx`.
- Enhance row-level interactivity with brand-aligned feedback.
- Improve data scanability using subtle visual cues (zebra striping, hierarchy).
- Provide a high-fidelity loading experience that prevents layout shifts.

**Non-Goals:**
- Modifying the underlying data fetching or pagination logic.
- Updating mobile table implementations (NativeWind/Expo).
- Adding complex data manipulation features (e.g., drag-and-drop columns).

## Decisions

### 1. Structure and Visual Hierarchy
We will wrap the table in a container that handles the institutional top-accent.

```text
┌──────────────────────────────────────────┐
│  (Container) border-t-2 border-primary   │
├──────────────────────────────────────────┤
│  [ HEADER ] text-[10px] tracking-widest  │
├──────────────────────────────────────────┤
│  [ ROW 1 ] (hover) border-l-2 accent     │
├──────────────────────────────────────────┤
│  [ ROW 2 ] (zebra) bg-subtle/5           │
└──────────────────────────────────────────┘
```

### 2. Implementation of Skeleton States
Instead of a single spinner, we will introduce a `TableSkeleton` sub-component.
- **Rationale**: Maintaining the table structure during load reduces cumulative layout shift (CLS) and provides a smoother UX.
- **Approach**: Render `n` rows of pulsed div elements that match the current column configuration's alignment.

### 3. Lateral Hover Indicator
- **Rationale**: A lateral indicator provides a strong visual anchor for the current row without overwhelming the screen with background color changes.
- **Decision**: Use a `border-l-2 border-transparent hover:border-consorci-darkBlue` on the `tr` element. This requires ensuring the `td` doesn't have overlapping borders that hide it.

## Risks / Trade-offs

- **[Risk] High Density vs. Readability** → [Mitigation] Use `px-8 py-6` for rows to maintain "breathability" despite the small font sizes.
- **[Risk] Multiple Edits in Global CSS** → [Mitigation] Prefer Tailwind utility classes directly in the component to keep the design system scoped and easily maintainable.
- **[Risk] Performance on Large Lists** → [Mitigation] Ensure transitions are lightweight (only `border-color` and `background-color`).

## Open Questions
- Should the zebra striping be optional via a prop? (Decision: Default to enabled for better scanability, but consider a `noZebra` prop later).
