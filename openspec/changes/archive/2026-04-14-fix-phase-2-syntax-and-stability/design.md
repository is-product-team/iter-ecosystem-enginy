# Design: Fix Phase 2 Syntax and Stability

## Architecture Overview
The fix focuses on the correct implementation of the `DashboardLayout` component across the coordinator dashboard routes.

### Component Relationship
```
┌────────────────────────────────────────────────────────┐
│                   DashboardLayout                      │
│  ┌──────────────────────────────────────────────────┐  │
│  │                     Navbar                       │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  ┌───────────────┐      ┌─────────────────────┐  │  │
│  │  │    Title      │      │       Actions       │  │  │
│  │  └───────────────┘      └─────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────┐ │  │
│  │  │              Subtitle (JSX Slot)            │ │  │
│  │  └─────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │                    Children (Content)            │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

## Implementation Details

### 1. JSX Structure Cleanup
The current error in `assignments/[id]/page.tsx` is likely caused by the complicated prop values. We will simplify the `subtitle` prop to avoid nested parentheses and ensure the tag closing `>` is strictly followed by the children content.

**Current (Broken):**
```tsx
<DashboardLayout
  title={...}
  subtitle={(
    <div />
  )}
>
```

**Proposed (Stable):**
```tsx
<DashboardLayout
  title={...}
  subtitle={
    <div className="...">
       {/* Content */}
    </div>
  }
>
```

### 2. Layout Reconciliation in `center/page.tsx`
We will re-align the "Direct Access" grid to fix the broken `div` hierarchy.

### 3. Localization Handling
Ensure that all `router.push` calls use the `${locale}` prefix to prevent losing the localization context during navigation, which can lead to 404s or 500s on middleware redirect loops.
