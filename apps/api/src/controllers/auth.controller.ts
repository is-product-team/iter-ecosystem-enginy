// apps/api/src/controllers/auth.controller.ts
import prisma from '../lib/prisma.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import logger from '../lib/logger.js';

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  logger.info(`Intento de login para: ${email}`);

  try {
    logger.info('1. Consultando base de datos...');
    const usuari = await prisma.user.findUnique({
      where: { email },
      include: {
        rol: true,
        centre: true
      }
    });

    if (!usuari) {
      logger.info('Usero no encontrado');
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    logger.info('2. Comparando contraseña...');
    const validPassword = await bcrypt.compare(password, usuari.password_hash);
    if (!validPassword) {
      logger.info('Contraseña inválida');
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    logger.info('3. Firmando token...');
    const secret = process.env.JWT_SECRET || 'secreto_super_seguro_dev';
    const token = jwt.sign(
      {
        userId: usuari.id_user,
        role: usuari.role.nom_rol,
        centreId: usuari.id_center
      },
      secret,
      { expiresIn: '8h' }
    );

    logger.info('4. Preparando respuesta...');
    const { password_hash, ...userWithoutPass } = usuari;

    logger.info('5. Enviando JSON...');
    res.json({
      token,
      user: userWithoutPass
    });
    logger.info('Login exitoso');

  } catch (error) {
    logger.error('Login error CRITICAL:', error);
    res.status(500).json({
      error: 'Error en el servidor',
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
  }
};

export const register = async (req: Request, res: Response) => {
  // Lógica de registro para Admins o script inicial
  // ... similar al createWorkshop pero con bcrypt.hash(password, 10)
  res.status(501).json({ error: 'Not implemented' });
};