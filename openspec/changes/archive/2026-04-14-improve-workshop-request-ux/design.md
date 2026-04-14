# Design: Contextual Workshop Request Form

## Architecture Overview
The redesign pivots from a static two-column layout to a dynamic single-column layout with conditional expansion.

### Layout Transformation
```
[ OLD ]                              [ NEW ]
┌───────────────┬─────────┐         ┌─────────────────────────┐
│ Catalog       │ Sidebar │         │ Search / Filters        │
│               │ (Form)  │         ├─────────────────────────┤
│ Row 1         │         │         │ [ Row 1 ]               │
│ Row 2         │         │         │ [ Row 2 (Selected) ]    │
│ Row 3         │         │         │ ├─ [ Expandable Area ]  │
│               │         │         │ │  Form + Description   │
│               │         │         │ └───────────────────────┘
└───────────────┴─────────┘         │ [ Row 3 ]               │
                                    └─────────────────────────┘
```

## UI Components

### 1. Enhanced Workshop Row
Each row in the catalog will now display meta-information:
- **Badge**: Modality (A, B, C)
- **Title**: Primary name
- **Secondary Info**: Sector | Duration | Max Capacity
- **Status/Action**: Inline status or "Request" button

### 2. Expandable Form Area
When a row is expanded:
- **Left/Top**: Full workshop description (technical details).
- **Right/Bottom**: Request form (Teachers selection, Students count, Comments).
- **Background**: Subtle highlight to indicate expansion context.

## Theme Integration
To fix the dark mode issues, several hardcoded values will be replaced with semantic tokens:

| Property | Current (Hardcoded) | Semantic Token |
|----------|---------------------|----------------|
| Text Sec | `text-gray-700`     | `text-text-secondary` |
| Text Mut | `text-gray-500`     | `text-text-muted` |
| Border   | `border-gray-200`   | `border-border-subtle` |
| Success  | `bg-green-50`       | `bg-green-500/10` (with variable text) |

## Data Flow
Clicking a "Request" button or selecting a row triggers the `selectedWorkshopId` state, which now controls which row is expanded instead of just what appears in the sidebar.
