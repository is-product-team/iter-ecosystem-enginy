# Tasks: Relax Teacher Requirements

## Backend Implementation
- [ ] 1. Update `apps/api/src/controllers/request.controller.ts`
  - [ ] Relax `createRequest` mandatory check
  - [ ] Relax `updateRequest` mandatory check
- [ ] 2. Update `apps/api/src/controllers/assignment.controller.ts`
  - [ ] Relax `designateTeachers` mandatory check
  - [ ] Update checklist logic to require only 1 teacher for completion

## Frontend Implementation
- [ ] 3. Update i18n messages in `apps/web/messages/ca.json` and `es.json`
  - [ ] Separate "Contact Reference" from "Practicing Teacher"
- [ ] 4. Update request creation form in `apps/web/app/[locale]/center/requests/page.tsx`
  - [ ] Allow submitting with 1 teacher
  - [ ] Update UI labels and placeholders
- [ ] 5. Update teacher designation form in `apps/web/app/[locale]/center/assignments/[id]/teachers/page.tsx`
  - [ ] Allow submitting with 1 teacher
  - [ ] Update UI labels for "Equip Docent"

## Verification
- [ ] 6. Test Request creation with 1 teacher
- [ ] 7. Test Phase 3 designation with 1 teacher
