import { rateLimit } from 'express-rate-limit';

/**
 * Rate limiter for authentication endpoints (login, register).
 * Limits each IP to 5 requests per 15 minutes.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    error: 'Too many attempts from this IP, please try again in 15 minutes.',
  },
});

/**
 * General rate limiter for the API.
 */
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // Limit each IP to 100 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
});
