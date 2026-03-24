## ADDED Requirements

### Requirement: Prisma Schema Alignment
The API application must use the same naming conventions (English) for models, relations, and fields as defined in the Prisma schema to ensure type safety and consistent data access.

#### Scenario: Database Query
- **WHEN** a developer writes a Prisma query (e.g., `prisma.center.findUnique`)
- **THEN** it must compile successfully without type errors related to missing members using the Catalan name (e.g., `prisma.centre`).

### Requirement: Assignment-Teacher Relationship
The code must correctly handle the relationship between `Assignment` and `Teacher` through the `AssignmentTeacher` junction model, replacing legacy `teacher1_id` / `teacher2_id` direct fields.

#### Scenario: Fetching Assignment with Teachers
- **WHEN** an Assignment is fetched with its teachers
- **THEN** it must include the `teachers` relation and allow access to the associated `User` profiles.
