# Tasks: Fix Docker Build Dependency Sync

## Infra
- [x] Refactor `Dockerfile` to split `pruner` stage into `pruner-web` and `pruner-api`.
- [x] Update `builder-web` stage to consume from `pruner-web`.
- [x] Update `builder-api` stage to consume from `pruner-api`.

## Local Cleanup
- [x] Run `npm install` locally to sync the root `package-lock.json`. (COMPLETED)

## Verification
- [ ] Trigger GitHub Action `Deploy (Self-Hosted)` and verify successful build.
