# Tasks: Notification Sync & Email Notifications

- [/] Phase 1: Setup & Data Model
    - [x] Create OpenSpec artifacts (proposal, design, tasks)
    - [ ] Add `emailNotificationsEnabled` to `User` model in `schema.prisma`
    - [ ] Run `npm run db:generate`
    - [ ] Create migration/push: `npx prisma db push`

- [ ] Phase 2: Mail Service
    - [ ] Install `nodemailer` in `apps/api`
    - [ ] Implement `apps/api/src/services/mail.service.ts`
    - [ ] Add SMTP configuration to `.env.example`

- [ ] Phase 3: Backend Logic
    - [ ] Update `createNotificationInternal` in `notification.controller.ts`
    - [ ] Add `getNotificationsICS` in `notification.controller.ts`
    - [ ] Register new route `GET /notifications/ics/:token`

- [ ] Phase 4: Frontend Implementation
    - [ ] Add toggle in `apps/web/app/[locale]/profile/page.tsx`
    - [ ] Update `apps/web/components/calendar/SyncCalendarModal.tsx`
    - [ ] Add translations in `ca.json` and `en.json`

- [ ] Phase 5: Verification & Cleanup
    - [ ] Manual test: Verify email is triggered on new notification
    - [ ] Manual test: Verify ICS feed in Google Calendar
    - [ ] Cleanup temporary files
