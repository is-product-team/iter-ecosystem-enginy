# Proposal: Advanced Data Grid Features

## Problem Statement
The current data grid provides a clean "Raw Data" look but lacks standard database functionalities like interactive sorting and data grouping. As the volume of administrative data (Students, Teachers, Workshops) grows, coordinators and admins need more powerful ways to organize and slice through the information without leaving the list view.

## Proposed Solution
Enhance the core `DataTable` component to support:
1. **Interactive Sorting**: Clicking column headers toggles ASC/DESC/NONE sorting.
2. **Collapsible Grouping**: A "Group By" control in the toolbar that clusters rows by a specific field (e.g., Course, Sector, Status) with sticky, collapsible headers.

## Expected Outcomes
- Reduced dashboard "noise" through grouping.
- Faster information retrieval through sorting.
- Consistent UI experience across all modules (Students, Teachers, Workshops, etc.).
- High-density data management that rivals professional tools like NocoDB/Airtable.
