# Specification: Shared Types & Utilities

This document describes the shared logic, validation schemas, and design tokens located in `packages/shared`, which are used across the Web, API, and Mobile applications.

## 1. Domain Constants

Centralized definitions to ensure consistency between the database and the UI.

- **`ROLES`**: `ADMIN`, `COORDINADOR`, `PROFESSOR`.
- **`REQUEST_STATUSES`**: `Pending`, `Approved`, `Rejected`.
- **`PHASES`**: Official names for the program stages (Solicitud, Planificación, Ejecución, Cierre).
- **`CALENDARI`**: Key dates for the academic year 25-26.

## 2. Validation Schemas (Zod)

The system uses Zod to validate data at the boundaries (API requests, form submissions).

| Schema | Purpose |
| :--- | :--- |
| `WorkshopSchema` | Validates workshop creation and updates. |
| `StudentSchema` | Ensures student data integrity. |
| `RequestSchema` | Validates center's workshop requests. |
| `CenterAttendanceSchema` | Validates attendance logs from the mobile app. |

## 3. Design System (Theme)

The visual identity is defined using a three-tier token system:

1. **`PRIMITIVES`**: Raw color values (e.g., `primary`, `secondary`, `accent`).
2. **`SEMANTICS`**: Contextual tokens for `light` and `dark` modes (e.g., `background.page`, `text.primary`).
3. **`THEME`**: A legacy-compatible object for simpler color access.

**Typography**: Primary font is **Inter, sans-serif**.

## 4. Derived Types

TypeScript types are inferred from Zod schemas and Prisma client to provide end-to-end type safety:
- `WorkshopInput`, `StudentInput`, `RequestInput`, etc.
- Seamless re-export of `@prisma/client` types.

## 5. Shared Utilities

- **`esEmailValido(email)`**: Standardized regex-based email validation.
