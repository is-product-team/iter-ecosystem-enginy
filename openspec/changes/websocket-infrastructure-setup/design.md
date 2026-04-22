## Context

The Iter Ecosystem is a monorepo with multiple client applications (Web and Mobile) interacting with a centralized Express API. Currently, all communication is unidirectional (Request-Response). To support real-time features like phase changes, we are introducing a bidirectional communication layer using Socket.io.

## Goals / Non-Goals

**Goals:**
- Establish a scalable WebSocket infrastructure using Socket.io and Redis.
- Implement a secure authentication mechanism for socket connections via JWT.
- Modularize socket event handlers to keep the codebase maintainable.
- Enable immediate broadcast of "Academic Phase Changes" to all connected clients.

**Non-Goals:**
- Implementation of a full-featured chat system (this is infra-only for now).
- Migration of existing telemetry or GPS tracking to WebSockets (remain as HTTP/REST).
- Support for anonymous socket connections.

## Decisions

### 1. Technology Choice: Socket.io
- **Rationale**: While the `ws` library is lighter, Socket.io provides critical features like automatic reconnection, heartbeats, and room management out of the box, which are essential for a professional mobile application.
- **Alternatives**: Native WebSockets (too much boilerplate for reconnection and rooms).

### 2. Scalability: Redis Pub/Sub Adapter
- **Rationale**: To support horizontal scaling (multiple API instances), we need a synchronization layer. Redis is the industry standard for this in the Node.js ecosystem.
- **Architecture**:
```text
  [Client Mobile]    [Client Web]
        |                |
   (WebSocket)      (WebSocket)
        |                |
  [API Instance 1] [API Instance 2]
        |                |
        +-------[Redis]--+
```

### 3. Authentication: JWT in Handshake
- **Rationale**: Reusing the existing JWT logic ensures that we don't need a separate auth system. The token will be passed in the `auth` object during the initial connection.
- **Implementation**: A Socket.io middleware will verify the token using the existing `verifyToken` utility.

### 4. Code Organization
- **Structure**:
  - `apps/api/src/io/index.ts`: Server initialization and Redis setup.
  - `apps/api/src/io/handlers/`: Modular files for specific event logic.
  - `apps/api/src/io/middleware.ts`: Authentication logic.

## Risks / Trade-offs

- **[Risk] Connection Leakage** → [Mitigation] Implement strict disconnection logic and monitoring of active connections using Socket.io's built-in tools.
- **[Risk] Increased Infrastructure Complexity** → [Mitigation] Dockerize the Redis service to ensure a consistent environment across development and production.
- **[Trade-off] Overhead** → Socket.io has more overhead than native WS, but the benefits in developer productivity and reliability outweigh the cost for this project.
