## Context

The initial phase of standardization successfully introduced the `Button` component in `apps/web` and refactored core administrative views. However, a significant number of manual `<button>` implementations remain in secondary views, modals, and specialized widgets (e.g., `Pagination`, `LanguageSelector`, `ClosureModal`). This design outlines the strategy for a total migration.

## Goals / Non-Goals

**Goals:**
- Replace 100% of native `<button>` tags in `apps/web` with the global `<Button />` component.
- Stabilize the visual density of the application by enforcing consistent `sm`/`md` scaling.
- Eliminate ad-hoc Tailwind color overrides for interactive elements.

**Non-Goals:**
- Refactoring the `mobile` app (out of scope for this change).
- Modifying the underlying `Button` component logic (unless a missing prop is discovered).

## Decisions

### 1. Systematic Migration Path
We will utilize a module-by-module approach rather than a single global search-and-replace to ensure prop accuracy:
1. **Core Widgets**: `Navbar`, `Pagination`, `LanguageSelector`.
2. **Modals & Drawers**: `ClosureModal`, `SyncCalendarModal`, `CreateCenterModal`, `StudentSelectionDrawer`.
3. **Complex Pages**: `Reports`, `Requests`, `Profile`, `Verifications`.

### 2. Style Mapping Strategy
Manual classes will be mapped to `Button` props as follows:
- `bg-consorci-darkBlue text-white` → `variant="primary"`
- `border border-consorci-darkBlue text-consorci-darkBlue` → `variant="outline"`
- `underline text-consorci-darkBlue` → `variant="link"`
- `bg-red-600` → `variant="danger"`
- `px-2 py-1 text-xs` → `size="sm"`

## Risks / Trade-offs

- **[Risk]** Dynamic Class Strings → **[Mitigation]** Standardizing conditional logic within the `variant` prop (e.g., `variant={active ? "primary" : "outline"}`).
- **[Risk]** Third-party components (e.g., Radix/Shadcn-like primitives) → **[Mitigation]** We will wrap them or use the `Button` component as a trigger using the `asChild` pattern if necessary (though current `Button` is a standard wrapper).
