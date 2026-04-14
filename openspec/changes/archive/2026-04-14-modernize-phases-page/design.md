## Context

The current `phases/page.tsx` was built with an earlier iteration of the UI that relied on `font-black` and `uppercase` headers. The goal is to bring it into the modern "Minimalist Sharp" aesthetic.

## Goals / Non-Goals

**Goals:**
- Replace heavy weights with `font-medium`.
- Remove forced `uppercase` where it doesn't align with the Apple aesthetic.
- Standardize cards and spacing.
- Ensure the root container follows the `w-full pb-20 space-y-12` pattern.

**Non-Goals:**
- Changing the underlying business logic of phase management.
- Modifying the API endpoints.

## Decisions

### 1. Unified Typography
We will use `font-medium` for headers and descriptions, matching the rest of the app.

### 2. Standardized Card Component
Instead of custom 8px borders, we will use standard `border-border-subtle` with a smaller accent (e.g., `border-l-4`) or a background highlight for active phases.

### 3. Root Container Refactor
The page will be wrapped in:
```tsx
<DashboardLayout ...>
  <div className="w-full pb-20 space-y-12">
    ...
  </div>
</DashboardLayout>
```

## Risks / Trade-offs

- **[Risk] Visibility of active phase** → Mitigation: Use a strong `consorci-darkBlue` badge and a subtle left border highlight.
