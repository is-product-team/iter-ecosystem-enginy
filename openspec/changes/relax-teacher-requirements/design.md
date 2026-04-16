# Design: Relax Teacher Requirements

## Backend Changes

### 1. Request Controller (`apps/api/src/controllers/request.controller.ts`)
- Modify `createRequest`: 
  - Change validation `if (!workshopId || !centerId || !prof1Id || !prof2Id)` to `if (!workshopId || !centerId || !prof1Id)`.
  - Update `prisma.request.create` data.
- Modify `updateRequest`:
  - Update `teacherCheck` call.
  - Update `prisma.request.update` data.

### 2. Assignment Controller (`apps/api/src/controllers/assignment.controller.ts`)
- Modify `designateTeachers`:
  - Remove requirement for `teacher2Id`.
  - Update check `if (teacher1Id && teacher2Id && teacher1Id === teacher2Id)`.
  - Update checklist completion logic `isCompleted: !!teacher1Id`.

## Frontend Changes

### 1. Translations (`apps/web/messages/*.json`)
- Clarify labels:
  - `Center.Requests.referent_teachers`: "Referents de Contacte (Punt de coordinació)"
  - `DesignateTeachersPage.selection_of_referents`: "Equip Docent (Professors Practicants)"

### 2. Request Page (`apps/web/app/[locale]/center/requests/page.tsx`)
- Update `handleSubmit` validation to only require `teacher1Id`.
- Update JSX to remove `required` from the second teacher select.
- Mark the second teacher select as "(Opcional)".

### 3. Designation Page (`apps/web/app/[locale]/center/assignments/[id]/teachers/page.tsx`)
- Update `handleSave` validation to only require `teacher1Id`.
- Update labels to clarify that these are the practitioners for the workshop.

## Verification Plan
### Manual Verification
- Create a request with only 1 teacher -> Verify it saves and shows in the dashboard.
- Update a request to remove the 2nd teacher -> Verify success.
- Designate only 1 teacher in Phase 3 -> Verify checklist step marks as completed.
