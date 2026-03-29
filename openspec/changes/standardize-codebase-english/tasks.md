## 1. Prisma & Shared Refactor

- [x] 1.1 Update `apps/api/prisma/schema.prisma` to rename all Models to English PascalCase and Fields to English camelCase using `@map` and `@@map`.
- [x] 1.2 Run `npx prisma generate` in the API package to regenerate the Prisma client.
- [x] 1.3 Update `shared/index.ts` Zod schemas to use the new English field names.
- [x] 1.4 Update `shared/index.ts` constants (e.g., `CALENDARI` to `CALENDAR`) and functions (e.g., `esEmailValido` to `isEmailValid`).
- [x] 1.5 Update `apps/api/src/lib/prisma.ts` (or equivalent) to reflect any changes in the Prisma client structure.

## 2. API Services & Controllers Refactor

- [x] 2.1 Refactor `apps/api/src/services/` to use the new English Prisma model and field names.
- [x] 2.2 Refactor `apps/api/src/controllers/` to use English variable names and standardized English API response keys.
- [x] 2.3 Update `apps/api/src/routes/` to reflect any naming changes in the controllers and resource paths.
- [x] 2.4 Update the Excel import controller (`apps/api/src/controllers/enrollment.controller.ts`) to explicitly map Catalan/Spanish headers to internal English fields.
- [x] 2.5 Rename API controller and service files from Catalan to English (e.g., `taller.controller.ts` -> `workshop.controller.ts`).

## 3. Web Frontend Refactor

- [x] 3.1 Update `apps/web/services/api.ts` (or equivalent) to match the new English API contracts.
- [x] 3.2 Update React components in `apps/web/components/` to use the new English property names.
- [x] 3.3 Update pages in `apps/web/app/` to handle the new data structures.
- [x] 3.4 Perform a localization audit to ensure all hardcoded Catalan/Spanish UI text is moved to i18n JSON files.

## 4. Mobile Frontend Refactor

- [x] 4.1 Update `apps/mobile/services/api.ts` to match the new English API contracts and standardized snake_case/camelCase.
- [x] 4.2 Update mobile components in `apps/mobile/components/` to use the new English property names.
- [x] 4.3 Update mobile screens in `apps/mobile/app/` to handle the new data structures.
- [x] 4.4 Perform a localization audit for the mobile app, ensuring 100% i18n usage.

## 5. Validation & Testing

- [x] 5.1 Run `npm run lint` and `npm run type-check` across the entire monorepo to find any missed references.
- [x] 5.2 Verify that the API starts and responds correctly to the new English-named endpoints.
- [x] 5.3 Verify that the Excel import still works with Catalan headers.
- [x] 5.4 Manually verify the Web and Mobile apps for any UI regressions or linguistic inconsistencies.
