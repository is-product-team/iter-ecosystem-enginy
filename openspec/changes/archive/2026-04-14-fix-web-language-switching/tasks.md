## 1. AuthContext Readiness

- [x] 1.1 Verify `AuthContext.tsx` loading state initialization. Ensure it resolutions correctly on layout re-mounts.
- [x] 1.2 Add defensive logic to `AuthProvider` to prevent "stuck" loading states if `setLoading(false)` is not reached.

## 2. Profile Page Refactor

- [x] 2.1 Remove `toast.loading` from `changeLanguage` function to eliminate UI blocking conflicts.
- [x] 2.2 Refactor `changeLanguage` to use a cleaner navigation approach (e.g., ensuring `router.push` is used correctly or falling back to a hard refresh if necessary).
- [x] 2.3 Optimize the loading state conditional in `ProfilePage.tsx` to handle transitions more gracefully.

## 3. Global Improvements & Verification

- [x] 3.1 Check other authenticated routes for similar potential loading locks during locale switching.
- [x] 3.2 Update `request.ts` to `await locale` Promise (mandatory for Next.js 15) and verify server-side logging.
- [x] 3.3 Validate the fix with a manual walkthrough of changing languages and using "System Default" reset.
