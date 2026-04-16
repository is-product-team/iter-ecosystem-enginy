# Technical Design - Execution Phase Refactor

## 1. Database Schema Changes (Prisma)

### Enrollment & Attendance
- **Modify `Attendance`**:
    - Add `sessionId Int @map("id_session")`
    - Create a relation: `session Session @relation(fields: [sessionId], references: [sessionId], onDelete: Cascade)`
    - Keep `sessionNumber` and `sessionDate` for legacy/redundancy if needed, but the truth will now reside in the `sessionId`.

### Assignment
- **Default Teacher Logic**: 
    - We will leverage the existing `AssignmentTeacher` relation where `isPrincipal: true`.
    - No direct schema change needed for "default teacher", but we will use the `principal` teacher to populate sessions.

## 2. API Implementation

### Session Management
- **`POST /assignments/:id/sessions/bulk-assign-staff`**:
    - Takes a `userId` (teacher).
    - Updates all sessions of the assignment where `staff` is empty.
- **`GET /mobile/sessions`**:
    - Enhanced to include a `validationStatus` field (e.g., "PENDING_DOCS", "OK").
    - Include `imageRightsWarning` flag for each student in the session.

### Attendance
- **`POST /sessions/:id/attendance`**:
    - The primary endpoint for taking attendance.
    - Internally creates/updates `Attendance` records linked to this `sessionId`.
    - Automatically calculates the current `sessionNumber` based on the sequence.

## 3. Mobile UI/UX Redesign

### Attendance Screen
- **Image Rights Visibility**: Show a small camera icon with a diagonal strike through for students who haven't granted image rights.
- **"Mark All Present"**: A toggle at the top of the list that defaults all students to `PRESENT`.
- **Sync Status**: 
    - A badge in the header:
        - 🟢 `Syncat` (Online)
        - 🟡 `Pendent` (Offline - cached)
        - 🔴 `Error de connexió`

## 4. Web UI Redesign

### Assignment Details (Phase 3 Tab)
- **Top Action Bar**: Add a "Sincronitzar Equip Docent" button.
- **Functionality**: Clicking this will offer to "Assign the principal teacher to all sessions without a teacher".

## 5. Migration Strategy
- A one-time script will populate `id_session` in existing `Attendance` records by matching `id_assignment` + `numero_sessio` + `data_sessio`.
