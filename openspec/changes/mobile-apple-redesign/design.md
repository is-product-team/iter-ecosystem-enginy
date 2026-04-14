## Context

The current Iter Ecosystem mobile app utilizes an "editorial" or "brutalistic" design style featuring sharp corners, solid dark lines, and tracked uppercase typography. While visually distinctive, it diverges significantly from the Human Interface Guidelines (HIG) established by Apple, which iOS users find more intuitive and premium. Transitioning to a softer, iOS-native style with squircle bounds, inset groupings, and better typographic hierarchy will modernize the UI/UX while retaining the brand's professional feel.

## Goals / Non-Goals

**Goals:**
- Replace brutalist structural elements with iOS-aligned "Apple-style" interfaces.
- Build a reusable UI components folder (`apps/mobile/components/ui/`) mirroring the web/desktop profile components' polished style.
- Maintain the current functional feature set while upgrading the visual layer.

**Non-Goals:**
- Rewrite the underlying navigation or routing architecture (Expo Router stays as is).
- Modify backend APIs or interactions.
- Change the core color palette drastically; `pink-red` will remain the accent color.

## Decisions

- **UI Component System Setup:** We will create standard reusable UI components (e.g., `Card`, `Button`, `TextInput`, `ListGroup`) inside `apps/mobile/components/ui`. This ensures consistency across screens and speeds up future development. *Alternative:* Hardcode NativeWind classes on every screen. *Rejected:* Leads to inconsistency and harder maintenance.
- **Styling with NativeWind:** We'll continue using NativeWind as the styling engine, updating the tailwind configuration to include new `rounded-*` scale adjustments if necessary, but mostly leveraging standard classes like `rounded-2xl` and `bg-background-surface` to match Apple's Inset Grouped style.
- **Typography Updates:** Remove `uppercase tracking-widest` in headers. Adopt `font-semibold text-lg` for prominent text, aligning with iOS Large Titles and standard sentence casing.

## Risks / Trade-offs

- **[Risk] Slower Adoption on Android:** The Apple-like aesthetic might feel less "native" to Android users.
  - **Mitigation:** Rely on neutral geometries that look good universally (rounded corners, clean typography) rather than overusing specifically iOS-only blur effects where they degrade performance.
- **[Risk] Existing Screen Layout Breakages:** Adjusting padding and grouping might overflow or squeeze existing form elements.
  - **Mitigation:** Implement changes incrementally, starting with `login.tsx`, and standardizing the container bounds via a shared `Screen` wrapper.
