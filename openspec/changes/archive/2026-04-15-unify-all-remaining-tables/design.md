## Context

Following the creation of the `DataTable` component, the web application is in a hybrid state where newer features use the centralized component while older CRUD and management screens remain on manual HTML table implementations. This design covers the final refactoring required to reach 100% component coverage.

## Goals / Non-Goals

**Goals:**
- **Full Coverage**: Migrate all remaining 7 table views to `DataTable`.
- **State Integrity**: Ensure interactive tables (like Attendance) remain fully functional.
- **Component Parity**: Bring `Phase2Table` into the same visual design system.

**Non-Goals:**
- **API Refactoring**: The backend services and data structures will remain unchanged.
- **Mobile Cards**: We continue to rely on responsive horizontal scrolling for tables on small screens.

## Decisions

### 1. Handling Interactive Cells (Attendance Page)
The Attendance page requires buttons and inputs within the table. We will pass these via the `render` property of the column configuration.

```typescript
// Example for Attendance Status Buttons
{
  header: t('table_status'),
  render: (record) => (
    <div className="flex gap-2">
      {statusOptions.map(opt => (
        <StatusButton 
          active={record.status === opt.value} 
          onClick={() => handleStatusChange(record.enrollmentId, opt.value)}
        />
      ))}
    </div>
  )
}
```

### 2. Standardization of Phase2Table
Instead of a full refactor of `Phase2Table.tsx` (which contains complex internal logic), we will update its wrapper and CSS classes to match the `DataTable`'s "Premium" layout exactly.

```
DataTable Visual Signature (Standard)
┌──────────────────────────────────────┐
│ .bg-background-surface .border       │
│ ┌──────────────────────────────────┐ │
│ │ .premium-table-container         │ │
│ │ ┌──────────────────────────────┐ │ │
│ │ │ <thead> .bg-background-subtle│ │ │
│ │ └──────────────────────────────┘ │ │
│ └──────────────────────────────────┘ │
└──────────────────────────────────────┘
```

### 3. Cleanup of Parent Pages
Parent pages will be significantly simplified by removing:
- Manual `<table>`, `<thead>`, `<tbody>` nesting.
- External `<Pagination />` components (now handled inside `DataTable`).
- Local `loading` and `empty` logic blocks.

## Risks / Trade-offs

- **[Risk]** Large PR size due to many files touched → **[Mitigation]** Group changes by CRUD vs. Management in implementation tasks.
- **[Risk]** Functional regressions in interactive elements (Attendance) → **[Mitigation]** Explicitly verify state persistence in the attendance form after migration.
