# Design: Frontend AI Document Validation System

## Architecture Overview
The system introduces an edge-AI processing pipeline running entirely within the frontend (React/Next.js or Expo, depending on the client). It intercepts the file upload process, validates the files locally using TensorFlow.js and PDF.js, and only triggers the actual network upload to the backend once structural and visual validity is confirmed.

## Technical Components
1. **Document Ingestion Module (PDF.js)**: 
   - Reads the uploaded File object as an ArrayBuffer.
   - Extracts raw text for Regex/NLP tasks.
   - Renders specific pages (e.g., the last page of the Acord) to a hidden `<canvas>` for Computer Vision tasks.

2. **Text Processing & Classification Module**: 
   - Uses Regex/Heuristics for extracting deterministic data (IDALU, Student Name, Project Name).
   - Classifies the document type (Acord pedagògic, Mobilitat, Imatge) based on exact string matches or a lightweight TF.js text classifier if necessary.

3. **Computer Vision Module (TensorFlow.js)**: 
   - Loads a pre-trained lightweight Object Detection model (e.g., YOLOv8 nano exported to TF.js format).
   - Crops the bottom 33% of the `<canvas>` representation of the document.
   - Runs inference on the cropped tensor to detect and count bounding boxes classified as "signature".
   - Returns boolean `isValid` depending on the required signature count (e.g., 3 for Acord).

4. **Validation UI Component**: 
   - A React component that provides real-time feedback to the user (coordinator): Parsing -> Classifying -> Scanning Signatures -> Approved/Rejected.

## Data Flow
1. User drops `document.pdf`.
2. UI Component captures file, blocks upload.
3. `PDFEngine` reads file in memory.
4. `TextAnalyzer` determines type and extracts metadata.
5. If type requires signatures, `VisionEngine` scans the image buffer.
6. Validation Result is presented.
7. If Valid -> File and Metadata are passed to the backend API.

## Dependencies
- `pdfjs-dist`: For reading and rendering PDFs in the browser.
- `@tensorflow/tfjs` & `@tensorflow/tfjs-backend-webgl`: For hardware-accelerated inference.
- Pre-trained TF.js models (Static assets hosted in `/public/models`).
