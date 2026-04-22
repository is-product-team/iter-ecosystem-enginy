import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import prisma from '../lib/prisma.js';
import logger from '../lib/logger.js';

const JWT_SECRET = env.JWT_SECRET;

/**
 * Socket.io Middleware to authenticate connections via JWT
 * Token can be sent in handshake.auth.token or headers.authorization
 */
export const socketAuthMiddleware = async (socket: Socket, next: (err?: Error) => void) => {
  try {
    const auth = socket.handshake.auth;
    const header = socket.handshake.headers.authorization;
    
    // Support both direct token and Bearer format
    let token = auth.token || (header?.startsWith('Bearer ') ? header.slice(7) : header);

    if (!token) {
      logger.warn(`🔌 Socket Auth: No token provided from ${socket.id}`);
      return next(new Error('Authentication error: Token not provided'));
    }

    // Verify JWT
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    if (!decoded || !decoded.userId) {
      return next(new Error('Authentication error: Invalid payload'));
    }

    // Verify user exists and is active in DB
    const user = await prisma.user.findUnique({
      where: { userId: decoded.userId },
      select: { 
        userId: true, 
        role: true, 
        email: true,
        centerId: true
      }
    });

    if (!user) {
      logger.warn(`🔌 Socket Auth: User ${decoded.userId} no longer exists`);
      return next(new Error('Authentication error: User not found'));
    }

    // Attach user data to the socket object for future use in handlers
    (socket as any).user = user;
    
    next();
  } catch (error) {
    logger.error(`🔌 Socket Auth Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    next(new Error('Authentication error: Invalid or expired token'));
  }
};
