# Tareas: Integración UI de Validador IA

## Fase 1: Refactorización de DocumentUpload
- [ ] Importar utilidades de IA (`pdfUtils` y `visionUtils`) en `apps/web/components/DocumentUpload.tsx`.
- [ ] Añadir estado local `validatingAI` para manejar el feedback de la interfaz.

## Fase 2: Implementación de la Lógica de Interceptación
- [ ] Modificar `handleFileChange` para bloquear la ejecución y pasar el archivo capturado por `extractTextFromPdf` y `classifyDocumentType`.
- [ ] Añadir validación cruzada: rechazar si el documento analizado no coincide con `props.documentType`.
- [ ] Si `documentType` es `acord_pedagogic`, asegurar la carga del modelo TF.js (`signatureDetector.loadModel()`).
- [ ] Renderizar canvas y pasar por `validateSignatures()`.

## Fase 3: Feedback Visual y Manejo de Errores
- [ ] Añadir `toast.error` descriptivos según el paso de la IA que haya fallado.
- [ ] Modificar el botón UI (`<label>`) para que muestre el estado "VALIDANT IA..." con colores amigables.
- [ ] Probar la carga completa subiendo un PDF correcto y asegurando que llega al backend.
