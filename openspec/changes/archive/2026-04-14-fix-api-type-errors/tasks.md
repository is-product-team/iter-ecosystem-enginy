## 1. Infrastructure & Build System

- [x] 1.1 Update `apps/api/tsconfig.json` to include `@iter/shared` in the build scope and fix rootDir.
- [x] 1.2 Update `packages/shared/index.ts` to use `.js` extension in the `theme` import. (Already done)

## 2. Systematic Prisma Renaming

- [ ] 2.1 Update all occurrences of `prisma.centre` to `prisma.center`.
- [ ] 2.2 Update all occurrences of `prisma.taller` to `prisma.workshop`.
- [ ] 2.3 Update all occurrences of `prisma.peticio` to `prisma.request`.
- [ ] 2.4 Update all occurrences of `prisma.assignacio` to `prisma.assignment`.
- [ ] 2.5 Update all occurrences of `prisma.inscripcio` to `prisma.enrollment`.
- [ ] 2.6 Update all occurrences of `prisma.alumne` to `prisma.student`.
- [ ] 2.7 Update all occurrences of `prisma.assistencia` to `prisma.attendance`.
- [ ] 2.8 Update all occurrences of `prisma.fase` to `prisma.phase`.
- [ ] 2.9 Update all occurrences of `prisma.competencia` to `prisma.competence`.

## 3. Structural & Relation Fixes

- [ ] 3.1 Refactor `apps/api/src/controllers/assignacio.controller.ts` to use the `teachers` relation instead of `teacher1_id`/`teacher2_id`.
- [ ] 3.2 Update `apps/api/src/controllers/assistencia.controller.ts` to fix `data_session` and `id_session` field names.
- [ ] 3.3 Fix missing Enum imports in `apps/api/src/controllers/enquesta.controller.ts`.
- [ ] 3.4 Update all repositories to align with new English-named Prisma types.

## 4. Verification

- [ ] 4.1 Run `npm run type-check` in `apps/api` and resolve remaining issues.
- [ ] 4.2 Run `npx vitest` to ensure no functional regressions.
