# Specification: Database Schema

This document outlines the data model for the Iter Ecosystem, powered by PostgreSQL and Prisma ORM.

## 1. Catalog & Structure

Models the educational offerings.

- **`Sector`**: High-level categorization (e.g., "Tecnologia", "Sanitat").
- **`Workshop` (`tallers`)**: Specific activities with duration, capacity, and modality (A, B, C).

## 2. Identity (Users & Centers)

Multi-tenant structure and role management.

- **`Center` (`centres`)**: Educational institutions.
- **`Role` (`rols`)**: System permissions (Admin, Coordinator, Teacher, Student).
- **`User` (`usuaris`)**: Authentication accounts.
- **`Teacher` (`professors`)**: Profile linking users to centers.
- **`Student` (`alumnes`)**: Unique identifiers (`idalu`), курs and attendance.

## 3. Operations (Requests & Assignments)

The core workflow of the ecosystem.

- **`Request` (`peticions`)**: Centers requesting specific workshops.
- **`Assignment` (`assignacions`)**: Finalized bookings with dates and group configuration.
- **`Session` (`sessions`)**: Individual time slots within an assignment.
- **`AssignmentChecklist`**: Operational status tracking (e.g., "Pedagogical Agreement signed").

## 4. Enrollment & Tracking

Student participation and attendance.

- **`Enrollment` (`inscripcions`)**: Links students to specific workshop assignments.
- **`Attendance` (`assistencia`)**: Real-time log of presence/absence per session.
- **`Evaluation` (`avaluacions`)**: Feedback from students, centers, and teachers.
- **`Competence` (`competencies`)**: KPIs used for assessment.

## 5. System Configuration

Infrastructure and notifications.

- **`Phase` (`fases`)**: Temporal stages of the educational program (e.g., "Enrollment Phase").
- **`CalendarEvent`**: Important dates linked to phases.
- **`Notification`**: System alerts for users and centers.
- **`Issue` (`incidencies`)**: Bug tracking and feedback reports.

---

## Entity-Relationship Overview (Logical)

```text
Center ───< User [Role]
  │           │
  │           └──< Teacher
  │
Center ───< Request >─── Workshop [Sector]
  │           │
  │           ▼
Center ───< Assignment >─── Workshop
              │
              ├──< Session >─── [Staff]
              │
              └──< Enrollment >─── Student
                     │
                     ├──< Attendance
                     └──< Evaluation
```
