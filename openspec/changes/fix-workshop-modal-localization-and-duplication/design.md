## Context

The web application uses `next-intl` for internationalization. UI components like `CreateWorkshopModal` rely on namespaces in JSON locale files (located in `apps/web/messages/`). A missing key in these files causes runtime warnings/errors and breaks the UI (showing fallback strings or throwing errors depending on configuration).

Currently, `CreateWorkshopModal` uses the `Forms` namespace but fails to resolve `Forms.create_title`.

## Goals / Non-Goals

**Goals:**
- Fix the missing translation error for `Forms.create_title`.
- Ensure all supported locales (es, en, ca, ar) have the required keys.
- Clean up `CreateWorkshopModal.tsx` by removing duplicated JSX code.

**Non-Goals:**
- Re-styling the modal (except for fixing the duplication).
- Adding new fields or functionality to the workshop creation process.
- Full audit of all other components for missing translations (outside of this specific reported error).

## Decisions

### 1. Add `create_title` to `Forms` namespace
Instead of creating a new `Workshops` sub-namespace within `Forms` (like `Centers`), we will add a generic `create_title` to the root of the `Forms` namespace. This is consistent with the existing generic `edit_title`.

| Locale | Key | Value |
|--------|-----|-------|
| es | `Forms.create_title` | "Crear" |
| en | `Forms.create_title` | "Create" |
| ca | `Forms.create_title` | "Crear" |
| ar | `Forms.create_title` | "إنشاء" |

### 2. Refactor `CreateWorkshopModal.tsx`
The component currently has several lines of code that are exactly duplicated. We will remove the redundant lines to improve readability and maintainability.

```
┌────────────────────────────────┐
│     CreateWorkshopModal.tsx    │
├────────────────────────────────┤
│ [Header]                       │
│   - Fix title resolution       │
├────────────────────────────────┤
│ [Content]                      │
│   - Remove duplicate H3s       │
│   - Remove duplicate Labels    │
│   - Remove duplicate H4s       │
└────────────────────────────────┘
```

## Risks / Trade-offs

- **[Risk]** Removing duplicated lines might accidentally remove unique logic.
- **[Mitigation]** Carefully review each duplication to ensure they are indeed identical and that removing one does not affect the layout or behavior (e.g., checking for subtle differences in classes or props).
- **[Risk]** `ar.json` contains Spanish strings.
- **[Mitigation]** While our main task is fixing the missing key, we will use the correct Arabic term for `create_title` ("إنشاء"). We won't perform a full translation of the file to avoid scope creep, but we will fix `edit_title` to "تعديل" (Ta'deel - Edit) if it's currently "Editar" to maintain internal consistency in that block.
