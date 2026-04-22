## Context

Currently, the application uses a mix of the standardized `DataTable` component and manual `<table>` implementations. The "Filter Bar" or "Filter Panel" above these tables is also manually coded in each page with slightly different paddings and layouts. This change aims to unify these into two core components: `DataTable` (improved) and `FilterPanel` (new).

## Goals / Non-Goals

**Goals:**
- Standardize the "Premium" table look across all pages.
- Standardize the "Filter Bar" layout and styling.
- Remove manual `<table>` implementations in favor of `DataTable`.
- Ensure consistent padding and gap between filters.

**Non-Goals:**
- Changing the underlying data fetching logic or state management.
- Modifying the mobile application tables (which are already standardized or follow different patterns).

## Decisions

### 1. New Component: `FilterPanel`
A new component will be created in `apps/web/components/ui/FilterPanel.tsx` (or `apps/web/components/FilterPanel.tsx`) to wrap the filter controls.

**Rationale:** Every page currently implements its own filter container with varying classes (`p-8`, `p-10`, `flex-col`, `grid-cols-3`, etc.). A shared component will enforce the project's "Premium" aesthetic.

**Props:**
- `children`: The filter controls (Inputs, Selects).
- `onClear`: Optional callback for a "Clear Filters" button.
- `title`: Optional title for the filter section.

### 2. `DataTable` Enhancements
Update `DataTable.tsx` to include:
- `variant`: Support `'default'` (with blue top border) and `'simple'` (no top border, for nested or section-based tables).
- `noBorder`: Option to remove the outer container border if needed.

### 3. Refactoring `Requests` Page
The `Requests` page is unique because it renders a workshop header followed by a table of requests for that workshop.
- Use `DataTable` inside the workshop loop.
- Use `variant="simple"` to avoid multiple blue top borders.

### 4. Refactoring `Phase2Table`
Convert `Phase2Table` into a wrapper that passes specific `columns` and `data` to `DataTable`.

## ASCII Architecture

```
┌───────────────────────────────────────────────────────────┐
│                    DashboardLayout                        │
│  ┌─────────────────────────────────────────────────────┐  │
│  │                  FilterPanel                        │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────┐ │  │
│  │  │ Search   │  │ Select 1 │  │ Select 2 │  │Clear │ │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────┘ │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │                   DataTable                         │  │
│  │  ┌───────────────────────────────────────────────┐  │  │
│  │  │ Header (Uppercase, Tracking, Muted Color)      │  │  │
│  │  ├───────────────────────────────────────────────┤  │  │
│  │  │ Row (Hover Blue Border-L, Even Bg)             │  │  │
│  │  └───────────────────────────────────────────────┘  │  │
│  │  ┌───────────────────────────────────────────────┐  │  │
│  │  │ Pagination Controls                           │  │  │
│  │  └───────────────────────────────────────────────┘  │  │
│  └─────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────┘
```

## Risks / Trade-offs

- **[Risk] Custom Cell Logic** → Some manual tables have complex inline logic (e.g., `Requests` page's teacher list). Mitigation: Use the `render` prop of `DataTable.Column` to port this logic cleanly.
- **[Trade-off] Multi-table layout** → Using many `DataTable` instances on one page might affect performance if not careful. Mitigation: `DataTable` is lightweight enough that this shouldn't be an issue for typical admin views.
