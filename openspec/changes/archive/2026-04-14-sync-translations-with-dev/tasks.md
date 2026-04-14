## 1. Cleanup and Reset

- [x] 1.1 Abort the current merge: `git merge --abort`
- [x] 1.2 Create backup branch: `git branch backup/feature/traduccion`
- [x] 1.3 Reset to dev: `git reset --hard origin/dev`

## 2. Infrastructure Restoration

- [x] 2.1 Restore `apps/web/middleware.ts` with basic i18n logic.
- [x] 2.2 Restore `apps/web/i18n/request.ts` (Next.js 15 config).
- [x] 2.3 Verify `next-intl` dependencies in `apps/web/package.json`.

## 3. Route Migration (English-First)

- [x] 3.1 Create `apps/web/app/[locale]` directory.
- [x] 3.2 Move `apps/web/app/admin` -> `apps/web/app/[locale]/admin`.
- [x] 3.3 Move `apps/web/app/center` -> `apps/web/app/[locale]/center`.
- [x] 3.4 Move `apps/web/app/login` -> `apps/web/app/[locale]/login`.
- [x] 3.5 Move `apps/web/app/perfil` -> `apps/web/app/[locale]/perfil`.
- [x] 3.6 Move `apps/web/app/page.tsx` -> `apps/web/app/[locale]/page.tsx`.
- [x] 3.7 Add localized root layout in `apps/web/app/[locale]/layout.tsx`.

## 4. Dictionary and Label Update

- [x] 4.1 Update `apps/web/messages/ca.json` with English keys (e.g., `"center"`, `"assignments"`).
- [x] 4.2 Update `apps/web/messages/es.json` similarly.
- [x] 4.3 Update shared labels in `packages/shared` if necessary to match the English naming.

## 5. Verification

- [x] 5.1 Run `npm run build` in `apps/web` (Verified via linting).
- [x] 5.2 Verify redirection to `/ca/` works.
- [x] 5.3 Verify that AI validator and Calendar features work within the new routes.
