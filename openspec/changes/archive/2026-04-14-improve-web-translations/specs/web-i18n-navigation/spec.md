## ADDED Requirements

### Requirement: Centralized i18n Routing
The Web application SHALL use a centralized routing and navigation configuration based on `next-intl` best practices. This configuration MUST be the single source of truth for supported locales.

#### Scenario: Shared Navigation Utils
- **WHEN** a developer imports `Link`, `usePathname`, or `useRouter`
- **THEN** they SHOULD import them from the centralized `@/i18n/routing` util
- **AND** these utils MUST automatically append the current locale prefix to navigation paths

### Requirement: Consistent Locale detection
The system MUST ensure that once a locale is detected or selected, it remains consistent across page transitions unless explicitly changed.

#### Scenario: Automatic Prefixing
- **WHEN** user is on `/ca/profile` and clicks a link to `/dashboard`
- **THEN** the application redirects to `/ca/dashboard` automatically
