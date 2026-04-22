## 1. Core Component Implementation

- [x] 1.1 Create `apps/web/components/ui/Button.tsx` with base HTML button attributes.
- [x] 1.2 Implement `variants` object for primary, outline, and link styles using brand color tokens.
- [x] 1.3 Implement `sizes` object for sm, md, and lg font sizes and paddings.
- [x] 1.4 Implement `icon` (right-aligned) and `fullWidth` conditional styling.
- [x] 1.5 Add loading state with a spinner and disabled state logic.

## 2. Refactoring Dashboard Actions

- [x] 2.1 Refactor `apps/web/components/ConfirmDialog.tsx` to use the new Button component for cancel/confirm actions.
- [x] 2.2 Refactor `apps/web/app/[locale]/phases/page.tsx` replacing manual card buttons and header actions.
- [x] 2.3 Refactor `apps/web/app/[locale]/workshops/page.tsx` replacing the "New Workshop" and table action buttons.

## 3. Quality Assurance

- [x] 3.1 Verify Button interactive states (hover/active/focus) in light and dark modes.
- [x] 3.2 Verify `inline-flex` behavior on large screens across all refactored pages.
- [x] 3.3 Run `npm run lint` and `npm run type-check` in the `apps/web` package.
