# Proposal: Improved Calendar System

## Goal
Transform the current basic calendar into a premium, interactive, and highly functional scheduling hub for Iter. This includes unifying components, improving performance, adding a notification system for event reminders, and enabling synchronization with external calendars (Google/Apple).

## Problem Statement
*   **Split Components**: Redundant calendar components (`Calendar.tsx` vs `ui/Calendar.tsx`) cause confusion and inconsistent UI.
*   **Static/Reactive Only**: Users are not notified of upcoming events (sessions or milestones) automatically.
*   **Isolated Data**: Calendar events only exist within the app, forcing users to check the web/mobile app manually instead of having them in their primary calendar (Google/Apple).
*   **Performance**: Large data sets are fetched at once, which will degrade as the program grows.

## Requirements
1.  **Unified Component**: A single, high-performance `UnifiedCalendar` component with Month/Week/Agenda views.
2.  **Scheduled Notifications**: Automate internal and external (Email/Push) notifications 1 hour before and on the day of an event.
3.  **External Sync**: Provide an iCal (.ics) feed URL for users to subscribe via Google/Apple Calendar.
4.  **Dynamic Fetching**: API support for date-range fetching to improve performance.
5.  **Profile Integration**: A dedicated "Sync & Notifications" section in the User Profile.

## Scope
*   **Frontend**: `apps/web` (Calendar page, Profile page).
*   **Backend**: `apps/api` (New sync endpoints, background worker initialization).
*   **Mobile**: Potential alignment of the `CalendarView` logic (out of primary scope but documented).

## Out of Scope
*   Two-way sync (writing from Google Calendar back to Iter).
*   SMS notifications (deferred to Phase 2).
