# Specification: Core Architecture

Iter Ecosystem follows a monorepo architecture managed by Turborepo, designed for scalability and ease of deployment in educational environments.

## System Overview

The system consists of three main applications and shared packages:

- **Web App (`apps/web`)**: Next.js application for administration and client interface.
- **API Backend (`apps/api`)**: Express server providing the core business logic and data access via Prisma.
- **Mobile App (`apps/mobile`)**: Expo-based mobile application for teachers and users.
- **Shared Package (`packages/shared`)**: Common types, utilities, and logic shared across the ecosystem.

## Infrastructure

- **Docker Compose**: Orchestrates the services (`db`, `setup`, `api`, `web`).
- **Nginx**: Acts as a reverse proxy for routing and SSL termination.
- **Prisma**: Handles database schema migrations and type-safe data access.

## Data Model

The core domain involves:
- **Sectors & Workshops**: Categorization of educational offerings.
- **Centers & Users**: Multi-tenant structure for different educational institutions.
- **Requests & Assignments**: The lifecycle of workshop bookings and scheduling.
- **Enrollments & Attendance**: Tracking student participation and evaluation.
