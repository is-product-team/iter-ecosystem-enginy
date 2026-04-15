## Context

The current frontend implementation of tables is fragmented across multiple pages (e.g., `AdminRequestsPage`, `WorkshopAdminPage`, `CenterRequestsPage`). While they share some CSS classes (like `.premium-table-container`), the logic for pagination, loading states, and responsive behavior is duplicated. This makes it difficult to maintain a consistent "premium" look-and-feel and increases the chance of bugs.

## Goals / Non-Goals

**Goals:**
- **Standardization**: Enforce the "Premium" table design across all data-heavy views.
- **D.R.Y.**: Centralize table logic (pagination, loading, empty states).
- **Flexibility**: Support complex cell rendering via a simple configuration API.
- **Accessibility**: Ensure tables are properly structured for screen readers.

**Non-Goals:**
- **Advanced State Management**: This component will focus on presentation; complex filtering logic remains in the parent page for now.
- **Mobile Cards**: Transforming tables into cards on mobile is out of scope; we will stick to horizontal scrolling for this phase.

## Decisions

### 1. Component API Design
We will adopt a generic, configuration-driven API. This allows for type-safety while remaining highly flexible.

```typescript
interface Column<T> {
  header: string;
  accessor?: keyof T; // For simple property access
  render?: (item: T) => React.ReactNode; // For custom cell content
  headerClassName?: string;
  cellClassName?: string;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyMessage?: string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalItems?: number;
    itemName?: string;
  };
}
```

### 2. UI Structure
The component will wrap the standard HTML `table` element in the specific nesting required for the "premium" effect:

```
┌──────────────────────────────────────────────────────────────────┐
│ [Wrapper] .bg-background-surface .border .border-border-subtle   │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ [.premium-table-container] (Horizontal Scroll + Gradients)   │ │
│ │ ┌──────────────────────────────────────────────────────────┐ │ │
│ │ │ <table> .w-full .text-left                               │ │ │
│ │ │   <thead> .bg-background-subtle .border-b                │ │ │
│ │ │   <tbody> .divide-y .divide-border-subtle                │ │ │
│ │ └──────────────────────────────────────────────────────────┘ │ │
│ └──────────────────────────────────────────────────────────────┘ │
│ [Pagination] (Standardized Footer)                               │
└──────────────────────────────────────────────────────────────────┘
```

### 3. Localization
The component SHALL NOT contain hardcoded strings. `emptyMessage` and `itemName` must be passed as translated strings from the parent.

## Risks / Trade-offs

- **[Risk]** High abstraction might limit extremely unique table needs → **[Mitigation]** Include a `render` function per cell and allow custom `className` overrides.
- **[Risk]** Type complexity with generic `T` → **[Mitigation]** Use TypeScript generics effectively to ensure `accessor` and `render` remain type-safe.
