# Architecture: System Overview

The Iter Ecosystem is a mono-repository managed by **Turborepo**, designed for high scalability, performance, and developer efficiency.

## 1. High-Level Architecture

The system is divided into three main applications and shared logic:

- **Web App (`apps/web`)**: Admin and Client interface built with **Next.js (App Router)** and Tailwind CSS.
- **API Backend (`apps/api`)**: Node.js/Express server using **Prisma ORM** and PostgreSQL.
- **Mobile app (`apps/mobile`)**: Multi-platform (iOS/Android) application built with **Expo/React Native**.
- **Shared Package (`packages/shared`)**: Single source of truth for design tokens, Zod schemas, and TypeScript types.

## 2. Infrastructure Stack

- **Containerization**: Entire development stack runs on **Docker**.
- **Orchestration**: **Turborepo** handles the pipeline for builds and dev servers.
- **Database**: **PostgreSQL 15** for relational data persistence.
- **Deployment**: Automated via GitHub Actions with a self-hosted runner on Proxmox LXC.

## 3. Core Capabilities

The ecosystem provides advanced educational management features:
- **AI-Driven Scheduling**: Automated assignment of workshops to centers.
- **Vision AI Validation**: Automated checking of signed legal documents.
- **Natural Language Evaluations**: NLP-assisted presence and competency tracking.
- **High-Frequency Telemetry**: (Planned) Real-time GPS tracking for field activities.

## 4. Security Model

- **Authentication**: JWT-based stateless authentication.
- **RBAC**: Role-Based Access Control (Admin, Coordinator, Teacher, Center).
- **Proxy**: All traffic is routed through a global Nginx reverse proxy with SSL managed via Cloudflare Tunnel.

---

*To start developing, refer to the [Getting Started Guide](../guides/getting-started.md).*
