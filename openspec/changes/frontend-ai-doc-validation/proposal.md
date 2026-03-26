# Proposal: Frontend AI Document Validation System

## Goal
Implement a document validation system in the frontend using TensorFlow.js to automatically verify pedagogical contracts (Acord pedagògic), mobility authorizations, and image rights using Computer Vision and NLP, prioritizing privacy.

## Scope
- **PDF Parsing**: Extract text from PDFs directly in the browser using PDF.js.
- **Document Classification**: Identify document types (Acord pedagògic, Mobilitat, Imatge) based on text heuristics or a lightweight TF.js text model.
- **Data Extraction**: Extract the Student Name, IDALU, and Project name using Regex/NER.
- **Signature Detection (Computer Vision)**: Scan the bottom 33% of the "Acord pedagògic" using a pre-trained TF.js object detection model (e.g. YOLOv8) to verify the presence of 3 signatures.
- **Client-Side Validation**: Validate all documents in-browser and provide immediate feedback to the coordinator before server upload.

## Out of Scope
- Server-side AI processing or reliance on external LLM APIs (e.g., OpenAI, Anthropic).
- Authenticating the validity of signatures (the system only checks for *presence*, not forgery).
- In-app model training (models will be pre-trained offline and served as static assets).

## Motivation
Coordinators receive large batches of required documentation. Manually verifying signatures, document types, and extracting student IDs is an arduous process. Automating this via edge AI (TensorFlow.js) directly in the browser ensures maximum privacy (GDPR compliance) since sensitive documents are only sent to the backend once they are structurally validated.
