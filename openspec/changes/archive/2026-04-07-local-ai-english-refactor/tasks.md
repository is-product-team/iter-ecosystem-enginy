# Implementation Tasks: Local AI and English Refactor

## 🏗️ Phase 1: Infrastructure (Ollama)
- [x] Add `ollama` service to `docker-compose.yml`.
- [x] Configure `OLLAMA_HOST` in `apps/api/.env`.
- [x] Verify Ollama connectivity via `curl` from the API container.
- [x] Pull required models (`llama3`, `llava`) in the Ollama container.

## 🧠 Phase 2: AI Service Refactor
- [x] **NLP Service**:
    - [x] Update `NLPAnalysisResult` interface for English keys.
    - [x] Implement LLM client using `@langchain/ollama`.
    - [x] Add system prompt for multi-language extraction.
    - [x] Replace `processText` logic with the LLM call.
- [x] **Vision Service**:
    - [x] Implement image-to-text validation using `llava`.
    - [x] Update `validateDocument` to handle Buffer to Base64 conversion.
- [x] **Risk Analysis**:
    - [x] Recalibrate weights in `RiskAnalysisService`.
    - [x] Translate factors and alert messages to English.

## 🌍 Phase 3: Localization (Core)
- [x] **Frontend**:
    - [x] Create `apps/web/messages/en.json` from `es.json`.
    - [x] Create `apps/mobile/locales/en.json` from `es.json`.
    - [x] Set `defaultLocale: 'en'` in Next and i18n configs.
- [x] **API & DB**:
    - [x] Refactor `AssignmentSolver` log messages.
    - [x] Update `prisma/seed.ts` with English data.
    - [x] Rename competence names in the database during migration/seed.

## 🧪 Phase 4: Verification
- [x] Run full test suite `npm run test:all`.
- [x] Manual verification of one E2E flow (from assignment to evaluation) in English.
