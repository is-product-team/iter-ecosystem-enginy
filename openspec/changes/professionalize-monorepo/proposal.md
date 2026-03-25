## Why

The current codebase, while functional, suffers from linguistic and structural inconsistencies that hinder scalability and professional maintainability. Mixed usage of Catalan and Spanish in user-facing notifications, combined with hardcoded domain status strings in UI components (like charts), creates a fragmented developer experience and risks silent failures if underlying database values change. Standardizing now ensures a robust "Single Source of Truth" and a unified user experience.

## What Changes

- **Centralized Constants**: Move all remaining hardcoded domain states (e.g., `'Pendent'`, `'PUBLISHED'`) to the root `@iter/shared` module.
- **Linguistic Standardization**: Align all notifications, error messages, and UI labels to a single language (Catalan) to match the existing front-end direction.
- **Architectural Cleanup**: Fix typos in background services (e.g., `ReminderService`) and remove redundant checks in API controllers.

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- `shared-consistency`: Centralizing domain logic and standardizing user-facing strings across all workspaces.

## Impact

- **Shared**: Updated `index.ts` with comprehensive status enums.
- **API**: Refactored `PeticioController`, `ReminderService`, and `TetrisService`.
- **Web**: Updated `ChartComponents` and various UI views to use shared constants.
