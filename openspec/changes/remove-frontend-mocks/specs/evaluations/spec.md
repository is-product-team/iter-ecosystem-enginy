## MODIFIED Requirements

### Requirement: Dynamic Satisfaction Surveys Consumption
The frontend (mobile) MUST fetch the full questionnaire model (questions, types, and options) from the `/questionnaires/model/:id` endpoint. It MUST NOT use local hardcoded models as a fallback or override.

#### Scenario: Rendering a questionnaire
- **WHEN** a teacher opens a questionnaire for an assignment
- **THEN** the system SHALL render the questions fetched directly from the backend database.
