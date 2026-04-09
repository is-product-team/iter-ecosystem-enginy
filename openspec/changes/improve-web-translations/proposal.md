## Why

The current translation system in the Web application is incomplete and fragile. While it supports Catalan and Spanish, English support is missing despite being part of the ecosystem's roadmap. Additionally, the manual URL-replacement logic for switching languages is error-prone, and there is no professional way to let the user revert to "System Default" (browser-detected) settings once a preference has been manually set.

## What Changes

- **Add English Support**: Enable the `en` locale across the entire Web application.
- **Unified Configuration**: Centralize the list of supported locales in a single configuration file to eliminate hardcoded checks in middleware and layouts.
- **Robust Navigation**: Transition from manual `pathname.replace` logic to `next-intl` navigation utilities (`usePathname`, `useRouter`) for safe and automatic locale handling.
- **System Default Settings**: Implement a "System Default" option in the user profile that clears any manual locale overrides (cookies) and allows browser-based detection to take over.
- **Translation Completeness**: Create and populate `messages/en.json` with a complete set of translations.

## Capabilities

### New Capabilities
- `web-i18n-navigation`: Implementation of shared navigation strategies using common next-intl patterns.

### Modified Capabilities
- `localization`: Updating the core localization requirement to include "System Default" detection management and centralized configuration.

## Impact

- **Web Application**: Updates to `middleware.ts`, root `[locale]/layout.tsx`, and the `ProfilePage`.
- **Performance**: Improved reliability of language switching with reduced risk of 404s.
- **Consistency**: Standardized internationalization patterns across the frontend.
