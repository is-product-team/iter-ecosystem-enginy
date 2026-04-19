## Why

The current incident system is fully implemented in the web application (for coordinators and admins) and the API, but the mobile application for professors only contains a placeholder. Professors need a way to report problems directly from the app to ensure rapid communication with the administration and center coordination.

## What Changes

- **Issue Service for Mobile**: Implementation of a service to interact with the existing `/issues` API endpoints.
- **Incident Creation Form**: A new screen for professors to report incidents with title, category, priority, and description.
- **Incident List**: Improvement of the "Support" screen to list the user's reported incidents.
- **Incident Chat**: Detail view for each incident allowing real-time communication with administrators.
- **Translations**: Extension of mobile locales (`ca.json`, `es.json`) to include incident-specific terms.

## Capabilities

### New Capabilities
- `mobile-issues`: Full management of incidents from the mobile application, including creation, listing, and communication.

### Modified Capabilities
- `mobile`: Addition of navigation links from the profile and integration of the new issue screens into the navigation stack.

## Impact

- **Mobile App**: New screens and services. Addition of `NativeWind` styled components for the form.
- **Localization**: Updates to `apps/mobile/locales`.
- **Navigation**: Modification of `apps/mobile/app/(professor)/_layout.tsx`.
