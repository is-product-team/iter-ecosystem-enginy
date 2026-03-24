## ADDED Requirements

### Requirement: HTTP-Only Token Storage
The API must issue authentication tokens via HTTP-Only cookies to ensure they cannot be accessed by client-side scripts.

#### Scenario: Successful Login (Web)
- **WHEN** a user logs in via the web interface
- **THEN** the API returns a Set-Cookie header with the JWT and the HttpOnly flag

### Requirement: Secure Transport
Authentication cookies must only be sent over secure (HTTPS) connections in production environments.

#### Scenario: Production Login
- **WHEN** NODE_ENV is set to 'production'
- **THEN** the authentication cookie must include the Secure flag

### Requirement: CSRF Mitigation
Authentication cookies must use the SameSite attribute to mitigate Cross-Site Request Forgery (CSRF) risks.

#### Scenario: Same-Site Request
- **WHEN** a request is made to the API
- **THEN** the authentication cookie should include SameSite: 'Strict' or 'Lax'
