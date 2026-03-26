## Context

The project is migrating to `next-intl` for internationalization. Simultaneously, a major refactor has renamed all routes and domain objects from Catalan to English in the `dev` branch. The current state is a conflict between these two movements.

## Goals / Non-Goals

**Goals:**
- Unified `[locale]` based routing for all web pages.
- Standardized English route segments (e.g., `/center` instead of `/centro`).
- Functional middleware for locale detection and redirection.
- Synchronization with the latest features (AI validator) from `dev`.

**Non-Goals:**
- Translating the API response messages (out of scope for this change).
- Adding new languages beyond Catalan (ca) and Spanish (es).

## Decisions

### 1. Root-level Middleware
**Decision**: Use `next-intl/middleware` at `apps/web/middleware.ts`.
**Rationale**: This is the standard pattern for Next.js 15 App Router localization. It handles locale detection from cookies and headers automatically.

### 2. Segment-based Routing
**Decision**: Move all routes under `apps/web/app/[locale]/`.
**Rationale**: Allows for static and dynamic rendering with locale context available via params.

### 3. English vs Catalan foldernames
**Decision**: Use English folder names (e.g., `center`, `assignments`).
**Rationale**: Aligns with the overall project direction of an English-first codebase and avoids future renaming conflicts.

## Architecture Diagram

```mermaid
graph TD
    User((User)) --> MW[Middleware]
    MW -->|Redirect| LRoute[/[locale]/...]
    LRoute --> Layout[/[locale]/layout.tsx]
    Layout --> Page[/[locale]/center/page.tsx]
    Page --> I18n[i18n/request.ts]
    I18n --> Dicts[(messages/*.json)]
```

## Risks / Trade-offs

- **Broken Links**: Moving files will break external links or hardcoded internal strings. 
  - *Mitigation*: Perform a global search for route strings and update them.
- **Merge Conflict Re-occurrence**: If `dev` continues to change structure, we might conflict again.
  - *Mitigation*: Complete this synchronization quickly and merge back to `dev` as soon as possible.
