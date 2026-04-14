## ADDED Requirements

### Requirement: Dynamic Multi-Competence NLP Analysis
El asistente de voz debe ser capaz de identificar y puntuar múltiples competencias en una sola transcripción basándose en palabras clave preconfiguradas.

#### Scenario: Processing multiple competencies by voice
- **WHEN** El profesor dice "El alumno tiene un respeto excelente por el material pero su puntualidad es mediocre".
- **THEN** El NLP debe asignar puntuaciones (ej: 5 y 2) a cada competencia detectada por sus palabras clave en lugar de puntuar una sola competencia fija.
