## ADDED Requirements

### Requirement: Academic Phase Change Broadcast
The system SHALL broadcast a `phase_changed` event to all connected clients immediately after an academic phase is successfully activated in the database.

#### Scenario: Phase Activation Broadcast
- **WHEN** an administrator activates a new academic phase via the API
- **THEN** the system SHALL emit a `phase_changed` event containing the phase ID and name to all connected sockets
