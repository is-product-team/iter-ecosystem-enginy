# Proposal: Fix Phase 2 Syntax and Stability

## Goal
The primary objective of this change is to resolve critical 500 Internal Server Errors and application crashes (code 0 exit) that occurred during the restructuring of the Phase 2 Coordinator workflow. We aim to restore full functionality to the Assignment Details page and the main Center Dashboard.

## Context
Recent manual refactoring and potential merge conflicts have corrupted the JSX structure in key application routes. Specifically:
- `apps/web/app/[locale]/center/assignments/[id]/page.tsx` fails to parse due to an unexpected token near `<DashboardLayout`.
- `apps/web/app/[locale]/center/page.tsx` contains broken layout logic in the "Direct Access" section.

## Proposed Solution
1. **Assignment Details Fix**: 
   - Re-standardize the `DashboardLayout` component usage.
   - Clean up the `subtitle` prop value to use standard JSX curly braces without redundant parentheses that might confuse the parser.
   - Ensure all imports and hooks are correctly placed.

2. **Center Dashboard Fix**:
   - Re-index the layout to fix the broken `div` nesting in the "Direct Access" cards section.
   - Ensure all links use the correct `locale` prefix for consistent navigation.

3. **Stability Audit**:
   - Verify that the development server stays alive after these fixes and that the Phase 2 features (Selection Drawer, Table, AI Matcher) are accessible and functional.

## Impact
- **Coordinator UX**: Restores access to the core workshop management tools.
- **System Stability**: Prevents server-side crashes that stop the entire development environment.
