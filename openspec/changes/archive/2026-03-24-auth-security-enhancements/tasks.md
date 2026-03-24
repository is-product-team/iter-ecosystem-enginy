## 1. Backend Infrastructure & Dependencies

- [x] 1.1 Install dependencies: `npm install cookie-parser express-rate-limit` in `apps/api`
- [x] 1.2 Install types: `npm install -D @types/cookie-parser @types/supertest` in `apps/api`
- [x] 1.3 Update `apps/api/src/index.ts` to use `cookieParser()` middleware
- [ ] 1.4 Update `apps/api/src/config/env.ts` to include optional `COOKIE_DOMAIN` if needed

## 2. Security Middlewares

- [x] 2.1 Create `apps/api/src/middlewares/rateLimiter.ts` using `express-rate-limit`
- [x] 2.2 Apply rate limiter to `/auth/login` and `/auth/register` in `apps/api/src/routes/auth.routes.ts`
- [x] 2.3 Update `apps/api/src/middlewares/authMiddleware.ts` to prioritize token extraction from cookies

## 3. Auth Controller & Logic

- [x] 3.1 Update `login` in `apps/api/src/controllers/auth.controller.ts` to set `httpOnly` cookie
- [x] 3.2 Add a `logout` endpoint in `apps/api/src/controllers/auth.controller.ts` to clear the cookie
- [x] 3.3 Ensure hybrid support: Only use cookies if the request is from a web client (or support both Bearer and Cookie)

## 4. Frontend Integration (Web)

- [x] 4.1 Update `apps/web/services/api.ts` to set `withCredentials: true` in Axios defaults
- [x] 4.2 Refactor `apps/web/lib/auth.ts` to remove `localStorage.setItem('token', ...)`
- [x] 4.3 Refactor `apps/web/context/AuthContext.tsx` to remove token-related effects

## 5. Verification & Testing

- [x] 5.1 Add integration test in `apps/api/__tests__/auth.security.test.ts` for rate limiting
- [x] 5.2 Add integration test for cookie presence in login response
- [x] 5.3 Manual verification of the web login flow
