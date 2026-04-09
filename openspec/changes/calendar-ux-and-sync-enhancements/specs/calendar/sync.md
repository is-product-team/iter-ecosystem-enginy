# Capability Spec: Calendar Sync

## Overview
Enable users to intuitively synchronize their Iter calendar with external applications like Google Calendar, Apple Calendar, and Outlook.

## Requirements

### Requirement: Centralized Sync Configuration
The synchronization settings must be easily discoverable and accessible directly from the main Calendar page.

#### Scenario: Discovering Sync Options
- **WHEN** the user is on the Calendar page.
- **THEN** they should see a "Sync Calendar" button or icon prominently displayed.

### Requirement: One-Click Google Calendar Subscription
Users must be able to subscribe to their calendar in Google Calendar without manually copying and pasting URLs.

#### Scenario: Clicking Add to Google Calendar
- **WHEN** the user clicks the "Add to Google Calendar" button.
- **THEN** a new browser tab must open with the Google Calendar "Add by URL" interface, pre-filled with the user's private iCal feed URL.

### Requirement: iCal URI Scheme Support (webcal)
The system must support the `webcal://` protocol to allow one-click subscription in applications like Apple Calendar and Outlook.

#### Scenario: Clicking Add to Apple Calendar
- **WHEN** the user clicks the "Add to Apple/Outlook" button.
- **THEN** the browser should prompt to open the default calendar application using the `webcal://` link.

### Requirement: Private Feed Security
The iCal feed must be protected by a non-guessable token.

#### Scenario: Regenerating Token
- **WHEN** a user regenerates their sync token.
- **THEN** all previous subscription links using the old token must immediately stop working (404/403).
