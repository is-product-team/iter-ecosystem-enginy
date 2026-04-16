# Tasks: Notification Centralization & Broadcast

## Backend
- [x] Create `apps/api/src/services/notification.service.ts`.
  - [x] Move logic from `createNotificationInternal` to the service.
  - [x] Implement `broadcast` logic to fetch all coordinators.
  - [x] Integrate with `i18n.ts`.
- [x] Refactor `apps/api/src/controllers/notification.controller.ts` to export functionality through the service.
- [x] Update `apps/api/src/routes/phase.routes.ts` to use `isBroadcast: true` when changing phases.
- [x] Refactor other services (`AutoAssignmentService`, `ReminderService`) to use the new `NotificationService`.

## Infra
- [x] Verify Docker logs to ensure no performance issues during large broadcasts.

## Testing
- [x] Create a unit test for `NotificationService.broadcast()`.
- [x] Verify that an admin phase change triggers emails to multiple coordinators.
