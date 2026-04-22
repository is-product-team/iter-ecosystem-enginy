# Proposal: Mobile Dark Mode Refinement

## Problem
The teacher's mobile application currently has an inconsistent implementation of Dark Mode. While some parts respect the system's theme, many UI elements use hardcoded light-mode colors (hex codes in styles or non-semantic Tailwind classes). This creates a fragmented user experience, lacks parity with the web application's dark theme, and makes visual maintenance difficult.

## Goals
- **Parity:** Align the mobile application's dark palette with the web application (using `#171717`, `#212121`, etc.).
- **Consistency:** Ensure all teacher-facing screens and components (Dashboard, Calendar, Modals) adapt correctly to dark mode.
- **Maintainability:** Replace hardcoded color values with a semantic token system based on CSS variables, unified across the monorepo.

## Scope
- **Foundation:** Update `tailwind.config.js` and `global.css` in `apps/mobile`.
- **UI Components:** Refactor critical components: `DashboardScreen`, `SessionCarousel`, `CalendarView`, `WorkshopDetailModal`, and `MobileNavbar`.
- **Global Theme:** Ensure correct propagation of the `.dark` class from NativeWind.

## Risks & Mitigations
- **Readability:** Ensure color contrast meets accessibility standards in dark mode. *Mitigation:* Use verified hex values from `shared/theme.ts`.
- **Regression:** Changes to global styles might affect light mode. *Mitigation:* Test both modes in the emulator/device after changes.
