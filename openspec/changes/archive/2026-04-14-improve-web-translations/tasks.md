## 1. i18n Core Configuration

- [x] 1.1 Create `apps/web/i18n/routing.ts` to centralize locales (`ca`, `es`, `en`) and navigation utilities.
- [x] 1.2 Update `apps/web/middleware.ts` to use the new routing configuration and remove hardcoded locales.
- [x] 1.3 Update `apps/web/app/[locale]/layout.tsx` to use shared routing and remove hardcoded validation.

## 2. English Localization

- [x] 2.1 Create `apps/web/messages/en.json` with a full set of translations based on `es.json`.
- [ ] 2.2 Verify that all standard UI elements have valid English translations.

## 3. Enhanced Profile Settings

- [x] 3.1 Refactor `apps/web/app/[locale]/profile/page.tsx` to use the specialized `useRouter` and `usePathname` hooks from `@/i18n/routing`.
- [x] 3.2 Add "English" and "System Default" options to the language selection menu.
- [x] 3.3 Implement the "System Default" logic to clear the `NEXT_LOCALE` cookie and redirect the user.

## 4. Final Verification

- [x] 4.1 Manually verify switching between all three languages from the Profile page.
- [x] 4.2 Verify that "System Default" correctly follows the browser's language after clearing preferences.
- [x] 4.3 Run `npm run verify` to ensure no regressions in linting or tests.
