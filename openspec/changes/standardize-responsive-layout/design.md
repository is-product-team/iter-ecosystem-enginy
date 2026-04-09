## Context

The current `DashboardLayout` provides a base responsive structure:
```tsx
<main className="flex-1 max-w-[1440px] mx-auto w-full py-8 md:py-16 flex flex-col items-start">
  <div className="w-full container-responsive">
    {children}
  </div>
</main>
```
However, individual pages like `ProfilePage` introduce a nested `max-w-4xl mx-auto`, which adds an unnecessary layer of horizontal padding and centering that breaks visual consistency with the header and other pages.

## Goals / Non-Goals

**Goals:**
- Eliminate `max-w-* mx-auto` patterns from top-level `page.tsx` components.
- Standardize on `w-full pb-20` as the standard page wrapper.
- Ensure all pages are responsive and consistent with `DashboardLayout`.

**Non-Goals:**
- Redesigning the `DashboardLayout` component itself.
- Removing `max-w-*` from internal card elements (e.g., a small modal or form).

## Decisions

### 1. Standardize on the `w-full pb-20` Base Class
We will refactor all pages that deviate from this base class to ensure vertical spacing and horizontal width are consistent.

### 2. Remove Width Restrictions from Profile and detail pages
Instead of `max-w-4xl`, these pages will use the full width, relying on the `grid` system to organize content when the space is abundant.

## Risks / Trade-offs

- **[Risk] Visual "stretching"** → Mitigation: Pages with little content (like Profile) will use a 2-column or 3-column grid to maintain a balanced look without artificially constraining the container.
