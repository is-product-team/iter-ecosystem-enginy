## MODIFIED Requirements

### Requirement: Robust Web Language Switching
The system MUST provide a reliable mechanism for switching the application language that ensures all server-side messages and client-side context are synchronized without causing transition locks.

#### Scenario: Successful language switch on Profile page
- **WHEN** user selects a different language in the Profile page
- **THEN** the application MUST update the locale prefix in the URL
- **THEN** the application MUST correctly render all text content in the target language
- **THEN** no persistent loading overlays MUST remain visible after the transition completes

#### Scenario: Language switch recovery
- **WHEN** a language switch transition takes longer than expected (e.g., > 2s)
- **THEN** the system MUST ensure the user is not left with a non-interactive loading screen
- **THEN** the system SHOULD force the resolution of the loading state once the destination route is reached
