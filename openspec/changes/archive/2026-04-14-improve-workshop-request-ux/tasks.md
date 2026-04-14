# Tasks: Workshop Request UX Improvements

## Infrastructure & Localization
- [ ] Add translations to `apps/web/messages/es.json`
- [ ] Add translations to `apps/web/messages/ca.json`
    - Labels: `duration`, `max_students`, `description`, `workshop_details`

## Layout & Table Fixes
- [ ] Correct table header and cell count mismatch in `page.tsx`
- [ ] Modify table structure to support conditional row expansion
- [ ] Add `durationHours` and `maxPlaces` display to the workshop list item

## Form Migration
- [ ] Remove sidebar container and its `lg:flex-row` layout wrapper
- [ ] Move form logic and JSX into an `ExpandedRow` sub-component or conditional block within the table mapping
- [ ] Ensure `selectedWorkshopId` correctly toggles expansion state

## Style Refinement (Theming)
- [ ] Audit `page.tsx` for hardcoded Tailwind colors
- [ ] Replace hardcoded colors with semantic CSS tokens (`text-text-primary`, `bg-background-surface`, etc.)
- [ ] Verify button and status badge contrasts in dark mode

## Verification
- [ ] Test layout responsiveness on various screen sizes
- [ ] Validate form validation and submission flow
- [ ] Check light/dark theme transition consistency
