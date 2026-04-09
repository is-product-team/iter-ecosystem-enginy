## Why

Exploration revealed many core UI elements (Navbar, Breadcrumbs, Dashboards) use hardcoded English strings. This breaks the internationalization intent of the platform. Additionally, there are spelling errors in the Catalan translation file ("Evaluació" instead of "Avaluació").

## What Changes

- Localize `apps/web/components/Navbar.tsx` and `Breadcrumbs.tsx`.
- Refactor all roles' dashboards to use `next-intl`.
- Fix spelling and add missing keys in `apps/web/messages/ca.json` and `es.json`.

## Capabilities

### New Capabilities
- `localized-navigation`: Ensures all navigation elements respect the selected locale.
- `translated-dashboards`: Provides a consistent localized experience across all user roles.

## Impact

- `apps/web`: High. Core components and all dashboard pages will be modified.
