# Design: Mobile Dark Mode Implementation

## Architecture
The mobile application will adopt the same CSS variable-driven theme system as the web application. 

### 1. Theme Variables (`global.css`)
We will expand `apps/mobile/global.css` to include the full set of semantic variables from `shared/theme.ts`.

```css
:root {
  --bg-page: #f7f8f9;
  --bg-surface: #ffffff;
  --bg-subtle: #f3f4f6;
  --text-primary: #111827;
  --text-secondary: #374151;
  --text-muted: #6b7280;
  --border-subtle: #e5e7eb;
}

.dark {
  --bg-page: #171717;
  --bg-surface: #212121;
  --bg-subtle: #2f2f2f;
  --text-primary: #ececec;
  --text-secondary: #b4b4b4;
  --text-muted: #676767;
  --border-subtle: #424242;
}
```

### 2. Tailwind Configuration (`tailwind.config.js`)
Update the configuration to use these variables instead of hardcoded hex values.

```javascript
colors: {
  background: {
    page: "var(--bg-page)",
    surface: "var(--bg-surface)",
    subtle: "var(--bg-subtle)",
  },
  text: {
    primary: "var(--text-primary)",
    secondary: "var(--text-secondary)",
    muted: "var(--text-muted)",
  },
  border: {
    subtle: "var(--border-subtle)",
  }
}
```

### 3. Component Refactoring Strategy
- **Replace Inline Styles:** Find and replace `style={{ backgroundColor: '#FFF' }}` with `className="bg-background-surface"`.
- **Dynamic Icons/Indicators:** Use the `useColorScheme` hook from `nativewind` to toggle colors for components that don't support Tailwind classes directly (e.g., `ActivityIndicator`, `Ionicons` when used via props).
- **Opacity Adjustments:** Use Tailwind's opacity modifiers (e.g., `bg-primary/10`) instead of hardcoded RGBA values when possible.

## Component Specific Changes

### SessionCarousel
- Replace fixed background `#FFFFFF` with `bg-background-surface`.
- Update dot colors to use semantic tokens or primary with adjusted opacity.

### CalendarView
- Ensure the grid cells use `dark:bg-white` and `dark:text-black` for selected states to maintain the Apple-like aesthetic while being readable.
- Replace `#F9F9F9` background in the events list with `bg-background-subtle`.

### WorkshopDetailModal
- Convert the bottom action bar and scroll view to use semantic background tokens.
- Update text colors to `text-text-primary` and `text-text-muted`.
