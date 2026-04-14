## Context

The platform previously used a mix of basic Tailwind spinners and custom SVG logic for loading states. A new `Loading` component was developed to provide an "Apple-style" tick-based spinner with glassmorphism (backdrop blur) support. While the component is ready, many sub-components and pages still use legacy manual spinners, leading to visual inconsistency and occasional layout bugs.

## Goals / Non-Goals

**Goals:**
- Replace all manual `animate-spin` instances in the `web` application with the `<Loading />` component.
- Ensure that the `mini` and `sm` sizes are appropriately utilized in small UI areas (buttons, modal headers).
- Maintain 100% design consistency across all roles (Admin, Coordinator, Teacher, Student).

**Non-Goals:**
- We are not introducing new loading states where none exists today.
- We are not changing the core logic of data fetching, only the presentation layer of the loader.

## Decisions

- **Unified Component**: The `<Loading />` component from `@/components/Loading` will be the ONLY source of truth for spinners.
- **Size Mapping**: 
  - Inline page loaders -> `size="md"`
  - Header/Sidebar loaders -> `size="sm"`
  - Button/Checklist items -> `size="mini"`
- **Transition Animation**: All replacements will use the component's built-in `animate-in fade-in` for consistency.

## Risks / Trade-offs

- **Z-Index Conflicts**: The `fullScreen` mode uses `z-[9999]`. We must ensure it doesn't block notifications (Toast) or higher-level modals if they exist.
- **Layout Shifts**: Replacing `animate-spin` divs with the `Loading` component might cause minor layout shifts if the original div had custom absolute positioning or margins. Each replacement will be manually verified.
