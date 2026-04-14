# Tasks: Ollama AI Migration

## API (Backend)
- [ ] Fix file storage path in `assignment.controller.ts` (use absolute paths).
- [ ] Refine `VisionService.ts` to improve Ollama prompt and error handling.
- [ ] Ensure `uploads/documents` directory is created on startup.
- [ ] Update `docker-compose.yml`:
    - [ ] Add volume: `./apps/api/uploads:/app/uploads`.
    - [ ] Set `AI_MODEL_VISION=moondream`.

## Web (Frontend)
- [ ] Remove `apps/web/lib/visionUtils.ts`.
- [ ] Uninstall TensorFlow.js packages from `apps/web/package.json`.
- [ ] Update `BulkDocumentUpload.tsx`:
    - [ ] Remove local signature detection call.
    - [ ] Update progress bar to reflect server-side analysis.
    - [ ] Display AI validation results from API response.

## Environment/Ollama
- [ ] Run `docker exec -it iter-ollama ollama pull moondream`.
- [ ] Verify connectivity between API and Ollama.
