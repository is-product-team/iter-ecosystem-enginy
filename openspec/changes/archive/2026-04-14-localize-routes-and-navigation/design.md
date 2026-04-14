## Architecture

The localization strategy follows the established `next-intl` pattern. We will move remaining hardcoded strings into the JSON message files and consume them via the `useTranslations` hook in client components and `getTranslations` in server components.

### Navigation Flow

```
User selects Locale (CA/ES)
       │
       ▼
 Middleware injects locale into params
       │
       ▼
 DashboardLayout / Navbar / Breadcrumbs
       │
       ▼
 useTranslations('Navigation') ◄──── messages/[locale].json
```

## Data Management

We will organize the new keys under a `Navigation` and `Dashboard` namespace in the JSON files to maintain clean organization.

### Key Mapping Example

- `Home` -> `Navigation.home`
- `Workshop Management` -> `Admin.dashboard.sections.workshops.title`

## UI/UX

- No visual structure changes.
- Text will dynamically update based on the locale prefix in the URL (`/ca` or `/es`).
- Breadcrumbs will now correctly show "Inici" (CA) or "Inicio" (ES) instead of "Home".
