# Auth & Roles

The **Iter Ecosystem** uses a Role-Based Access Control (RBAC) system to manage permissions. This guide explains the available roles and provides credentials for testing with the default seed data.

## 👥 Role Definitions

| Role | Scope | Key Capabilities |
| :--- | :--- | :--- |
| **ADMIN** | Platform Global | Manage centers, sectors, and global system configuration. |
| **COORDINATOR** | Center-Specific | Manage teachers and workshops within their assigned center. |
| **TEACHER** | Instructional | Manage student attendance and assigned workshop evaluations. |

## 🔑 Login Examples (Seed Data)

To test the application locally, use the following credentials. All accounts share the same default password.

> [!IMPORTANT]
> **Default Password**: `Iter@1234`

### 1. Global Administrator
- **Email**: `admin@admin.com`
- **Context**: Access to the full dashboard and management of all institutional entities.

### 2. Center Coordinator (Example: Institut Joan Brossa)
- **Email**: `coordinacion@brossa.cat`
- **Context**: Can only see and manage data related to "Joan Brossa".

### 3. Teacher (Example: Laura Martínez)
- **Email**: `laura.martinez@brossa.cat`
- **Context**: Can access assigned workshops and attendance lists for their specific groups.

## 🔐 Security Notes

- **Password Hashing**: We use `bcrypt` for local authentication.
- **JWT**: The API issues a JSON Web Token (JWT) on successful login, which must be included in the `Authorization` header for subsequent requests.
- **Session**: In the Web UI, the session is managed via `AuthContext`.

---

> [!TIP]
> If you need to refresh these users, run `docker compose exec setup npm run db:seed --filter=api`.
