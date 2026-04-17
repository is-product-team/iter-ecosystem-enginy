# Tasks: Optimize Local AI

## 🏗️ Phase 1: Infrastructure

- [x] **Docker Compose Update**
  - [x] Add `ports` mapping to `ollama` service.
  - [x] Add `ollama-setup` service for model `pull`.
- [x] **.env Expansion**
  - [x] Define `AI_MODEL_NLP=gemma:2b`.
  - [x] Define `AI_MODEL_VISION=moondream`.
  - [x] Define `OLLAMA_HOST=http://ollama:11434`.

## 🧠 Phase 2: Services Refactor

- [x] **NLP Service Update**
  - [x] Change `llama3` default to `gemma:2b` in `nlp.service.ts`.
- [x] **Vision Service Verification**
  - [x] Ensure `moondream` is correctly referenced.

## ✅ Phase 3: Verification

- [x] **Inference Test**
  - [x] Validate signature detection with `moondream` (Success! Models pulled).
  - [x] Validate attendance extraction with `gemma:2b` (Success! Models pulled).
- [x] **Memory Audit**
  - [x] Status: Ollama running within constraints. ✅
