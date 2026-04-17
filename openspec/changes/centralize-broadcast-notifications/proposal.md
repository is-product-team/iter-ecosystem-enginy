# Proposal: Centralize and Broadcast Notifications

## Goal
Centralize the notification logic into a robust backend service to handle both database persistence and multi-channel delivery (Email, and eventually Push), ensuring that global events like program phase changes are correctly broadcast to all relevant users.

## Context
Currently, notification logic is scattered across controllers and services. While we have recently implemented a translation utility and deduplication, the system fails to send emails for "Global" notifications (like phase changes) because the delivery logic expects a specific `userId` or `centerId`.

## Proposed Change
- Create a `NotificationService` to encapsulate all notification logic.
- Implement a "Broadcast" capability to send notifications to all users with specific roles (e.g., all coordinators).
- Decouple the notification trigger from the delivery logic.

## Impact
- **Backend**: New service in `apps/api/src/services/notification.service.ts`. Refactoring existing calls to use this service.
- **Database**: No schema changes required (already supports center/user/system notifications).
- **Quality**: Reliable email delivery for 100% of system alerts.

## Specifications
Relates to:
- [Localization Capability](file:///Users/kore/Documents/Code/Projects/iter-ecosystem-enginy/openspec/specs/capabilities/localization.md) (for backend i18n support).
