# Shared Consistency Specification

This specification defines the requirements for centralized domain logic and linguistic consistency across the Iter Ecosystem monorepo.

## 1. Domain Constants

#### Requirement: Centralized Statuses
All domain-specific statuses (Request, Assignment, Attendance) MUST be defined in `@iter/shared` and exported as immutable constants.

#### Scenario: Comparing Statuses in UI
- **WHEN** A UI component needs to display or compare a request status
- **THEN** It MUST use a constant from `@iter/shared` instead of a hardcoded string.

## 2. Linguistic Standards

#### Requirement: Catalan as Primary Language
All user-facing strings, including notifications and error messages, MUST be in Catalan to ensure a unified user experience.

#### Scenario: Server Notification
- **WHEN** The system triggers an automated notification (e.g., via `ReminderService`)
- **THEN** The message and title MUST be in Catalan and free of typos.
