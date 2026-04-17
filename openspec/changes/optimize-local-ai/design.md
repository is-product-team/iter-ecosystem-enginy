# Design: Optimized Local AI Stack

## Infrastructure Changes

### Docker Compose Update
- **Ollama Service**: Add `ports: ["11434:11434"]` for observability.
- **Model Puller Service**: Add a temporary `ollama-setup` service to pull models on startup.
  ```yaml
  ollama-setup:
    image: ollama/ollama:latest
    container_name: ollama_setup
    networks: ["iter-network"]
    depends_on: ["ollama"]
    entrypoint: /bin/sh
    command: -c "sleep 5 && ollama pull gemma:2b && ollama pull moondream"
  ```

### .env Variables
New defaults to ensure lightweight execution:
- `AI_MODEL_NLP=gemma:2b`
- `AI_MODEL_VISION=moondream`
- `OLLAMA_HOST=http://ollama:11434`

## Service Logic

### NLP Service (`nlp.service.ts`)
- Update class defaults to prefer `gemma:2b` when the env variable is missing.
- Ensure the JSON response format is robust for smaller models.

### Vision Service (`vision.service.ts`)
- Maintain `moondream` as the primary vision engine.
- Verify signature detection accuracy with the 2GB RAM limit.

## Rationale
- **Gemma:2b**: Provides excellent JSON extraction capabilities for its size (~1.6GB).
- **Moondream**: Specifically designed for efficient vision tasks on limited hardware.
- **Auto-Pull**: Ensures the "Zero Mock" strategy works out of the box without manual terminal commands.
