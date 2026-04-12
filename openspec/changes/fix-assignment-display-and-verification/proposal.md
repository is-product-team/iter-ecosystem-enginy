# Proposal: Fix Assignment Display and Verification

The current system has several UI inconsistencies and bugs that prevent administrators and coordinators from properly tracking assignments and verifying student documentation.

## Problem

1.  **Empty Planning Column**: Admins see "Start: ---" instead of workshop dates.
2.  **Missing Document Links**: Admins cannot see or verify student PDFs (Greyed out UI).
3.  **Missing Date Fallback**: UI shows "Dates no definides" instead of fallback dates from the original request.

## Goal

-   Ensure all workshop dates (planned or request-based) are visible.
-   Fix the data mismatch to enable document verification for Admins.
-   Improve general data fetching for assignments.

## Scope

-   Modify `getAssignments` logic in the backend.
-   Update `verifications/page.tsx` data handling.
-   Align JSON data structure with frontend expectations.
