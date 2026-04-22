## 1. Infrastructure Setup

- [x] 1.1 Add Redis service to `docker-compose.yml` and `docker-compose.prod.yml`
- [x] 1.2 Update `.env.example` with Redis environment variables (`REDIS_URL`)
- [x] 1.3 Install backend dependencies in `@iter/api`: `socket.io`, `@socket.io/redis-adapter`, `redis`
- [x] 1.4 Install client dependencies in `@iter/mobile` and `@iter/web`: `socket.io-client`

## 2. Backend Core Implementation

- [x] 2.1 Create the IO server initialization in `apps/api/src/io/index.ts`
- [x] 2.2 Configure the Redis Adapter for horizontal scalability
- [x] 2.3 Implement the JWT authentication middleware for Socket.io
- [x] 2.4 Update `apps/api/src/index.ts` to attach the Socket.io server to the HTTP server
- [x] 2.5 Add graceful shutdown logic for the Socket.io and Redis connections

## 3. Phase Change Integration

- [x] 3.1 Create a utility to emit the `phase_changed` event
- [x] 3.2 Integrate the emitter into the `PUT /api/phases/:id` route in `apps/api/src/routes/phase.routes.ts`
- [x] 3.3 Test the broadcast logic manually with multiple client connections

## 4. Client-side Implementation

- [x] 4.1 Create a `useSocket` hook or context in `apps/mobile` to manage the connection
- [x] 4.2 Implement the `phase_changed` listener in the Mobile app to refresh academic state
- [x] 4.3 (Optional) Add a toast notification in the UI when a phase change is received
- [x] 4.4 Repeat the socket connection logic for the Web application
