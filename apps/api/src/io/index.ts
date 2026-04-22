import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { Server as HttpServer } from 'http';
import logger from '../lib/logger.js';
import { env } from '../config/env.js';
import { socketAuthMiddleware } from './middleware.js';

let io: Server;

export async function initIO(httpServer: HttpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: env.CORS_ORIGIN,
      credentials: true,
      methods: ['GET', 'POST']
    },
    // Add health check/ping timeouts for stability
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Redis Adapter Setup
  const pubClient = createClient({ url: env.REDIS_URL });
  const subClient = pubClient.duplicate();

  try {
    await Promise.all([pubClient.connect(), subClient.connect()]);
    io.adapter(createAdapter(pubClient, subClient));
    logger.info('📡 Socket.io: Redis Adapter connected');
  } catch (error) {
    logger.error(`📡 Socket.io: Redis Connection Error: ${error instanceof Error ? error.message : error}`);
    // Fallback to local memory adapter in dev if Redis is unavailable
    if (env.NODE_ENV === 'production') {
      throw error;
    }
    logger.warn('📡 Socket.io: Falling back to memory adapter (Dev only)');
  }

  // Apply authentication middleware
  io.use(socketAuthMiddleware);

  io.on('connection', (socket) => {
    const user = (socket as any).user;
    logger.info(`🔌 User connected: ${user.email} (${socket.id})`);

    // Join a room for the user to allow targeted events
    socket.join(`user:${user.userId}`);
    
    // Join a room for their role
    socket.join(`role:${user.role}`);

    socket.on('disconnect', (reason) => {
      logger.info(`❌ User disconnected: ${user.email} (${reason})`);
    });
  });

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error('Socket.io not initialized. Call initIO first.');
  }
  return io;
}

/**
 * Utility to close connections gracefully
 */
export async function closeIO() {
  if (io) {
    await new Promise<void>((resolve) => {
      io.close(() => {
        logger.info('📡 Socket.io: Server closed');
        resolve();
      });
    });
  }
}
