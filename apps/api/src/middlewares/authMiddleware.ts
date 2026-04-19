import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ROLES } from '@iter/shared';
import prisma from '../lib/prisma.js';
import { env } from '../config/env.js';

const JWT_SECRET = env.JWT_SECRET;


export interface AuthRequest extends Request {
  user?: {
    userId: number;
    role: string;
    centerId?: number;
  };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  let token = authHeader && authHeader.split(' ')[1];

  // Try extracting from cookies if header is missing
  if (!token && req.cookies) {
    token = req.cookies.token;
  }

  if (!token) return res.status(401).json({ error: 'Token no proporcionado' });

  jwt.verify(token, JWT_SECRET, async (err: any, user: any) => {
    if (err) {
      return res.status(401).json({ error: 'Token inválido o expirado' });
    }

    // Verify user still exists in the database to handle deleted users/reset DBs
    try {
      const userExists = await prisma.user.findUnique({
        where: { userId: user.userId },
        select: { userId: true }
      });

      if (!userExists) {
        return res.status(401).json({ error: 'Sesión inválida: el usuario ya no existe' });
      }

      req.user = user;
      next();
    } catch (dbErr) {
      console.error('❌ [AUTH] Error checking user existence:', dbErr);
      return res.status(500).json({ error: 'Error interno en la autenticación' });
    }
  });
};

export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== ROLES.ADMIN) {

    return res.status(403).json({ error: 'Acceso denegado: Se requiere rol de Administrador' });
  }
  next();
};

export const isCoordinator = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== ROLES.COORDINATOR && req.user?.role !== ROLES.ADMIN) {
    return res.status(403).json({ error: 'Acceso denegado: Se requiere rol de Coordinador' });
  }
  next();
};
