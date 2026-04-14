## Why

Users are experiencing a "perpetual loading" screen when attempting to switch the application language on the profile page. This critical bug prevents users from utilizing the new translation capabilities and results in a broken user experience where the application becomes unresponsive.

## What Changes

- **Refactor Navigation Logic**: Update the `ProfilePage.tsx` to use more robust navigation patterns that ensure Next.js 15 correctly handles the locale transition and triggers a clean re-render.
- **Loading State Synchronization**: Improve the `AuthProvider` and `ProfilePage` coordination to ensure the `authLoading` state is correctly resolved during and after locale-prefixed route changes.
- **Conflict Resolution**: Address UI conflicts (e.g., fixed overlays and toast notifications) that occur during the language swap to prevent browser-level scroll or transition locks.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `capabilities/localization`: Fixing the reliability and execution of the language switching mechanism to ensure robustness across all supported locales.

## Impact

- `apps/web/app/[locale]/profile/page.tsx`: Primary UI logic for language switching.
- `apps/web/context/AuthContext.tsx`: Authentication and initial loading state management.
- `apps/web/components/Loading.tsx`: Display of the full-screen loading overlay.
