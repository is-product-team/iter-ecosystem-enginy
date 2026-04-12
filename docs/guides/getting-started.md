# Getting Started

Welcome to the **Iter Ecosystem**. This guide will help you set up your local environment and get the system running in minutes using the recommended Docker-first approach.

## 📋 Prerequisites

Before starting, ensure you have the following installed:
- **Docker & Docker Desktop** (v20.10+)
- **Git**
- **Node.js (v22)** - *Optional, only needed for local scripts or mobile development.*

## 🚀 Quick Start (Docker)

The fastest way to run the entire ecosystem (API, Web, Database) is using Docker Compose.

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/iter-ecosystem/enginy.git
    cd enginy
    ```

2.  **Environment Setup**:
    Copy the example environment files:
    ```bash
    cp apps/api/.env.example apps/api/.env
    cp apps/web/.env.example apps/web/.env
    ```

3.  **Boot the Ecosystem**:
    ```bash
    docker compose up --build
    ```
    *Note: The first run will automatically install dependencies and seed the database. This may take a few minutes.*

## 🔗 Service Map

Once the containers are running, you can access the services at the following URLs:

| Service | Local URL | Description |
| :--- | :--- | :--- |
| **Web UI** | [http://localhost:8002](http://localhost:8002) | Main Next.js frontend. |
| **API Server** | [http://localhost:3000](http://localhost:3000) | Express backend and health checks. |
| **DB Adminer** | [http://localhost:8080](http://localhost:8080) | Visual database manager (Credentials in `.env`). |

## 🛠️ Common Operations

### Seeding the Database
The database is seeded automatically on first run, but you can re-seed manually if needed:
```bash
docker compose exec setup npm run db:seed --filter=@iter/api
```

### Viewing Logs
To see logs from a specific service (e.g., the API):
```bash
docker compose logs -f api
```

### Mobile Development (Expo)
If you are working on the mobile app, run it natively on your host:
1. `cd apps/mobile`
2. `npm install`
3. `npx expo start`

---

> [!TIP]
> For detailed login credentials and roles, see the **[Auth & Roles](./auth-and-roles.md)** guide.
