## Why

The mobile application currently exhibits inconsistent UI styling, particularly in the navigation headers which use a dark blue scheme (`#0f172a` or `#00426b`) that deviates from the neutral dark aesthetic used in the web platform and other mobile components. Additionally, the header patterns across main screens (Inici, Calendari, Perfil) are not unified, leading to a fragmented user experience.

## What Changes

- **Neutral Dark Theme**: Standardization of the dark mode palette to use neutral dark tones (`#171717`) instead of the current blue-tinted scheme.
- **Global PageHeader Component**: Creation of a unified header component for main screens following a "Large Title" pattern (Title followed by Subtitle, left-aligned).
- **Native Header Neutralization**: Customization of native navigation headers to remove "Default iOS Blue" (`#007AFF`) and use theme-consistent colors for back buttons and headers.
- **Profile Layout Unification**: Reorganization of the Profile page layout to integrate the new unified header pattern and align its "Identity Card" with the overall app aesthetic.

## Capabilities

### Modified Capabilities
- `mobile`: Updating UI patterns and theme constants for the teacher mobile application.

## Impact

- **Mobile Application (`apps/mobile`)**: High impact on layout components, global CSS, and navigation configurations.
- **Shared Theme (`shared/theme.ts`)**: Minor impact if theme primitives need alignment, though local overrides are favored for stability during this change.
