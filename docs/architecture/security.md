# Security Architecture & Data Flow

This document details the internal security mechanisms and sensitive data handling processes.

## 1. Authentication Flow

```mermaid
sequenceDiagram
    participant Client as Frontend (Web/Mobile)
    participant API as Express API
    participant DB as PostgreSQL (Prisma)

    Note over Client, DB: Login Process
    Client->>API: POST /auth/login (email, password)
    API->>DB: Find user by email
    DB-->>API: Return User (with password_hash)
    API->>API: Verify Password (bcrypt)
    API->>API: Sign JWT (userId, role, centerId)
    API-->>Client: 200 OK (JWT + userSession)
```

## 2. Sensitive Data Handling

- **Passwords**: Hashed with `bcrypt` (10 rounds).
- **JWT**: Signed tokens managed via `JWT_SECRET`.
- **Data Isolation**: Multi-tenant filtering by `centerId` to protect student PII.

---
*For the reporting policy, see the root [SECURITY.md](../../SECURITY.md).*
