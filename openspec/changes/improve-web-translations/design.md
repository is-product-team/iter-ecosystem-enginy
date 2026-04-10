## Context

The current internationalization (i18n) implementation in the `web` application relies on hardcoded checks and manual URL manipulation. This makes it difficult to add new languages (like English) or provide a "System Default" feature that resets user preferences.

## Goals / Non-Goals

**Goals:**
- Provide a robust, centralized i18n configuration.
- Implement English (`en`) support with a complete translation file.
- Add a "System Default" language option in the profile settings.
- Standardize language switching using `next-intl` recommended patterns.

**Non-Goals:**
- Automatic translation of database content (workshops, titles, etc.).
- Adding more languages beyond Catalan, Spanish, and English in this phase.

## Decisions

### 1. Centralized Routing Configuration
We will create `apps/web/i18n/routing.ts` to define the i18n routing parameters. This centralizes the supported locales and allows us to use `createNavigation` from `next-intl`.

```typescript
// apps/web/i18n/routing.ts
import {createNavigation} from 'next-intl/navigation';
import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['ca', 'es', 'en'],
  defaultLocale: 'es'
});

export const {Link, redirect, usePathname, useRouter} = createNavigation(routing);
```

### 2. Standardized Layout and Middleware
`middleware.ts` and `layout.tsx` will be refactored to use the `routing` object instead of hardcoded arrays. This ensures consistency as new languages are added.

### 3. System Default Implementation
A "System Default" setting will be added. When selected, the application will:
1.  Remove the `NEXT_LOCALE` cookie (which stores the user's manual choice).
2.  Redirect to the root path without a locale prefix, allowing the middleware to re-detect the browser's preferred language (`Accept-Language`).

### 4. English Translation Base
We will create `apps/web/messages/en.json` by translating the base `es.json`.

## Risks / Trade-offs

- **[Risk]** Broken Links → **[Mitigation]** The use of `createNavigation` ensures that `Link` components automatically include the current locale prefix, reducing manual path maintenance.
- **[Risk]** Cookie Storage Inconsistency → **[Mitigation]** We will explicitly clear the `NEXT_LOCALE` cookie when "System Default" is selected to ensure the middleware takes over.
