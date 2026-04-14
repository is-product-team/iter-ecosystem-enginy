## 1. Setup Mobile UI System

- [x] 1.1 Create `apps/mobile/components/ui/` directory
- [x] 1.2 Implement `Button` component with standard rounded geometries (rounded-xl) and sentence case typography
- [x] 1.3 Implement `TextInput` and `FormGroup` components mimicking the iOS Inset Grouped style (rounded-2xl containers with thin inner borders)

## 2. Refactor Authentication Flow

- [x] 2.1 Refactor `apps/mobile/app/login.tsx` to replace hardcoded brutalist styles with the new `Button` and `FormGroup` components
- [x] 2.2 Adjust the layout wrapping in `login.tsx` to utilize iOS-style typography (Sentence case, `font-semibold`) and softer aesthetics
- [x] 2.3 Remove the hard red geometric blocks (`w-16 h-2 bg-pink-red`) from the login header

## 3. Standardize Layouts

- [x] 3.1 Update `apps/mobile/app/_layout.tsx` (or default layout components) if any global structural wrappers contain sharp edges or hard borders
- [x] 3.2 Ensure `pink-red` accent color applies appropriately to actionable items without introducing heavy blocking
