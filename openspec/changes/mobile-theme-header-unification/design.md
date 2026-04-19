## Context

The teacher's mobile application (`apps/mobile`) currently uses a theme that lacks full parity with the web application's premium aesthetic. Specifically, the dark mode is tinted blue (`#0f172a`), and the header patterns across main screens (Dashboard, Calendar, Profile) are inconsistent in layout, typography, and color. Native navigation elements (like back buttons) default to iOS/Android system blues (`#007AFF`), which clash with the brand's palette.

## Goals / Non-Goals

**Goals:**
- **Visual Parity**: Match the mobile theme with the web's neutral dark palette (`#171717`).
- **Standardized Header Pattern**: Unify all main screens under a "Large Title -> Subtitle" layout.
- **Native Experience**: Maintain native navigation transitions and headers while neutralizing their colors.
- **Reorganize Profile**: Modernize the profile page to match the new header pattern and list-style identity information.

**Non-Goals:**
- Rewriting navigation logic or switching to a custom header component that replaces the native stack.
- Redesigning individual dashboard cards or internal session logic (outside of headers).

## Decisions

### 1. Transparent Native Header with Custom `PageHeader`
**Rationale:** The user wants to keep the "professionalism" of native components. By keeping the native header (for back buttons and title transitions) but setting it to transparent or theme-synced colors, we can place a custom `PageHeader` in the page content that handles the "Large Title" and subtitles exactly as requested.

### 2. Standardized Dark Mode Constants
**Rationale:** To achieve the neutral dark aesthetic, we must synchronize `global.css` (Tailwind/NativeWind) and the `vars` used in `RootLayout`. This ensures that even components that don't use CSS variables stay consistent.

```ascii
┌─────────────────────────────────────────┐
│ [ < Enrere ] (Native, Neutral Tint)     │ <- Native Header (Transparent)
├─────────────────────────────────────────┤
│                                         │
│   TITOL GRAN (Custom PageHeader)        │ <- Unified Pattern
│                                         │
│   Subtítol informatiu                   │
│                                         │
└─────────────────────────────────────────┘
```

## Risks / Trade-offs

- **[Risk] Status Bar / Inset Overlap** → **Mitigation**: Use `useSafeAreaInsets` to provide consistent top padding that accounts for the native header height and the "notch" area.
- **[Risk] Dark Mode Color Lag** → **Mitigation**: Ensure `vars({})` in `RootLayout` are updated synchronously with the `colorScheme` hook to prevent the blue tint from flashing during transitions.
