## Context

The current `CenterDashboard` and `AdminDashboard` components have navigation cards with decorative elements that the user finds "too much". Specifically, the `rotate-45` "pico" in the corner and the side-ribbon in the admin dashboard.

## Goals / Non-Goals

**Goals:**
- Remove all decorative absolute-positioned elements from dashboard cards.
- Remove any hover classes that increase border width.

**Non-Goals:**
- Removing the interactive hover behavior entirely (the border color change and content illumination should remain).

## Decisions

### 1. Simplify Card Structure
We will remove the `absolute` elements from the cards.
**Rationale**: Simplifies the DOM and achieves the requested "cleaner" look.

### 2. Standardize Borders
Ensure cards use a consistent `border` (1px) and avoid `border-2` on hover or active states.
**Rationale**: Keeps the layout stable during interaction.

## Risks / Trade-offs

- **[Risk] Visual "plainness"** → Mitigation: Already resolved by the previously implemented "neutral-first" icon pattern and high-contrast hovers.
