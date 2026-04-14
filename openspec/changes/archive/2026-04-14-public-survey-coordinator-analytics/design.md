# Design: Public Survey & Coordinator Analytics

## Architecture Overview

The system transitions from an identity-verified download to an email-verified public submission.

```ascii
[Student] --(Email)--> [Public API] --(Verify)--> [Show Survey]
[Student] --(Submit)--> [Public API] --(Save)--> [Analytics Service]
[Coordinator] --(View)--> [Private API] --(Aggregated Data)--> [Recharts UI]
```

## Detailed Components

### 1. Database & Models
- **Student**: Add `email` (String, nullable).
- **SelfConsultation**: Ensure it remains linked to `enrollmentId`.

### 2. Backend Services
- **PublicService**: Handles unauthenticated requests for student verification.
- **AnalyticsService**: NEW service to calculate averages and distributions for:
    - `experienceRating`
    - `teacherRating`
    - `vocationalImpact` (SI/NO/CONSIDERANT)
- **ZipService**: A service to generate a ZIP archive containing all certificates of a center/assignment.

### 3. Frontend Components
- **PublicSurveyPage**: A Next.js landing page with zero-config (no auth tokens).
- **CoordinatorAnalyticsCard**: A dedicated component using Recharts:
    - `PieChart` for Vocational Impact.
    - `BarChart` for general workshop ratings.
- **BulkDownloadButton**: Triggering the backend Zip generation.

## Security Considerations
- The public survey verification should not expose sensitive student details beyond the workshop title.
- Satisfaction graphs are aggregated and anonymous.
