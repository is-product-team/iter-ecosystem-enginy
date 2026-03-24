# Specification: Auth & Security Flows

This document details the authentication and authorization mechanisms used to secure the Iter Ecosystem.

## 1. Authentication Strategy

The system uses **JWT (JSON Web Tokens)** for stateless authentication across the Web, Mobile, and API applications.

### Login Flow
1. **Request**: User sends `email` and `password` to `/api/auth/login`.
2. **Verification**: 
   - User is looked up by email in the PostgreSQL database.
   - Password hash is verified using `bcrypt.compare()`.
3. **Token Generation**: A JWT is signed using a `JWT_SECRET` with a **24-hour expiration**.
4. **Response**: Returns the JWT and a safe user object. For web clients, it also sets an **HTTP-Only, Secure, and SameSite: Strict cookie** containing the JWT to mitigate XSS and CSRF.

### Registration Flow
- **Encryption**: Passwords are hashed using `bcrypt` with a salt of **10 rounds** before storage.
- **Access**: Registration is typically used by administrators or initial setup scripts to create coordinators and teachers.

## 2. Token Structure

The JWT payload contains essential claims for RBAC (Role-Based Access Control):
```json
{
  "userId": 123,
  "email": "user@example.com",
  "role": "ADMIN",
  "centreId": 45,
  "iat": 1711123200,
  "exp": 1711209600
}
```

## 3. Authorization (RBAC)

Access control is enforced via Express middlewares:

- **`authenticateToken`**: Validates the `Authorization: Bearer <token>` header. If valid, attaches the user payload to the request object.
- **`isAdmin`**: Restricts access to users with the `ADMIN` role.
- **`isCoordinator`**: Allows access to `ADMIN` or `COORDINADOR` roles.

## 4. Client-Side Handling

- **Web**: Tokens are stored in a secure manner (e.g., `localStorage` or `HttpOnly` cookies, depending on the environment) and sent in the `Authorization` header.
- **Mobile**: Tokens are persisted using secure storage (e.g., `Expo SecureStore`) for persistent sessions.

## 5. Security Best Practices

- **Password Hashing**: Always done server-side using `bcrypt`.
- **Sensitive Data**: Password hashes are stripped from API responses using object destructuring.
- **Environment Variables**: Secrets like `JWT_SECRET` and `DATABASE_URL` are managed via `.env` files.
- **Rate Limiting**: Critical endpoints (login/register) are protected against brute-force (max 5 attempts per 15 min).
