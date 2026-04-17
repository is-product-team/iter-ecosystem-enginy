# Design: Notification Centralization & Broadcast

## Architecture Overview

We will introduce a centralized `NotificationService` that handles the logic of determining recipients and formatting messages before delivery.

```
┌──────────────────┐      ┌─────────────────────────┐      ┌──────────────┐
│  Any Controller  │─────▶│   NotificationService   │─────▶│  Prisma DB   │
│  or Service      │      └────────────┬────────────┘      └──────────────┘
└──────────────────┘                   │
                                       ▼
                          ┌─────────────────────────┐      ┌──────────────┐
                          │    Delivery Manager     │─────▶│  MailService │
                          │ (Locality & Role logic) │      └──────────────┘
                          └─────────────────────────┘
```

## Data Flow

1.  **Trigger**: An event occurs (e.g., Phase Change).
2.  **Notification Creation**: Call `NotificationService.notify()`.
3.  **Broadcasting**:
    - If `centerId` provided: Fetch all coordinators of that center.
    - If `userId` provided: Target specific user.
    - If **Broadcast** flag provided (or no target): Fetch ALL coordinators/admins across the system.
4.  **Translation**: Apply `i18n` to titles and messages.
5.  **Delivery**: Iterate through recipients and call `MailService`.

## Component: NotificationService

```typescript
class NotificationService {
  static async notify(data: {
    title: string;
    message: string;
    type: string;
    centerId?: number;
    userId?: number;
    isBroadcast?: boolean; // New!
    roles?: Role[]; // Target specific roles in broadcast
  }) {
    // 1. Persist to DB
    // 2. Identify Recipient List
    // 3. Translate & Send Emails
  }
}
```

## Scalability Considerations

For large broadcasts, we should consider moving the actual email sending to a background worker (e.g., using a queue) to avoid blocking the main request cycle. For now, we will use a loop with manual error handling.
