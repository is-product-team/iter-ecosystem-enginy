## 1. Localization Fixes

- [x] 1.1 Add `create_title` to `Forms` namespace in `apps/web/messages/es.json`
- [x] 1.2 Add `create_title` to `Forms` namespace in `apps/web/messages/en.json`
- [x] 1.3 Add `create_title` to `Forms` namespace in `apps/web/messages/ca.json`
- [x] 1.4 Add `create_title` to `Forms` namespace in `apps/web/messages/ar.json` and fix `edit_title` Arabic translation

## 2. Component Refactoring

- [x] 2.1 Remove duplicated technical details H3 header in `CreateWorkshopModal.tsx`
- [x] 2.2 Remove duplicated duration labels in `CreateWorkshopModal.tsx`
- [x] 2.3 Remove duplicated places labels in `CreateWorkshopModal.tsx`
- [x] 2.4 Remove duplicated icon labels in `CreateWorkshopModal.tsx`
- [x] 2.5 Remove duplicated schedule H3 header in `CreateWorkshopModal.tsx`
- [x] 2.6 Remove duplicated add slot H4 header in `CreateWorkshopModal.tsx`
- [x] 2.7 Remove duplicated configured days H4 header in `CreateWorkshopModal.tsx`

## 3. Verification

- [x] 3.1 Verify `CreateWorkshopModal` title resolves correctly in Spanish (es)
- [x] 3.2 Verify `CreateWorkshopModal` UI no longer has duplicated elements
- [x] 3.3 Run `npm run lint` in `apps/web` to ensure no linting regressions
