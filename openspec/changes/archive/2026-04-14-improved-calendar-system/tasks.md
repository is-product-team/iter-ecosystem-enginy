# Tasks: Improved Calendar System

## Phase 1: Backend Infrastructure
- [x] Implement `sync_token` in `User` model and migration.
- [x] Create `GET /api/calendar/sync/:token.ics` endpoint (Manual ICS implementation).
- [x] Update `GET /api/calendar` to strictly respect `start` and `end` query params.
- [x] Integrate background "Reminder Check" using setInterval in `apps/api/src/index.ts`.

## Phase 2: Frontend Unification
- [x] Consolidate `Calendar.tsx` and `ui/Calendar.tsx` into a single `UnifiedCalendar`.
- [x] Implement range-based fetching in `apps/web/app/calendar/page.tsx`.
- [x] Improve event bar rendering logic for better visual clarity.

## Phase 3: Notifications & Reminders
- [x] Create logic in `NotificationService` to find upcoming sessions for users.
- [x] Implement internal notification triggers for "Day of" and "1 hour before" events.
- [ ] (Optional) Add email notification support via basic SMTP.

## Phase 4: User Profile Integration
- [x] Add "Calendar Sync" section in `/perfil` showing the private ICS URL.
- [x] Add "Notification Preferences" toggles in `/perfil`.

## Phase 5: Verification
- [ ] Verify ICS file validity using external validators.
- [ ] Test notification triggers with simulated system clock.
- [ ] Manual UI verification across different screen sizes.
