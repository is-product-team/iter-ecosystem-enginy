import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import * as authController from '../src/controllers/auth.controller.js';
import { authRateLimiter } from '../src/middlewares/rateLimiter.js';
import { userRepository } from '../src/repositories/user.repository.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../src/config/env.js';

// Setup a mini express app for testing
const app = express();
app.use(express.json());
app.use(cookieParser());
app.post('/auth/login', authRateLimiter, authController.login);

vi.mock('../src/repositories/user.repository.js', () => ({
  userRepository: {
    findByEmail: vi.fn(),
  },
}));

vi.mock('../src/config/env.js', () => ({
  env: {
    JWT_SECRET: 'test_secret_long_enough',
    NODE_ENV: 'test',
  },
}));

describe('Auth Security Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /auth/login - Cookie Security', () => {
    it('should return a Set-Cookie header with the token on successful login', async () => {
      const mockUser = {
        id_user: 1,
        email: 'test@example.com',
        password_hash: await bcrypt.hash('password123', 10),
        nom_complet: 'Test User',
        role: { nom_role: 'ADMIN' },
      };

      (userRepository.findByEmail as any).mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/auth/login')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(response.status).toBe(200);
      expect(response.headers['set-cookie']).toBeDefined();
      expect(response.headers['set-cookie'][0]).toContain('token=');
      expect(response.headers['set-cookie'][0]).toContain('HttpOnly');
    });
  });

  describe('Rate Limiting', () => {
    it('should return 429 after too many attempts', async () => {
      // Since express-rate-limit uses IP, and supertest might reuse or mock it, 
      // we just want to ensure the middleware is active.
      // In a real test environment, we might need to manipulate the store.
      
      const mockUser = {
        id_user: 1,
        email: 'test2@example.com',
        password_hash: await bcrypt.hash('password123', 10),
        nom_complet: 'Test User',
        role: { nom_role: 'ADMIN' },
      };
      (userRepository.findByEmail as any).mockResolvedValue(mockUser);

      // Make 5 requests (the limit)
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/auth/login')
          .send({ email: 'test2@example.com', password: 'password123' });
      }

      // 6th request should fail
      const response = await request(app)
        .post('/auth/login')
        .send({ email: 'test2@example.com', password: 'password123' });

      expect(response.status).toBe(429);
      expect(response.body.error).toContain('Massa intents');
    });
  });
});
