# Tareas: Integración UI de Validador IA

## Fase 1: Refactorización de DocumentUpload
- [x] Importar utilidades de IA (`pdfUtils` y `visionUtils`) en `apps/web/components/DocumentUpload.tsx`.
- [x] Añadir estado local `validatingAI` para manejar el feedback de la interfaz.

## Fase 2: Implementación de la Lógica de Interceptación
- [x] Modificar `handleFileChange` para bloquear la ejecución y pasar el archivo capturado por `extractTextFromPdf` y `classifyDocumentType`.
- [x] Añadir validación cruzada: rechazar si el documento analizado no coincide con `props.documentType`.
- [x] Si `documentType` es `acord_pedagogic`, asegurar la carga del modelo TF.js (`signatureDetector.loadModel()`).
- [x] Renderizar canvas y pasar por `validateSignatures()`.

## Fase 3: Feedback Visual y Manejo de Errores
- [x] Añadir `toast.error` descriptivos según el paso de la IA que haya fallado.
- [x] Modificar el botón UI (`<label>`) para que muestre el estado "VALIDANT IA..." con colores amigables.
- [ ] Probar la carga completa subiendo un PDF correcto y asegurando que llega al backend.
