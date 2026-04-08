# Design: Minimalist Sharp UI Redesign

## 1. Global & Shared Design System Update

- [x] 1.1 Update `shared/theme.ts` with ChatGPT-style neutral tones.
- [x] 1.2 Update `apps/web/app/globals.css` with 0px radius and Inter fonts.

## Context

The current platform uses a mix of "Institutional" styles defined in `globals.css` and ad-hoc Tailwind classes (`font-bold`, `uppercase`, `shadow-sm`, etc.). The result is a high-density, high-contrast, but visually busy interface. We are moving to a refined, professional look characterized by sharp edges and clean typography.

## Goals / Non-Goals

**Goals:**
*   **Typography**: Standardize on **Inter**. Replace all `700` weights with `400/500`.
*   **Geometry**: Enforce `0px` radius (sharp corners) globally to maintain a "serious and professional" tone.
*   **Depth**: Implement a 3-layer background system (Page > Surface > Interactive) using color contrast instead of shadows.
*   **Clarity**: Remove all `uppercase` text transformation from headings and buttons.
*   **Modernity**: Add `backdrop-blur` (Glassmorphism) to navigation components.

**Non-Goals:**
*   Does not involve changing the functional structure or navigation flows.
*   Does not involve changing the core brand colors (though their application will be lightened).

## Decisions

### 1. Typography Weights
We will remove `font-bold` and `uppercase` from:
*   Headers (h1-h6)
*   Buttons
*   Navigation links
*   Labels
We will replace them with `font-medium` (500) for hierarchy.

### 2. Geometry & Depth (No Shadows/No Radius)
To maintain professionalism:
*   `border-radius: 0 !important` will be enforced globally.
*   `box-shadow: none !important` will be enforced.
*   **Hierarchy** will be established by:
    *   **Light Mode**:
        *   Page: `#F7F8F9` (Off-white)
        *   Surface: `#FFFFFF` (Pure white)
        *   Border: `1px solid #E5E7EB`
    *   **Dark Mode (ChatGPT Style)**:
        *   Page: `#171717` (Deep Black/Gray)
        *   Surface: `#212121` (Dark Charcoal)
        *   Interactive/Hover: `#2F2F2F`
        *   Border: `1px solid #424242`
        *   *No blue tints* in any neutral surfaces.

### 3. Glassmorphism (Modern Touch)
The Sidebar and Header will use:
`bg-white/80 backdrop-blur-md sticky top-0`
This adds a "premium" texture without cluttering the UI with shadows.

## Risks / Trade-offs

*   **Information Hierarchy**: Removing bold text and shadows reduces the "pop" of elements. We must rely on font-size scaling and whitespace to guide the user's eye.
*   **Visual Dryness**: Sharp edges and no shadows can look "flat" if not executed with perfect spacing. We will increase global padding in cards to compensate.
