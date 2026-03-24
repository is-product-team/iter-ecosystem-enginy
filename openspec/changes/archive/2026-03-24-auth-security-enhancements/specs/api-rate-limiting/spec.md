## ADDED Requirements

### Requirement: Brute-Force Protection
The API must limit the number of authentication attempts from a single IP address to prevent brute-force and credential stuffing attacks.

#### Scenario: Excessive Login Attempts
- **WHEN** more than 5 login attempts are made from the same IP within a 15-minute window
- **THEN** subsequent requests should return a 429 Too Many Requests status code

### Requirement: Registration Protection
The API must limit the number of account registrations from a single IP to prevent automated account creation.

#### Scenario: Automated Registration
- **WHEN** more than 5 registration attempts are made from the same IP within a 15-minute window
- **THEN** subsequent requests should return a 429 Too Many Requests status code
