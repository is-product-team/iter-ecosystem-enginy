## Context

The use of `h-4.5` and `w-4.5` classes without proper configuration in `tailwind.config.ts` causes SVGs to lack size constraints, leading to unpredictable and often "giant" rendering in various browsers and environments.

## Goals / Non-Goals

**Goals:**
- Fix the specific issue of the "giant magnifying glass" in the workshop management page.
- Clean up all instances of unsupported size classes (`h-4.5`, `w-4.5`) in the web app.

## Decisions

### 1. Migrate to Standard Tailwind Sizes
We will replace `4.5` (1.125rem) with `5` (1.25rem) for main search icons and `4` (1rem) for smaller inline icons.
**Rationale**: `h-5` is the standard for icons within inputs in this design system, providing good visibility and touch targets.

## Risks / Trade-offs

- **[Risk] Slight visual shift** → Mitigation: The difference between 18px (`4.5`) and 20px (`5`) is minimal and will improve consistency.
