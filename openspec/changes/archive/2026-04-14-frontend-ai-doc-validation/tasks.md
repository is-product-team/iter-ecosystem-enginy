# Tasks: Frontend AI Document Validation

## Phase 1: Setup & UI Scaffolding
- [ ] Install `@tensorflow/tfjs`, `@tensorflow/tfjs-backend-webgl` and `pdfjs-dist` in the frontend application.
- [ ] Create a `DocumentValidator` React component/hook that accepts an array of `File` objects from a drag-and-drop zone.
- [ ] Implement the UI state machine (Idle -> Analyzing Text -> Scanning Signatures -> Validated / Rejected).

## Phase 2: PDF Parsing & Text Analysis
- [ ] Implement a utility using `pdfjs-dist` to parse a local File into text content.
- [ ] Write Regex patterns to identify standard variables (IDALU, Student Name) from the extracted text.
- [ ] Implement the Document Classifier to categorize the document based on its textual headings (Acord pedagògic, Autorització de mobilitat, Autorització de drets d'imatge).

## Phase 3: Vision Pipeline (Signatures)
- [ ] Implement a utility in `pdfjs-dist` to render the last page of a PDF onto an OffscreenCanvas.
- [ ] Create an image cropping function to isolate the bottom 33% of the canvas.
- [ ] Write the `SignatureDetector` class that initializes TensorFlow.js, loads a placeholder model from `/public/models/signature-detector/model.json`, and runs inference on the cropped canvas tensor.
- [ ] Add post-processing logic to count detected signatures and compare against the document requirements (e.g., Acord needs >= 3).

## Phase 4: Integration
- [ ] Tie the Text Analysis and Vision Pipeline together in the `DocumentValidator` component.
- [ ] Prevent form submission or server upload if the validation fails.
- [ ] If validation succeeds, attach the extracted metadata (IDALU, Type) to the final upload payload.
