# Architecture: Data Flow & Lifecycles

Understanding how data moves through the Iter Ecosystem is crucial for maintaining integrity and performance.

## 1. The Enrollment Lifecycle

This diagram illustrates the journey from a center's request to a validated student enrollment.

```mermaid
sequenceDiagram
    participant Center as Center (Admin)
    participant API as Backend API
    participant AI as Vision AI
    participant DB as PostgreSQL

    Center->>API: POST /requests (Apply for Workshop)
    API->>DB: Status: PENDING
    Note over API: Scheduling Engine (Tetris) runs
    API->>DB: Status: PROVISIONAL / PUBLISHED
    Center->>API: Upload Signed Agreement (PDF)
    API->>AI: analyzeDocument(PDF)
    AI-->>API: { signatureFound: true, valid: true }
    API->>DB: Status: VALIDATED
```

## 2. Real-Time Feedback & Attendance

The interaction between the professor's mobile app and the AI services.

```mermaid
graph TD
    App[Mobile App] -- Voice/Text --> API[Express API]
    API -- Analysis --> NLP[NLP Service]
    NLP -- Status/Score --> API
    API -- Update --> DB[(PostgreSQL)]
    DB -- Push Notification --> App
```

## 3. High-Frequency Telemetry (Proposed)

Architecture for real-time location tracking during field field activities.

```mermaid
graph LR
    M[Mobile Client] -- GPS Stream --> R[Redis Ingestion]
    R -- Buffer --> Filter[Filter & Aggregate]
    Filter -- Checkpoints --> DB[(PostgreSQL)]
    Filter -- Real-time --> Dashboard[Admin Live Map]
```

---

*For technical details on these components, refer to the [System Overview](./system-overview.md).*
