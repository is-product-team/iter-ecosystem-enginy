## Context

The current authentication system returns a JWT in the response body, which the frontend stores in `localStorage`. This is functional but susceptible to XSS. Additionally, authentication endpoints are not protected against brute-force attacks.

## Goals / Non-Goals

**Goals:**
- Mitigate XSS risks by moving JWT storage to `httpOnly` cookies.
- Protect auth endpoints from brute-force attacks via rate limiting.
- Abstract sensitive data handling at the repository level.

**Non-Goals:**
- Replacing JWT with server-side sessions.
- Implementing OAuth2/OIDC.
- Changing the mobile authentication storage (SecureStore is already secure).

## Decisions

### 1. HTTP-Only Cookies for Web
The API will be updated to use `cookie-parser`.
- **Login Response**: Instead of returning `token` in JSON, the API will use `res.cookie()`:
  ```typescript
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000 // 24h
  });
  ```
- **Frontend**: Axios will be configured with `withCredentials: true`. `AuthContext` will no longer read from `localStorage`.

### 2. Rate Limiting
Implementation of `express-rate-limit`:
- **Window**: 15 minutes.
- **Max attempts**: 5 per IP for `/auth/login` and `/auth/register`.
- **Storage**: In-memory (standard for single-instance) or Redis (if scaling).

### 3. Repository Data Santization
Update `BaseRepository` or specific repositories to use a `toJSON` or `toSafe` pattern that automatically omits `password_hash` and other PII unless explicitly requested.

## Risks / Trade-offs

- **CORS Complexity**: Using cookies with credentials requires a strict `Origin` (not `*`) and `Access-Control-Allow-Credentials: true`.
- **CSRF Risk**: While `sameSite: 'strict'` partially mitigates CSRF, we should monitor if explicit CSRF tokens are needed for non-GET requests if we move away from standard API headers.
- **Mobile Compatibility**: The API must still support bearer tokens in headers for mobile clients (or maintain a hybrid approach where the token is returned in JSON *only* for non-web clients).
