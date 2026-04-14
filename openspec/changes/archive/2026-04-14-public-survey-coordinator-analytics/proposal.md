# Proposal: Public Student Survey & Coordinator Analytics

## Problem Statement
The current system assumes students have a personal dashboard and a login to access their certificates and surveys. This is often overly complex and a friction point for high school students. Additionally, center coordinators lack a centralized way to monitor student satisfaction and retrieve certificates in bulk.

## Proposed Solution
Shift the student feedback loop to a public-facing, email-verified form (no login). Centralize certificate management and satisfaction analytics in the Center Coordinator's dashboard.

## Scope
- **Database**: Add `email` field to `Student` model.
- **Backend**: 
    - Public survey verification and submission endpoints.
    - Satisfaction data aggregation for coordinators and admins.
- **Frontend**:
    - New `Public Survey Page` for students.
    - Updated `Coordinator Dashboard` with:
        - Bulk certificate download (Zip).
        - Anonymous satisfaction charts using Recharts.

## Success Criteria
- Students can complete the survey by just entering their email.
- Center Coordinators can see a visual summary of workshop quality.
- Center Coordinators can download all student certificates in one click.
- Blocked: Certificates are only generated/accessible once the survey has a high enough response rate or specific students have finished.
