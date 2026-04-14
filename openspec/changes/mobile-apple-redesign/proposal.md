## Why

The current mobile app utilizes an "editorial" or "brutalistic" design (sharp corners, heavy uppercase text, stark shapes) which, while distinct, is not the standard interface approach for native iOS users. Transitioning to an Apple-style design (Human Interface Guidelines) with softer squircles, inset grouped elements, and typography-driven visual hierarchy will make the app feel much more premium and intuitive for users without losing the serious nature of the platform. By introducing reusable components similar to the user profile buttons, we will also improve development velocity and consistency across mobile screens.

## What Changes

- Redesign the global authentication (`login.tsx`) and core screens with an iOS-native aesthetic.
- Transition from stark rectangular inputs and shapes (`rounded-none`, heavy borders) to rounded components (`rounded-xl` / `rounded-2xl`).
- Update the typographic scale, adopting Sentence case instead of heavily tracked UPPERCASE headers to reduce visual noise.
- Implement reusable UI components (e.g., grouped form inputs, standardized buttons based on the user profile buttons) to ensure stylistic consistency.
- Retain the existing color palette (using the solid `pink-red` tint for actionable highlights) to preserve brand identity, but remove prominent rigid color blocks.

## Capabilities

### New Capabilities
- `mobile-design-system`: The foundational iOS-like UI component library (buttons, inputs, grouped lists) for the mobile app, providing reusable components that align with Human Interface Guidelines.

### Modified Capabilities
- `mobile`: Updates the visual requirements for the Expo structure to leverage the new Apple-style design system rather than the current brutalist styles.

## Impact

- **Mobile App (`apps/mobile/`):** Sweeping changes to `apps/mobile/app/login.tsx`, layout files, and potentially dashboard pages to adopt new reused components.
- **Shared Components:** Creation of a mobile-specific local design system or components directory within the mobile app.
- **No Backend Impact:** This is a strictly visual and component-architectural change on the React Native end. API contracts remain identical.
