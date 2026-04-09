# Design: Local AI and English Refactor

## Architecture Overview

We are moving from a mock-based heuristic engine to a local-hosted LLM engine using **Ollama**. The API will act as a client to the local Ollama service, which runs in a sidecar container.

```mermaid
graph TD
    subgraph Iter Ecosystem (Docker stack)
        API[Express API]
        Ollama[Ollama Container]
        DB[(PostgreSQL)]
    end
    
    subgraph Applications
        Web[Next.js App]
        Mobile[Expo App]
    end
    
    Web <--> API
    Mobile <--> API
    API <--> DB
    API <-->|Local AI Inference| Ollama
```

## AI Service Refactoring

### 1. NLP Service (`nlp.service.ts`)
- **Model**: `llama3` or `mistral`.
- **Logic**: Use the `@langchain/ollama` or a direct fetch to `http://ollama:11434/api/generate`.
- **Prompt**:
  ```text
  Analyze the following educational feedback and extract structured information in JSON format:
  { "attendance": "PRESENT" | "LATE" | "ABSENT" | "JUSTIFIED", "competence": "Transversal", "score": 1-5, "reason": "..." }
  Input: "${text}"
  ```

### 2. Vision Service (`vision.service.ts`)
- **Model**: `llava`.
- **Logic**: Convert the uploaded PDF/Image buffer to Base64 and send it to Ollama's vision endpoint.
- **Prompt**: "Does this document contain a handwriting signature in the signature field? Answer with 'VALID' or 'INVALID' and a short reason."

## Localization Strategy

### 1. Unified Message Bundles
- Create `en.json` for both Web and Mobile.
- Standardize all technical terms:
  - Taller -> Workshop
  - Alumne -> Student
  - Docent -> Teacher
  - Acord Pedagògic -> Pedagogical Agreement

### 2. API Error Handling
- Refactor `apps/api/src/middlewares/error.handler.ts` to use English keys/messages.
- Update Zod validation schemas in `shared/schemas` to return English error messages.

## Data & Infrastructure Changes
- **Docker**: Add `ollama` service with volume mapping for models.
- **Prisma**: Update seed data to use English strings.
