## Why

The Iter Ecosystem currently lacks a centralized UI component library, causing inconsistent button styles across the administrative dashboard. Developers frequently recreate buttons with manual Tailwind classes, leading to visual fragmentation (e.g., varying hover states and paddings) and increased maintenance overhead. Standardizing buttons now will unify the user interface and streamline future development.

## What Changes

- **New UI Primitive**: Implementation of a reusable `Button` component in the web application's UI library.
- **Variants Support**: Support for `primary` (solid), `outline` (bordered), and `link` (underlined) visual styles.
- **Scaling System**: Introduction of a 3-size system (`sm`, `md`, `lg`) to handle different information density requirements.
- **Standardization**: Refactoring of key pages (`Phases Management`, `Workshops`, `ConfirmDialog`) to replace manual button implementations with the new component.
- **Behavioral Uniformity**: Uniform hover and active states (Transition 0.2s, color shifts) and built-in support for right-aligned icons and `fullWidth` layouts.

## Capabilities

### New Capabilities
- `ui-components`: Defines the foundational requirements for standardized UI primitives (buttons, inputs, cards) to ensure visual and functional consistency across the dashboard.

### Modified Capabilities
<!-- No requirement changes to existing capabilities -->

## Impact

- **Affected Code**: `apps/web/components/ui/`, `apps/web/app/[locale]/phases/page.tsx`, `apps/web/app/[locale]/workshops/page.tsx`.
- **Design System**: Updates to the institutional "Minimalist Sharp" styling tokens for interactive elements.
- **Development Workflow**: Simplified button creation for future features.
