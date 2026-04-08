# Proposal: Local AI Infrastructure and English Localization

## What
Refactor the current mock AI services (`NLPService`, `VisionService`, `RiskAnalysisService`) to use a real, locally-hosted LLM (via Ollama) and perform a full localization of the application components to English.

## Why
1. **Privacy**: The project handles sensitive educational data. Moving to local models ensures no data leaves the controlled infrastructure.
2. **Technical Debt**: Current "AI" implementations are heuristic mocks (keyword matching) that fail in professional scenarios (e.g., Catalan plural forms, filename-only vision).
3. **Accessibility**: English is the target language for the next deployment phase, requiring a full translation of UI and logic.

## Scope
- **Backend**: Integration of Ollama within Docker, refactoring of services to use Llama/Llava.
- **Frontend (Web/Mobile)**: Translation of local messages and UI strings.
- **Data**: Update seed data and keywords to English.

## Approach
- Add a new `ollama` service to the `docker-compose.yml`.
- Use the OpenAI-compatible API provided by Ollama in the Node.js backend.
- Leverage Next-intl and Expo i18n for English localization.
