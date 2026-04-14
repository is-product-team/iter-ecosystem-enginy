# Propuesta: Integración del Validador IA en la Subida de Documentos

## Goal
Integrar la funcionalidad de Inteligencia Artificial (Visión por Computador y NLP) para validar documentos pdf directamente en el punto donde los coordinadores suben la documentación de los alumnos (`apps/web/app/center/assignments/[id]/page.tsx`).

## Scope
- Refactorizar el componente existente `DocumentUpload.tsx` para que actúe como interceptor.
- Mantener la interfaz de usuario compacta y familiar para los coordinadores, pero cambiando el estado a "Validant amb IA..." cuando se adjunta un documento.
- Si la IA rechaza el documento, se mostrará un error visual (toast) y se abortará la subida al servidor (API).
- Si la IA lo aprueba, se realizará la subida HTTP `POST` habitual.

## Motivation
El coordinador de un centro debe subir los 3 documentos por cada alumno (decenas de documentos en total por taller). Tener una validación invisible basada en Edge AI asiste al centro reduciendo los errores de subida de archivos incorrectos, sin añadir pasos adicionales ni entorpecer la UX.
