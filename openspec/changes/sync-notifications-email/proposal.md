# Proposal: Notification Sync & Email Notifications

## Goal
Provide coordinators and admins with multiple ways to stay updated on system alerts (requests, phase changes, urgent issues) by synchronizing notifications with their external calendars and receiving copies via email.

## Background
Currently, notifications are only visible within the web application. Users (especially coordinators and admins) have requested a way to synchronize these "avisos" just like they do with the calendar, and to receive them in their email inbox to ensure they don't miss important updates when they are not logged in.

## Scope
1. **ICS Feed for Notifications**: Provide a dedicated iCal feed that represents notifications as events based on their creation date.
2. **Email Delivery**: Implement a background service to forward notifications to users' registered email addresses.
3. **User Preferences**: Allow users to toggle email notifications and potentially filter which types they receive.

## Out of Scope
- Real-time Push Notifications (Web Push).
- SMS notifications.
- Direct reply via email (emails will be "no-reply").
