## 1. Foundation & Services

- [x] 1.1 Create `apps/mobile/services/issueService.ts` with methods for listing, getting, creating, and messaging incidents.
- [x] 1.2 Update `apps/mobile/locales/ca.json` and `apps/mobile/locales/es.json` with the `Issues` translation block.

## 2. Navigation & Layout

- [x] 2.1 Register the new routes `issue/new` and `issue/[id]` in `apps/mobile/app/(professor)/_layout.tsx`.
- [x] 2.2 Re-route the "Support" link in `apps/mobile/app/(professor)/(tabs)/profile.tsx` to the `support` screen.

## 3. UI Implementation (Professor)

- [x] 3.1 Refactor `apps/mobile/app/(professor)/support.tsx` to fetch and list the user's incidents using `issueService`.
- [x] 3.2 Implement `apps/mobile/app/(professor)/issue/new.tsx` with a NativeWind styled creation form.
- [x] 3.3 Implement `apps/mobile/app/(professor)/issue/[id].tsx` with an interactive chat interface for incident communication.

## 4. Verification

- [x] 4.1 Run `npm run type-check` in the mobile app.
- [x] 4.2 Verify the end-to-end flow: Create incident -> View in list -> Send message -> View in admin.
