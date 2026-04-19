## Why

Following the initial stabilization of the Button component, many parts of the application still rely on manual `<button>` tags with hardcoded Tailwind classes. This technical debt creates visual inconsistencies (varied paddings, different blue shades, inconsistent hover effects) and makes global design updates nearly impossible. Standardizing ALL buttons will finalize the unification of the dashboard's interactive language.

## What Changes

- **Universal Migration**: Systematic replacement of all native `<button>` and custom-styled interactive tags with the centralized `<Button />` component in `apps/web`.
- **Consistency Audit**: Verification that all buttons across "Centers", "Sessions", "Assignments", and "Admin Monitoring" use correct brand variants (`primary`, `outline`, `link`, `danger`).
- **Standardized Spacing**: Alignment of button paddings and font sizes to the `sm`/`md`/`lg` system across all forms and tables.

## Capabilities

### New Capabilities
<!-- No new capabilities, focusing on universal adoption -->

### Modified Capabilities
- `ui-components`: Updated to mandate the use of the standardized Button library for all new and existing web application features.

## Impact

- **Affected Code**: Approximately 40+ files in `apps/web` (Components and Pages).
- **User Experience**: Perfectly consistent interaction feedback (hover/active states) throughout the entire platform.
- **Maintainability**: Centralized control over the "Look and Feel" of all interactive triggers.
