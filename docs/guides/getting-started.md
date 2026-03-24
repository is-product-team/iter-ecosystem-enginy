# Developer Guide: Getting Started

Welcome to the **Iter Ecosystem** development team. This guide will help you set up your local environment and understand the core tools used in our daily workflow.

## 1. Prerequisites

Ensure you have the following installed on your host machine:
- **Docker & Docker Compose**: For running the backend and database.
- **Node.js (v22)**: For local scripts and mobile development.
- **Git**: For version control.

## 2. Initial Setup

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/iter-ecosystem/enginy.git
    cd enginy
    ```
2.  **Environment Variables**:
    Copy the example environment files into the appropriate app directories.
    ```bash
    cp apps/api/.env.example apps/api/.env
    cp apps/web/.env.example apps/web/.env
    ```
3.  **Boot the System**:
    You can run the ecosystem either via Docker (recommended for full stack) or natively using Turborepo.

    **Option A: Docker Compose (Full Stack)**
    ```bash
    docker compose up
    ```
    *Note: The first run will take some time as the `setup` service installs dependencies and initializes the database.*

    **Option B: Local Native (Turborepo)**
    If you prefer to run the Node servers natively on your machine:
    1. Install all monorepo dependencies:
       ```bash
       npm install
       ```
    2. Initialize the Postgres database (ensure you have a local standard DB running as specified in `.env`):
       ```bash
       npm run db:push
       npm run db:generate
       npm run db:seed
       ```
    3. Start the Web and API servers concurrently:
       ```bash
       npm run dev
       ```

## 3. Development Workflow

### Web & API
The Web (Next.js) and API (Express) services run inside Docker with hot-reloading enabled.
- **API URL**: [http://localhost:3000](http://localhost:3000)
- **Web UI URL**: [http://localhost:8002](http://localhost:8002)

### Mobile (Expo)
The mobile application runs on your host machine to facilitate connection with real devices or simulators.
1.  Navigate to the mobile directory: `cd apps/mobile`.
2.  Install dependencies: `npm install`.
3.  Start Expo: `npx expo start`.
4.  Scan the QR code with the **Expo Go** app.

## 4. Database Management

We use **Prisma** as our ORM. 
- **DB Viewer**: A local Adminer instance is available at [http://localhost:8080](http://localhost:8080).
- **Schema Updates**: To apply schema changes during development:
    ```bash
    docker compose exec api npx prisma db push
    ```

## 5. Coding Standards

- **TypeScript**: Mandatory for all packages.
- **Design Tokens**: Never hardcode colors. Refer to `packages/shared/theme.ts`.
- **OpenSpec**: Every feature must follow the [OpenSpec Workflow](./openspec-workflow.md).

---

*For detailed architectural information, refer to the [System Overview](../architecture/system-overview.md).*
