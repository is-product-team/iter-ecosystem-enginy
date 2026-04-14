# Design: High-Density Verification Matrix

This design replaces the assignment-based card view with a student-centric data grid. It prioritizes information density, professional aesthetics, and efficient batch processing.

## UI Architecture

### 1. Verification Data Grid
The main view will be a high-density table. Each row represents a unique enrollment (Student + Assignment).
- **Columns**: Alumno, Centro/Taller, Fecha, Acord (Status), Mobilitat (Status), Drets (Status), Actions.
- **Micro-states**: Instead of buttons, document status will use subtle badges:
  - `Validated`: Green dot + Text (Low opacity bg).
  - `Pending`: Yellow blinking dot + Text.
  - `Problem`: Red icon + Text.
  - `Empty`: Grey text only.

### 2. Slide-over Detail Panel
To avoid page jumps or heavy modals, clicking a student row opens a right-aligned Slide-over panel.
- **Content**: 
  - Student Profile Header.
  - Vertical list of Document sections.
  - Integrated PDF Viewer (IFrame/Object) that updates when switching doc types.
  - Primary "Approve" and "Reject/Report" buttons at the bottom.

### 3. Command Bar (Filters & Search)
A sticky top bar for rapid navigation:
- **Search**: Fuzzy search by student name or Idalu.
- **Status Filter**: Multi-select (Show only problems, only pending, etc.).
- **Center Filter**: Quick jump to a specific school.

## Aesthetic Refinement

- **Corners**: Strictly 0px border-radius (Sharp Minimalist).
- **Colors**: 
  - Surfaces: `var(--bg-surface)`
  - Borders: `var(--border-subtle)`
  - Status Indicators: Using refined HSL variations of the brand colors (Green-600 for success, Red-600 for problems).
- **Typography**: Inter 13px for data (high legibility), 11px for labels.

## Technical Strategy

- **Componentization**: Split the view into `VerificationTable`, `VerificationFilters`, and `VerificationSidePanel`.
- **Data Fetching**: The `assignmentService.getAll()` already returns the necessary data, but it needs a flat mapping function in the frontend (`enrollments` flatten).
- **Hotkeys**: Add keyboard navigation (Esc to close panel, Arrow keys for list navigation).
