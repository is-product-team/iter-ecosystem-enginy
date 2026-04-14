# Design: Phase 2 AI-Unified Console

## Data Flow & UI Logic

```mermaid
sequenceDiagram
    participant C as Coordinator
    participant BC as BulkAIUpload component
    participant AI as AI Vision/PDF Logic
    participant API as Backend API
    
    C->>BC: Drops 10 PDFs
    BC->>AI: extractTextFromPdf(file)
    AI-->>BC: Returns IDALU + DocType
    BC->>BC: Matches IDALU to students in current assignment
    BC-->>C: Shows "10 matches found / Review"
    C->>BC: Click "Confirm & Upload"
    BC->>API: Sequential/Bulk upload requests
    API-->>BC: Success
    BC->>C: Refresh table state
```

## UI Components
- **`Phase2Console`**: Main container in `assignments/[id]/page.tsx`.
- **`Phase2Table`**: Compact table view for students and their 3 document slots.
- **`StudentSelectionDrawer`**: Replaces the full-page register.
- **`BulkAIUpload`**: The dropzone containing the logic from `DocumentUpload.tsx` but expanded for multiple files.

## Admin Enhancements
- **AI Confidence Badges**: UI indicator (`badge`) showing the result of `visionUtils` or `pdfUtils`.
- **Bulk Action Bar**: Floating bar on multiple selection in the Admin Verification table.
