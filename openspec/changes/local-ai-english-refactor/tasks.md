# Implementation Tasks: Local AI and English Refactor

## 🏗️ Phase 1: Infrastructure (Ollama)
- [ ] Add `ollama` service to `docker-compose.yml`.
- [ ] Configure `OLLAMA_HOST` in `apps/api/.env`.
- [ ] Verify Ollama connectivity via `curl` from the API container.
- [ ] Pull required models (`llama3`, `llava`) in the Ollama container.

## 🧠 Phase 2: AI Service Refactor
- [ ] **NLP Service**:
    - [ ] Update `NLPAnalysisResult` interface for English keys.
    - [ ] Implement LLM client using `@langchain/ollama`.
    - [ ] Add system prompt for multi-language extraction.
    - [ ] Replace `processText` logic with the LLM call.
- [ ] **Vision Service**:
    - [ ] Implement image-to-text validation using `llava`.
    - [ ] Update `validateDocument` to handle Buffer to Base64 conversion.
- [ ] **Risk Analysis**:
    - [ ] Recalibrate weights in `RiskAnalysisService`.
    - [ ] Translate factors and alert messages to English.

## 🌍 Phase 3: Localization (Core)
- [ ] **Frontend**:
    - [ ] Create `apps/web/messages/en.json` from `es.json`.
    - [ ] Create `apps/mobile/locales/en.json` from `es.json`.
    - [ ] Set `defaultLocale: 'en'` in Next and i18n configs.
- [ ] **API & DB**:
    - [ ] Refactor `AssignmentSolver` log messages.
    - [ ] Update `prisma/seed.ts` with English data.
    - [ ] Rename competence names in the database during migration/seed.

## 🧪 Phase 4: Verification
- [ ] Run full test suite `npm run test:all`.
- [ ] Manual verification of one E2E flow (from assignment to evaluation) in English.
