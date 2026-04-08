# Specification: English Localization Refactor

## Overview
This specification defines the requirements for translating the whole ecosystem (Web, Mobile, and API) to English to support international expansion and standardize the codebase.

## Requirement 1: Web Application (Next-intl)
- New file: `messages/en.json` containing complete English translations for all keys.
- Update `middleware.ts` to include `en` as an accepted locale and potentially set it as default.
- All client-side components must use the `useTranslations` hook with English keys.

## Requirement 2: Mobile Application (Expo i18n)
- New file: `locales/en.json` for Expo-localization.
- All mobile screens must display English by default.

## Requirement 3: API Logic & Error Messages
- All hardcoded Spanish/Catalan error messages in controllers and middlewares must be refactored to English.
- The `AssignmentSolver` log outputs and console warnings must be in English.

## Requirement 4: Database Seed Data
- Update `prisma/seed.ts` to use English names for Workshops, Roles, and Centers (where appropriate).
- Existing records for "Transversal" competence should be renamed to "Transversal Competence" or simply "Transversal".
