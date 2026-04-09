## 1. Backend Refactor & Robustness

- [x] 1.1 Refine the `setInterval` logic in `apps/api/src/index.ts` with a simple execution lock (DB-based).
- [x] 1.2 add error handling to the notification loop to prevent process crashes.
- [x] 1.3 Verify that `syncToken` generation and ICS endpoint are correctly using the system's Base URL.

## 2. Web Frontend: Sync UI

- [x] 2.1 Create `SyncCalendarModal` component in `apps/web/components/calendar/`.
- [x] 2.2 Implement logic to construct Google Calendar subscription links.
- [x] 2.3 Implement logic to construct `webcal://` links for Apple/Outlook.
- [x] 2.4 Add "Sync" button to `apps/web/app/[locale]/calendar/page.tsx` that opens the modal.
- [x] 2.5 Remove redundant "App Synchronization" section from `apps/web/app/[locale]/profile/page.tsx`.

## 3. Mobile Frontend: Performance & Interaction

- [x] 3.1 Update `getCalendar` service in `apps/mobile/services/api.ts` to accept optional `start` and `end` parameters.
- [x] 3.2 Implement range calculation logic in `apps/mobile/app/(professor)/(tabs)/calendar.tsx` based on the currently viewed month.
- [x] 3.3 Add loading states (ActivityIndicator) while fetching data.
- [x] 3.4 Implement navigation to assignment details in `onEventClick`.

## 4. Verification & Polish

- [x] 4.1 Verify iCal feed validity with an external validator (e.g., iCalDev).
- [x] 4.2 Manual testing of "Add to Google Calendar" button.
- [x] 4.3 Smoke test mobile calendar scrolling and interaction.
