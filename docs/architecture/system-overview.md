# System Overview

The **Iter Ecosystem** is a modern, full-stack platform built with a monorepo architecture. It connects educational centers, coordinators, and teachers through a unified data layer and specialized client applications.

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Monorepo** | [Turborepo](https://turbo.build/) + NPM Workspaces |
| **Backend** | [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/) |
| **Frontend** | [Next.js 15](https://nextjs.org/) (App Router) |
| **Mobile** | [React Native](https://reactnative.dev/) + [Expo](https://expo.dev/) |
| **Database** | [PostgreSQL](https://www.postgresql.org/) + [Prisma ORM](https://www.prisma.io/) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) (Strict Mode) |

## 📁 Directory Structure

```text
.
├── apps/
│   ├── api/          # Express Backend (Business logic, DB interaction)
│   ├── web/          # Next.js Frontend (Institutional & Dashboard)
│   └── mobile/       # React Native / Expo App (Teacher field work)
├── shared/           # Common types, roles, and schema-based constants
├── docs/             # This documentation suite
├── openspec/         # AI-driven feature specifications (OPSX)
└── docker-compose.yml# Local infrastructure orchestration
```

## 🏗️ High-Level Architecture

### Core Data Flows

#### 1. Workshop Enrollment Lifecycle
The journey from a center's request to a validated student enrollment.

```mermaid
sequenceDiagram
    participant Center as Center (Admin)
    participant API as Backend API
    participant AI as Vision AI
    participant DB as PostgreSQL

    Center->>API: POST /requests (Apply for Workshop)
    API->>DB: Status: PENDING
    Note over API: Scheduling Engine (Tetris) runs
    API->>DB: Status: PROVISIONAL / PUBLISHED
    Center->>API: Upload Signed Agreement (PDF)
    API->>AI: analyzeDocument(PDF)
    AI-->>API: { signatureFound: true, valid: true }
    API->>DB: Status: VALIDATED
```

#### 2. Real-Time Feedback & Attendance
Interaction between the professor's mobile app and AI services.

```mermaid
graph TD
    App[Mobile App] -- Voice/Text --> API[Express API]
    API -- Analysis --> NLP[NLP Service]
    NLP -- Status/Score --> API
    API -- Update --> DB[(PostgreSQL)]
    DB -- Push Notification --> App
```

## 🧱 Service Responsibilities

1.  **Core API**: The `api` service handles all authentication, data validation, and business logic. It exposes a RESTful interface.
2.  **Shared Package**: The `shared` package is a key component that exports TypeScript interfaces and constants (like `ROLES` or `PHASES`) used by both the API and the Web/Mobile clients.
3.  **Client Applications**:
    - **Web**: Focused on administrative tasks (Coordinators and Admins).
    - **Mobile**: Focused on operational tasks (Teachers marking attendance).

---

> [!NOTE]
> For detailed information on the database structure, refer to the **[Data Model](./data-model.md)** guide.
