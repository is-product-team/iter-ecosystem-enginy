# Design: Local AI Documentation Validation

## Architecture

```mermaid
sequenceDiagram
    participant User as Coordinador (Browser)
    participant Web as Web (Next.js)
    participant API as API (Express)
    participant Ollama as Ollama (Container)

    User->>Web: Sube PDF (Bulk)
    Web->>API: POST /student-document
    API->>API: Guarda archivo en /uploads
    API->>Ollama: POST /api/generate (moondream)
    Note over Ollama: Analiza Firmas + Texto
    Ollama-->>API: JSON { hasSignature: boolean }
    API-->>Web: JSON { success: true, ai_validation: {...} }
    Web->>User: Muestra Check Verde ✅
```

## Key Components

### 1. Vision Service (API)
- **Model**: `moondream` (Vision-enabled).
- **Communication**: REST API over local Docker network (`http://ollama:11434`).
- **Prompting**: Specialized instructions to detect "manuscript signatures" in the bottom third of the page.

### 2. Storage Fix (API)
- Use `process.cwd()` to ensure the `uploads/` folder is relative to the root of the API container.
- Implement an environment variable `UPLOAD_DIR` to allow volume mapping.

### 3. Frontend Refactor (Web)
- Remove `signatureDetector` class.
- The `BulkDocumentUpload` component will now handle the `POST` response from the API, which will include the AI validation results instead of performing them locally.
