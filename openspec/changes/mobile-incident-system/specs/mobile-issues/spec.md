## ADDED Requirements

### Requirement: List Incidents
The mobile application SHALL allow professors to view a list of all incidents they have reported, including their status and priority.

#### Scenario: View incident list
- **WHEN** the professor navigates to the "Support" section
- **THEN** the system displays a list of incidents with title, status, and creation date

### Requirement: Create Incident
The mobile application SHALL provide a form for professors to create new incidents by specifying a title, category, priority, and description.

#### Scenario: Successful incident creation
- **WHEN** the professor fills in the required fields and submits the form
- **THEN** the system sends the data to the `/issues` API and navigates back to the incident list with a success message

### Requirement: View Incident Details and Chat
The mobile application SHALL provide a detail view for each incident, showing its history and allowing the professor to communicate with administrators via a chat interface.

#### Scenario: Open incident details
- **WHEN** the professor taps on an incident in the list
- **THEN** the system displays the incident details and the message history (chat)

### Requirement: Send Message in Chat
The mobile application SHALL allow professors to send text messages within the context of an open incident.

#### Scenario: Send message
- **WHEN** the professor enters a message and taps "Send"
- **THEN** the system sends the message to the `/issues/:id/messages` API and updates the chat view
