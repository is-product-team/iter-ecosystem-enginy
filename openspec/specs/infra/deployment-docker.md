# Specification: Infrastructure & Deployment

This document describes the containerized architecture, network topology, and CI/CD pipelines used to deploy the Iter Ecosystem in a production environment.

## 1. Infrastructure Overview

The application is hosted on a Proxmox LXC container (`192.168.1.39`) running Ubuntu.

- **Containerization**: Docker & Docker Compose.
- **Network**: All services are attached to an external bridge network named `red_proxy`.
- **Operating System**: Node 22 Alpine (base image).

## 2. Docker Architecture

The project uses a **multi-stage Dockerfile** to optimize build times and image sizes.

### Build Stages
1. **Base**: Installs Node 22 and essential libraries (`libc6-compat`, `openssl`).
2. **Pruner**: Uses `turbo prune` to extract only the necessary code for a specific target (Web or API).
3. **Builder**: Installs dependencies and runs the production build (`next build` or `tsc`).
4. **Runner**: 
   - **Web**: Uses Next.js `standalone` mode to exclude unnecessary `node_modules`.
   - **API**: Minimal image with compiled `dist`, `node_modules`, and Prisma client.

### Container Management
The production environment is managed via `docker-compose.prod.yml`, ensuring:
- **Unique Container Names**: `iter_web`, `iter_api`.
- **Resource Recovery**: `docker image prune` is executed after each deployment to free up disk space in the LXC.

## 3. Network & Proxy Strategy

A global **Nginx Reverse Proxy** manages all incoming traffic.

- **Routing**:
  - `https://projects.kore29.com/iter` -> Proxied to `iter_web:3000`.
  - `https://projects.kore29.com/iter/api` -> Proxied to `iter_api:3000`.
- **SSL/TLS**: SSL termination is handled by **Cloudflare Tunnel** (`cloudflared`). The internal Nginx only listens on port 80, receiving secure traffic from the tunnel.
- **Isolation**: No service ports (3000, 5432, etc.) are exposed directly to the internet; only Nginx is accessible.

## 4. CI/CD Pipeline

The deployment is automated via **GitHub Actions** using a **Self-Hosted Runner**.

### Workflow: `Manual Deploy (Self-Hosted)`
- **Trigger**: `workflow_dispatch` (Manual trigger from GitHub UI).
- **Environment Management**: Environment variables are injected from GitHub Secrets into `apps/api/.env.production` and `apps/web/.env.production`.
- **Execution**:
  1. `actions/checkout`: Fetches the latest code.
  2. `docker compose -f docker-compose.prod.yml up -d --build`: Rebuilds and restarts containers.
  3. `docker image prune -f`: Cleans up legacy images.
