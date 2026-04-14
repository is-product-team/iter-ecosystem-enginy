## Context

The current implementation of language switching in the `ProfilePage` uses `next-intl` navigation hooks. In Next.js 15, switching between locale-prefixed routes (e.g., `/es/profile` to `/en/profile`) can trigger a full Layout re-mount. If the `AuthProvider` is part of that layout, it resets its `loading` state to `true`.

The issue arises when the transition is either interrupted or delayed by browser/React conflicts (like the `sonner` toast overlay or layout shifts), causing the `useEffect` that resolves the loading state in `AuthProvider` to not run or complete, leaving the user stuck behind a full-screen blurred `Loading` div.

## Goals / Non-Goals

**Goals:**
- Ensure language switching always completes and renders the new language.
- Eliminate the "perpetual loading" state.
- Improve the reliability of the i18n transition in Next.js 15.

**Non-Goals:**
- Refactoring the entire authentication system.
- Adding new locales beyond the currently supported ones.

## Decisions

### 1. Simplify Language Switching Navigation
- **Decision**: Remove the `toast.loading` and the client-side `router.replace` as the primary mechanism if it continues to be unstable. Use a standard `router.push` or `window.location.href` to ensure a clean page load when transitioning between disparate translation contexts.
- **Rationale**: `next-intl`'s `router.replace` is excellent for soft transitions, but when the entire locale context changes, a hard-ish refresh ensures that all server-side messages are correctly refetched and synced without hydration mismatches.

### 2. Transition State Management
- **Decision**: Remove the `toast.loading` overlay during the transition.
- **Rationale**: The full-screen `Loading` component already provides feedback if the state is loading. Adding a secondary `sonner` toast creates multiple `fixed` elements in the DOM which, as noted by browser warnings, can interfere with scroll and focus management during navigation.

### 3. Auth State Persistence during Locale Changes
- **Decision**: Verify that the `loading` state in `AuthContext` is correctly reconciled on mount.
- **Rationale**: Since `getAuthUser()` is synchronous (localStorage), the `loading` state should ideally start as `false` if a user is found, or transition extremely quickly.

## Risks / Trade-offs

- **[Risk]** Hard refresh (window.location.href) might feel less "Modern SPA".
- **[Mitigation]** Use `router.push` first but ensure the environment is stable for RSC payload delivery.

```mermaid
graph TD
    A[User clicks Language] --> B[Remove Toast Overlay]
    B --> C{Navigation Strategy}
    C -->|Soft| D[router.push /en/profile]
    C -->|Hard| E[window.location.href = '/en/profile']
    D --> F[LocaleLayout re-mounts]
    E --> F
    F --> G[AuthProvider initializes]
    G --> H[useEffect: setLoading(false)]
    H --> I[ProfilePage renders Content]
```
