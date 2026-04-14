## Context

The current admin interface was partially migrated to the "Minimalist Sharp" theme, but many hardcoded styles remain from the original boilerplate. These styles are fixed to light mode values (`white`, `gray-200`, etc.).

## Goals / Non-Goals

**Goals:**
- Eliminate all hardcoded `white`, `gray` references from the admin JSX.
- Ensure all admin modals and tables look premium in dark mode.

**Non-Goals:**
- Changing the layout or functional logic of the admin pages.

## Decisions

### 1. Direct Replacement with Semantic Tokens
We will map the following:
- `bg-white` → `bg-background-surface`
- `border-gray-200` → `border-border-subtle`
- `text-gray-700` → `text-text-secondary`
- `text-gray-400` → `text-text-muted`
- `bg-gray-200` → `bg-background-subtle` (for dividers or backgrounds)
- `hover:bg-gray-50` → `hover:bg-background-subtle`

### 2. Specific Component Fixes
Some components like `CreateWorkshopModal` use specific colors for icon selection or buttons that need attention to ensure they don't disappear in dark mode.

## Risks / Trade-offs

- **[Risk] Contrast issues** → Mitigation: Use the predefined variables in `globals.css` which have been tested for accessibility.
