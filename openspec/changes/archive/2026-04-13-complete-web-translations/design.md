## Context

The Iter web application is built with Next.js 15 and uses `next-intl` for internationalization. While the infrastructure is in place, many components and pages still contain hardcoded strings. The translation files (`en.json`, `es.json`, etc.) are partially populated but not systematically utilized across the UI.

## Goals / Non-Goals

**Goals:**
- **100% i18n Coverage**: All user-facing text in `apps/web` must be internationalized.
- **Locale Consistency**: Ensure `en`, `es`, `ca`, and `ar` files are synchronized.
- **Improved Error UX**: Localize all toast notifications and API error messages.
- **Maintainability**: Organize translation keys into logical namespaces.

**Non-Goals:**
- Adding new languages beyond the current four (`ca`, `es`, `en`, `ar`).
- Changing the underlying i18n library (`next-intl`).
- Modifying backend API logic (only frontend handling of responses).

## Decisions

### 1. Namespace Strategy
We will strictly follow a namespaced approach in the JSON files to prevent key collisions and improve readability.
- `Common`: Shared UI elements (buttons like "Save", "Cancel", "Edit", labels like "Email", "Phone").
- `Navigation`: Links and headers in the `Navbar`.
- `<PageName>Page`: Strings specific to a single page (e.g., `CentersPage`, `WorkshopsPage`).
- `Auth`: Everything related to login and registration.

### 2. Localization of Toasts and Errors
Instead of:
```typescript
toast.error("Error connecting to server");
```
We will use:
```typescript
const t = useTranslations('Common');
// ...
toast.error(t('error_loading'));
```
For API errors, we will map status codes or error identifiers to translation keys.

### 3. Language Selector Refactoring
The `LanguageSelector` will be updated to use the `Navigation` namespace for its internal labels.

### 4. Data Flow for i18n
```
┌─────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│  Request (URL)  │─────▶│ Middleware (i18n)│─────▶│  Layout / Page   │
└─────────────────┘      └──────────────────┘      └──────────────────┘
                                   │                         │
                                   ▼                         ▼
                         ┌──────────────────┐      ┌──────────────────┐
                         │  locale detection│      │ useTranslations()│
                         └──────────────────┘      └──────────────────┘
                                   │                         │
                                   ▼                         ▼
                         ┌──────────────────┐      ┌──────────────────┐
                         │ messages/*.json  │◀─────┤  Rendered Text   │
                         └──────────────────┘      └──────────────────┘
```

## Risks / Trade-offs

- **[Risk] Missing Keys** → Mitigation: Use a fallback strategy in `request.ts` (already partially implemented) and perform a final audit.
- **[Trade-off] Increased Verbosity** → Moving strings to JSON files increases the amount of code needed to render simple text, but is necessary for internationalization.
- **[Risk] Dynamic Strings** → Mitigation: Use `next-intl`'s interpolation feature (e.g., `t('showing_of', {count: 10, total: 100})`) for strings with dynamic data.
