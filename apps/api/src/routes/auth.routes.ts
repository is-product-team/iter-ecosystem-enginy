import express from 'express';
const router = express.Router();
import * as authController from '../controllers/auth.controller.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { authRateLimiter } from '../middlewares/rateLimiter.js';

// POST /api/auth/register - Register a new user (usually Admin or seed script)
router.post('/register', authRateLimiter, authController.register);

// POST /api/auth/login - Login
router.post('/login', authRateLimiter, authController.login);

// POST /api/auth/logout - Logout
router.post('/logout', authController.logout);

// GET /api/auth/me - Get current user data (requires token)
router.get('/me', authenticateToken, authController.getMe);

export default router;