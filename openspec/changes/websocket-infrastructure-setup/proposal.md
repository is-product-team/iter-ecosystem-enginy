## Why

The Iter Ecosystem requires a robust real-time communication layer to improve user experience and operational efficiency. Currently, critical updates like academic phase changes or system notifications rely on manual refreshes or database polling, leading to delays and inconsistent state across the Web and Mobile applications. Implementing WebSockets provides a professional, scalable foundation for instant synchronization.

## What Changes

- **Infrastructure Initialization**: Add a Redis container to the Docker orchestration and install Socket.io with its Redis adapter in the API service to ensure horizontal scalability.
- **Secure Handshake**: Implement a WebSocket middleware to authenticate connections using the existing JWT-based authorization system.
- **Real-time Phase Synchronization**: Integrate a real-time hook into the phase management system so that whenever an academic phase is activated, all connected clients (Web and Mobile) receive an immediate update.
- **Scalable Event Bus**: Use Redis Pub/Sub to synchronize WebSocket events across multiple server instances, ensuring that every user receives updates regardless of which server instance they are connected to.

## Capabilities

### New Capabilities
- `websocket-core`: Implementation of the Socket.io server with Redis adapter and JWT authentication middleware.
- `real-time-notifications`: A generic system to broadcast events to specific rooms or all users, starting with phase change notifications.

### Modified Capabilities
- `academic-phases`: Requirements for phase transitions are updated to include a mandatory real-time broadcast to all active clients upon activation.

## Impact

- **Infrastructure**: New Redis service in `docker-compose.yml`.
- **Backend (API)**: New dependencies (`socket.io`, `@socket.io/redis-adapter`, `redis`), initialization of the IO server, and integration with the phase controller.
- **Mobile/Web**: New dependencies (`socket.io-client`) and implementation of a global socket listener to handle real-time state updates.
