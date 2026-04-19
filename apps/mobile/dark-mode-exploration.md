# Exploration: Mobile Dark Mode Implementation

## Goal
Implement a comprehensive Dark Mode in the mobile application for teachers, ensuring full parity with the web application's dark color palette and aesthetic.

## Findings

### 1. Theme Source of Truth
The `shared/theme.ts` file correctly defines the semantic tokens for both light and dark modes:
- **Light:** Page: `#F7F8F9`, Surface: `#FFFFFF`, Subtle: `#F3F4F6`
- **Dark:** Page: `#171717`, Surface: `#212121`, Subtle: `#2F2F2F`

### 2. Implementation Gap
- **Web:** Uses CSS variables mapped to these hex values and `darkMode: 'class'`.
- **Mobile:** 
    - `global.css` has some variables but they aren't fully utilized.
    - `tailwind.config.js` uses hardcoded hex values for `background`, `text`, and `border`.
    - Components use a mix of NativeWind classes and inline `style` objects with hardcoded colors.

### 3. Critical Components for Refactoring
| Component | Status | Required Change |
|-----------|--------|-----------------|
| `tailwind.config.js` | Hardcoded | Switch to `var(--...)` for semantic tokens. |
| `global.css` | Incomplete | Sync all CSS variables from web/shared theme. |
| `DashboardScreen` | Partial | Replace `text-black`, `text-gray-500` with semantic tokens. |
| `SessionCarousel` | Hardcoded | Convert inline styles to Tailwind classes; adjust badge opacities. |
| `WorkshopDetailModal` | Partial | Replace hardcoded gray classes with semantic tokens. |
| `QuickAccessGrid` | Good | Already uses some semantic tokens; verify icon background opacities. |
| `AppLayout` | Needs Check | Ensure the root view handles the `.dark` class correctly. |

## Strategy
1. **Foundation:** Update `tailwind.config.js` and `global.css` in `apps/mobile` to mirror the web's semantic token system.
2. **Global Styles:** Inject the full dark palette into `global.css`.
3. **Component Migration:** systematically replace inline styles and hardcoded color classes with semantic tokens (`bg-background-page`, `text-text-primary`, etc.).
4. **Special Cases:** Update `ActivityIndicator` and `Ionicons` to use colors derived from the theme via hooks or conditional logic.

## Diagram: Style Flow
```
┌─────────────────────────────────────────────────────────┐
│              MOBILE DARK MODE ARCHITECTURE              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   shared/theme.ts  ◄── Source of Truth (PRIMITIVES)     │
│          │                                              │
│          ▼                                              │
│   ┌──────────────┐       ┌────────────────────────┐     │
│   │  Web Config  │       │     Mobile Config      │     │
│   │ (Tailwind)   │       │ (Tailwind + NativeWind)│     │
│   └──────┬───────┘       └───────────┬────────────┘     │
│          │                           │                  │
│          ▼                           ▼                  │
│   ┌──────────────┐       ┌────────────────────────┐     │
│   │ globals.css  │       │       global.css       │     │
│   │ (--bg-page)  │       │      (--bg-page)       │     │
│   └──────────────┘       └────────────────────────┘     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```
