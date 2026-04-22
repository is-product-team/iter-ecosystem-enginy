## Context

The `apps/web` application currently uses raw `<button>` and `<Link>` tags with repeated Tailwind classes for UI actions. This design establishes a reusable `Button` component that encapsulates the project's "Minimalist Sharp" institutional style, centralizing the definition of brand colors, paddings, and interaction states.

## Goals / Non-Goals

**Goals:**
- Provide a single source of truth for all button styles in the web application.
- Ensure consistent spacing, font sizes, and hover behaviors.
- Simplify the implementation of complex layouts like full-width buttons or buttons with icons.

**Non-Goals:**
- Implementing a full Design System (e.g., Inputs, Modals) in this specific change.
- Creating a polymorphic component that automatically switches to `Link` based on `href` (deferred for simplicity and clarity per user feedback).
- Adding complex animations or scaling transformations.

## Decisions

### 1. Component Architecture
The component will reside in `apps/web/components/ui/Button.tsx` and export a functional component that extends `React.ButtonHTMLAttributes<HTMLButtonElement>`.

**Rationale**: This ensures the component is easily discoverable as a UI primitive and maintains standard HTML button behavior (type, disabled, form submission).

### 2. Style Mapping
Styles will be managed through a lookup object within the component to keep the JSX clean:

```tsx
const variants = {
  primary: "bg-consorci-darkBlue text-white hover:bg-consorci-lightBlue",
  outline: "bg-transparent border border-consorci-darkBlue text-consorci-darkBlue hover:border-consorci-lightBlue hover:text-consorci-lightBlue",
  link: "bg-transparent text-consorci-darkBlue underline hover:text-consorci-lightBlue"
};

const sizes = {
  sm: "px-4 py-2 text-[12px] font-medium tracking-wide",
  md: "px-6 py-3 text-[14px] font-medium",
  lg: "px-10 py-4 text-[16px] font-semibold"
};
```

**Rationale**: Centralizing classes in objects makes it trivial to update the design system project-wide without touching multiple files.

### 3. Interaction Density
The component SHALL use `inline-flex` as its default display property.

```
┌───────────────────────────────┐
│     [ Button Content ]        │  <- inline-flex (shrink to fit)
└───────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                      [ Button Content ]                      │ <- fullWidth
└──────────────────────────────────────────────────────────────┘
```

**Rationale**: Prevents buttons from unintentionally stretching to fill their containers on large dashboard views while still allowing for explicitly wide buttons when required.

## Risks / Trade-offs

- **[Risk]** → CSS collisions if `className` is used to override fundamental button properties.
- **[Mitigation]** → Use `clsx` or `tailwind-merge` (if available) to merge classes predictably, or clearly document that the Button component owns its core layout.

- **[Risk]** → Lack of polymorphism might make `Link` buttons slightly more verbose.
- **[Mitigation]** → Developers can wrap the `Button` with a `Link` or use `router.push` in `onClick`.
