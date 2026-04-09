# Design: Calendar UX and Sync Enhancements

## Context

The current calendar system uses a `syncToken` in the `User` model to provide an iCal feed. However, this is exposed only as a raw string in the Profile page, creating a high barrier to entry for users. On the mobile side, the calendar fetches all data without range filtering, leading to performance degradation.

## Goals / Non-Goals

**Goals:**
- Centralize synchronization settings in the Calendar page.
- Implement a "One-Click" sync experience for Google and Apple calendars.
- Optimize mobile calendar performance through range-based fetching.
- Improve notification reliability by refining the background checker.

**Non-Goals:**
- Two-way synchronization (writing to Google/Apple calendars).
- Full transition to a task queue (like BullMQ) – we will first optimize the current `setInterval` logic to keep it lightweight.

## Decisions

### 1. Sync Modal and URI Schemes
We will implement a `SyncCalendarModal` in `apps/web/components/calendar/`.
- **Google Calendar**: Use the subscription URL: `https://www.google.com/calendar/render?cid=[ENCODED_WEBCAL_URL]`
- **Apple/Outlook**: Use the `webcal://` protocol: `webcal://[API_DOMAIN]/calendar/sync/[TOKEN].ics`
- **Copy Link**: Provide a standard `https://` link for manual entry.

### 2. Range-Based API for Mobile
Currently, the mobile app calls `getCalendar()` without parameters.
- **Update**: `apps/mobile/services/api.ts` will be updated to accept `start` and `end`.
- **Logic**: `apps/mobile/components/CalendarView.tsx` will calculate the current month range (similar to the web version) and trigger a re-fetch on swipe/month change.

### 3. Notification Robustness
The current `setInterval` in `apps/api/src/index.ts` will be refined:
- **Locking mechanism**: If multiple API instances are running, ensure only one triggers notifications (using a simple database timestamp-based check).
- **Graceful Error Handling**: Ensure one failed notification doesn't crash the checker loop.

### 4. Direct Navigation on Mobile
Extend `CalendarEvent` interaction in `apps/mobile/app/(professor)/(tabs)/calendar.tsx` to use the `router` to navigate to `/assignment/[id]`.

## Risks / Trade-offs

- **URL Construction**: We must ensure `PUBLIC_API_URL` is correctly configured in both environments (Web and Mobile) to generate valid Sync URLs.
- **Background Worker**: `setInterval` is not ideal for large-scale production, but for the current size of Iter, a refined version is more cost-effective than adding a Redis/BullMQ dependency.

## Data Flow (Sync)

```
┌──────────────┐      ┌──────────────┐      ┌─────────────────────────┐
│              │      │              │      │                         │
│   Web UI     │─────▶│  Sync Modal  │─────▶│  Google/Apple Redirect  │
│ (Calendar)   │      │              │      │                         │
└──────────────┘      └──────────────┘      └────────────┬────────────┘
                                                         │
                                                         ▼
                                              ┌────────────────────┐
                                              │                    │
                                              │  External Calendar │
                                              │  Polls .ics Feed   │
                                              │                    │
                                              └────────────────────┘
```
