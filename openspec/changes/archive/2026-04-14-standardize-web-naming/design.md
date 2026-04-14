## Context

The backend has transitioned to an English-first naming convention using Prisma `@map` to decouple the database schema from the application types. `apps/web` currently uses manual TypeScript interfaces in `lib/auth.ts` and `services/` that still use Catalan identifiers.

## Goals / Non-Goals

**Goals:**
- Eliminate all legacy Catalan identifiers in `apps/web`.
- Ensure strict type alignment between the API and the web application.
- Maintain existing UI appearance while swapping undercover data properties.

**Non-Goals:**
- Do not change visual labels in the UI (keep them in Catalan as per user requirements).
- Do not refactor the `mobile` workspace (out of scope for this specific change).

## Decisions

- **Centralized Authentication Types**: Refactor `User` and `Role` interfaces in `lib/auth.ts` to use `fullName`, `name`, and `centerCode`.
- **Service Layer Harmonization**: All methods in `services/assignmentService.ts`, `workshopService.ts`, etc., must return and accept English-first objects.
- **Component Prop Passing**: Ensure that data passed to `Navbar`, `Sidebar`, and table components uses the new identifiers.

## Data Flow Diagram

```
[ Backend (Prisma) ] --(English Properties)--> [ API (JSON) ] --(Fetch)--> [ Web (lib/auth) ] --(English Types)--> [ UI Components ]
      |                                                                             |
      +-- @map("nom_complet")                                                       +-- user.fullName
```

## Risks / Trade-offs

- **Runtime Breakage**: If a component is missed, it will display `undefined` or crash.
- **Cache Invalidation**: Users might have legacy Catalan objects in `localStorage`.
  - *Mitigation*: Implement a version check or clear `localStorage.user` on first load after deployment.
