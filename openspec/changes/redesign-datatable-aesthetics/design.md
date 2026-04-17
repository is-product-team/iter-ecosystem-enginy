## Architecture Overview

The redesign focuses on local component styling and props expansion. The `DataTable` will remain a controlled component but will gain new internal layout logic for the "grid" mode.

```
┌─────────────────────────────────────────────────────────┐
│                    FilterPanel (New)                    │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐ │
│ │ Filter A │ │ Filter B │ │ Filter C │ │ Clear (Icon) │ │
│ └──────────┘ └──────────┘ └──────────┘ └──────────────┘ │
├─────────────────────────────────────────────────────────┤
│                    DataTable Header                     │
│ ┌──────┬──────────┬──────────┬──────────┬──────────┐    │
│ │  #   │ Column A │ Column B │ Column C │ Column D │    │
│ │      │ (Icon)   │ (Icon)   │ (Icon)   │ (Icon)   │    │
│ └──────┴──────────┴──────────┴──────────┴──────────┘    │
├─────────────────────────────────────────────────────────┤
│                    DataTable Body                       │
│ ┌──────┬──────────┬──────────┬──────────┬──────────┐    │
│ │  1   │ Row 1 A  │ Row 1 B  │ Row 1 C  │ Row 1 D  │    │
│ ├──────┼──────────┼──────────┼──────────┼──────────┤    │
│ │  2   │ Row 2 A  │ Row 2 B  │ Row 2 C  │ Row 2 D  │    │
│ └──────┴──────────┴──────────┴──────────┴──────────┘    │
└─────────────────────────────────────────────────────────┘
```

## Technical Decisions

### 1. Vertical Separation
We will use `border-r border-border-subtle` on all `th` and `td` elements. The `DataTable` will use `border-collapse` to ensure borders align perfectly without doubling.

### 2. Header Composition
The header will use a multi-icon approach:
- **Left**: Data-type icon (e.g., `#` for index, `Type` for text, `Calendar` for dates).
- **Right**: Chevron for sorting or Filter icon for column-level filtering.
- **Background**: `--bg-subtle` with a slight opacity to work well in both light and dark modes.

### 3. Integrated FilterPanel
The `FilterPanel` will receive a `variant="inline"` prop. When set:
- It removes its own border and padding.
- It adopts the same grid background as the header.
- It sits flush against the table top.

### 4. Link Styling
Specific column renderers or a global utility class will be used to apply the `--consorci-light-blue` color to interactive text, matching the "Album" columns in the mockup.

## Data Flow

1. `DataTable` consumes data and columns.
2. `Column` definition expanded to include `icon: React.ReactNode`.
3. `FilterPanel` remains independent but shares the same CSS theme variables for visual continuity.
