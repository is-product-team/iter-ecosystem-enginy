# Redesign: Minimalist Sharp Professional

## Motivation

The current UI follows an "Institutional/Brutalist" style that feels dated due to heavy bold weights, uppercase headings, and extreme high-contrast elements. We want to transition to a **Modern, Premium Minimalist** aesthetic that feels "Apple-like" in its clarity and hierarchy, but maintains a **Serious and Professional** tone by preserving sharp edges (0px radius) and avoiding visual fluff like shadows.

This change will improve readability, simplify visual processing for the user, and give the platform a state-of-the-art feel without compromising its professional integrity.

## What Changes

*   **Typography Overhaul**: Transitioning all text to **Inter**. Replacing `font-bold` (700) and `uppercase` with `font-medium` (500) and **Sentence case**.
*   **Aesthetic Standardization**: Moving from solid high-contrast backgrounds to **Depth via Layering** (light gray surfaces vs white surfaces) with **1px Subtle Borders**.
*   **Visual Cleanup**: Removing all drop shadows and ensuring a strict **0px border-radius** across the entire platform.
*   **Glassmorphism Effects**: Introducing subtle `backdrop-blur` on persistent navigation and headers for a modern texture.
*   **Toaster & Notification Redesign**: Updating common UI utilities (Sonner/Toasts) to match the new sharp-edged, no-bold aesthetic.

## Capabilities

### New Capabilities
- `ui-modernization`: A comprehensive set of global CSS variables and utility classes implementing the Minimalist Sharp design system.

### Modified Capabilities
- `branding`: Redefining how brand colors are applied to interactive elements to prioritize semantic layering over fixed primary colors.

## Impact

1.  **Frontend Layouts**: Every page using global CSS or common layout components will see an immediate aesthetic shift.
2.  **Component Library**: Buttons, Cards, Inputs, and Navigation will need specific tailwind class removals (`font-bold`, `uppercase`, `shadow-*`).
3.  **Global Styles**: `app/globals.css` will be the primary entry point for the new system.
