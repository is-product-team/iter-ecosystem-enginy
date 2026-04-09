# Proposal: Calendar UX and Sync Enhancements

## Goal

Transform the current basic calendar into a premium, interactive hub by improving synchronization discoverability, optimizing mobile performance, and increasing notification reliability.

## Motivation

The current calendar system has several friction points:
1.  **Sync Discoverability**: The external calendar sync (iCal) is hidden in the User Profile as a cryptic "Sync Token", making it virtually unusable for non-technical users.
2.  **Mobile Performance**: The mobile app fetches full calendar datasets instead of date ranges, leading to slow load times and high data usage.
3.  **Notification Reliability**: The background reminder system uses a simple `setInterval`, which is fragile and not scalable.

## What Changes

1.  **Smarter Sync**: Move sync configuration to the Calendar page. Replace the "Token" string with one-click "Add to Google Calendar" and "Add to Apple Calendar" buttons.
2.  **Date-Range Fetching for Mobile**: Update the mobile API consumption to use `start` and `end` parameters, mirroring the web implementation.
3.  **Refined Navigation**: Enable direct navigation to workshop/session details from the mobile calendar.
4.  **Backend Robustness**: Transition from `setInterval` to a more stable solution (or refine the current check) to ensure reminders are never missed or duplicated.

## Capabilities

### New Capabilities
- `calendar-one-click-sync`: Intuitive UI components to subscribe to the iCal feed from Google and Apple Calendar.
- `calendar-mobile-optimization`: Range-based data fetching and interactive event navigation in the mobile app.

### Modified Capabilities
- `calendar-reminders`: Improved reliability and scheduling for session notifications.

## Impact

- **Frontend (Web)**: New sync modal/buttons in `CalendarPage`. Refactor `ProfilePage` to remove redundant sync logic.
- **Frontend (Mobile)**: Update `getCalendar` service and `CalendarTabScreen` to handle range changes.
- **Backend (API)**: Optimize `fetchEventsForUser` to handle mobile requests efficiently.
