## Context

The coordinator dashboard (`/center/**`) is a critical part of the Iter platform. Currently, several pages (notably Assignments and Requests) and shared components (Pagination) contain hardcoded English strings and reference missing translation keys in the `es.json` and `ca.json` files. This design aims to enforce a strict i18n-first approach by synchronizing localization files and refactoring the affected React components.

## Goals / Non-Goals

**Goals:**
- **Zero Hardcoding**: Ensure 100% of user-facing text in the coordinator view is pulled from `next-intl`.
- **JSON Synchronization**: Align `en.json`, `es.json`, `ca.json`, and `ar.json` for all keys used in the coordinator management flow.
- **Generic Pagination**: Refactor the `Pagination` component to be fully localized using the `Common` namespace.
- **Standardized Formatting**: Use translation parameters for dynamic values like durations and places.

**Non-Goals:**
- **UI Redesign**: This change focuses on content localization, not visual layout changes.
- **New Features**: No new functional capabilities will be added to the dashboard.
- **Backend Changes**: The API already provides raw data; localization is strictly a frontend concern.

## Decisions

### 1. Centralized "Common" Namespace
Common UI utilities and generic labels will be moved to or updated in the `Common` namespace. This prevents duplication between `Admin` and `Center` views.
- **Rationale**: Reduces maintenance overhead and ensures consistent labeling (e.g., "Previous" is always the same word everywhere).
- **Affected Keys**: `duration_label`, `places_label`, `previous`, `next`, `page`, `of`, `showing`.

### 2. Component Refactoring Pattern
All components currently using hardcoded strings will be updated to use the `useTranslations` hook.
- **Pattern**:
  ```tsx
  const t = useTranslations('Common');
  // ...
  <button>{t('next')}</button>
  ```
- **Rationale**: Standardizes the codebase on `next-intl`'s recommended approach.

### 3. Localized Formatting
Instead of `${hours}h`, we will use `t('duration_label', { hours })`.
- **Rationale**: Different languages may have different spacing or notation for units (e.g., "12 h" vs "12h").

### 4. Translation Flow Diagram
```
┌──────────────────────────┐      ┌──────────────────────────┐
│   JSON Locale Files      │      │    Next.js Middleware    │
│ (messages/*.json)        │ ───▶ │  (locale detection)      │
└──────────────────────────┘      └────────────┬─────────────┘
             ▲                                 │
             │                                 ▼
┌────────────┴─────────────┐      ┌──────────────────────────┐
│    useTranslations Hook  │ ◀─── │   next-intl Provider     │
│  (in React components)   │      │  (context propagation)   │
└────────────┬─────────────┘      └──────────────────────────┘
             │
             ▼
┌──────────────────────────┐
│    Localized UI          │
│ (Coordinator Dashboard)  │
└──────────────────────────┘
```

## Risks / Trade-offs

- **[Risk] Missing Keys** → Any key added to `en.json` but forgotten in `es.json` will fallback to the default language.
  - **Mitigation**: Perform a cross-file audit after all keys are defined.
- **[Risk] Parameter Mismatch** → If the JSON uses `{count}` but the code passes `{n}`, the translation will fail to interpolate.
  - **Mitigation**: Use consistent naming for parameters (`count`, `hours`, `name`) across all files.
- **[Risk] Breakage in Admin View** → Since we are modifying `Common` keys, the Admin view might be affected.
  - **Mitigation**: Verify the Admin dashboard after refactoring `Common` keys.
