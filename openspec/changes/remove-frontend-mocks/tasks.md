## 1. Mobile Service Cleanup

- [x] 1.1 Remove the axios response interceptor in `apps/mobile/services/api.ts` that provides mock data for teachers.
- [x] 1.2 Delete mock constants (`MOCK_QUESTIONNAIRE_MODEL`, `MOCK_STUDENTS`, `MOCK_WORKSHOP`) and helper `isKnownTeacher` in `apps/mobile/services/api.ts`.
- [x] 1.3 Ensure `getQuestionnaireModels` and `getQuestionnaireModel` return real backend data without local fallbacks.

## 2. Web Admin Reports Refactor

- [x] 2.1 Replace hardcoded "Workshops Completed" and "Student Participation" metrics in `apps/web/app/[locale]/reports/page.tsx` with dynamic data from `evaluationService`.
- [x] 2.2 Remove the static "Top Rated Workshops" array in `apps/web/app/[locale]/reports/page.tsx` and connect it to real evaluation metrics.
- [x] 2.3 Implement "No Data" empty states for reports when the database is empty.

## 3. Web Monitoring & UI Cleanup

- [x] 3.1 Replace the hardcoded `incidents = 0` value in `apps/web/app/[locale]/center/monitoring/page.tsx` with a real count from `assignmentService` or a "TBD" status.
- [x] 3.2 Audit `apps/web/components/ResourcesWidget.tsx` and ensure resources are either fetched or marked as placeholders clearly.


## 4. Verification & Testing

- [x] 4.1 Run the database seed (`npm run db:seed` or equivalent) to populate real test data.
- [x] 4.2 Verify that the Mobile App displays real questionnaires from the database for teacher users.
- [x] 4.3 Verify that the Web Admin dashboard correctly reflects the seeded data without using frontend fallbacks.
