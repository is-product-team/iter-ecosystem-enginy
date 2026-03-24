## Why

Ensuring the security of user credentials and sensitive data is paramount for a "serious project." The current implementation, while functional for an MVP, has several areas for improvement:
- **XSS Vulnerability**: `localStorage` is accessible by JavaScript, making it vulnerable to Cross-Site Scripting (XSS) attacks.
- **Brute Force Risk**: Authentication endpoints lacks rate limiting, allowing for automated credential stuffing or brute-force attempts.
- **Encapsulation**: While `password_hash` is omitted in responses, stricter repository-level isolation for sensitive data (PII) will further decouple security concerns from business logic.

## What Changes

- **JWT Storage Migration**: The API will issue JWTs via `httpOnly`, `secure`, and `sameSite: 'strict'` cookies instead of returning them in the JSON body. The frontend will be updated to rely on these cookies for authentication.
- **Auth Rate Limiting**: Integration of `express-rate-limit` for `/auth/login` and `/auth/register` endpoints.
- **PII Isolation Layer**: Implementation of an explicit data transformation layer in repositories to ensure sensitive fields never leak beyond the database layer unless explicitly requested.

## Capabilities

### New Capabilities
- `api-rate-limiting`: Protects public endpoints from abuse and brute-force attacks.
- `secure-cookie-auth`: Implements cookie-based session management to mitigate XSS risks.

### Modified Capabilities
- `user-auth`: Updates the authentication flow to handle cookie-based tokens.

## Impact

- **API**: Changes to `auth.controller.ts`, `index.ts` (middleware setup), and `apiInstance` configuration.
- **Web**: Updates to `AuthContext.tsx` and `api.ts` to remove `localStorage` dependency for tokens.
- **Mobile**: No impact on storage (continues using `SecureStore`), but requires adjustment in how it receives/sends the token if the API changes its response format.
