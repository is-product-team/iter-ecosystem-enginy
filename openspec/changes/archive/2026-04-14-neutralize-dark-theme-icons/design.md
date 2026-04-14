## Context

In `apps/web/app/globals.css`, the `consorci-darkBlue` is defined as `#00426b`. When this color is used for icons or text on a dark background (`#171717` or `#212121`), it suffers from very low contrast, creating a "dirty" look that deviates from the desired Apple-like minimalist aesthetic.

## Goals / Non-Goals

**Goals:**
- Transition all icons on dark backgrounds to use neutral colors (white/high-clarity gray) instead of the institutional blue.
- Reserve the institutional blue only for solid background containers where contrast with white content is high.

**Non-Goals:**
- Changing the institutional blue itself in light mode.
- Changing the dark theme background colors.

## Decisions

### 1. Neutral-First Icon Color Hierarchy
In dark mode, icons will default to `text-text-primary` (`#ececec`).
**Rationale**: White/light-gray on a dark background provides the cleanest, most premium "Apple-like" look and maximizes legibility.

### 2. Branding via Fill (Background)
We will use `bg-consorci-darkBlue` and `text-white` for active or hover states.
**Rationale**: Branding is preserved during interaction without compromising the resting-state aesthetic.

## Risks / Trade-offs

- **[Risk] Visual "blandness" at rest** → Mitigation: Use high-clarity gray (`#ececec`) to maintain a crisp look.
