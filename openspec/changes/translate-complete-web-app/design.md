## Context

The web application uses `next-intl` for internationalization, but several key pages currently bypass this system with hardcoded English strings.

## Goals / Non-Goals

**Goals:**
- Transition all hardcoded UI strings to the `next-intl` system.
- Ensure consistent localization experience for all user roles.
- Establish a pattern for developers to follow for future localization needs.

**Non-Goals:**
- Modification of backend API error messages (kept as is for now).
- Localizing the mobile application (already handled separately or out of scope for this change).
- Adding new languages (only Catalan and Spanish are supported).

## Decisions

### 1. Centralized Translation Access
We will continue to use the `useTranslations` hook from `next-intl` in client components and `getMessages` in server components (if applicable). This maintains consistency with the current architectural pattern.

### 2. Namespace Organization
Translations will be organized into logical namespaces in the JSON files:
- `Admin`: Everything related to the administrator dashboard.
- `Center`: Everything related to the educational center coordinator dashboard.
- `Common`: Shared elements like "Save", "Cancel", "Loading", and generic error messages.

### 3. Localization Flow Diagram

```ascii
┌──────────────────┐      ┌──────────────────────────┐
│  Locale Context  │─────▶│ useTranslations('Admin') │
└──────────────────┘      └────────────┬─────────────┘
                                       │
                                       ▼
                         ┌──────────────────────────┐
                         │   ca.json / es.json      │
                         └──────────────────────────┘
                                       │
                                       ▼
                         ┌──────────────────────────┐
                         │   Translated UI string   │
                         └──────────────────────────┘
```

## Risks / Trade-offs

- **[Risk] Missing Keys**: Adding keys to the code without updating the JSON files will result in visible keys instead of text.
  - **Mitigation**: Perform a final audit using the check script created during exploration.
- **[Risk] Layout Breaks**: Translations might be longer than the original English strings.
  - **Mitigation**: Use flexible CSS (Flexbox/Grid) to ensure the UI scales correctly with different text lengths.
