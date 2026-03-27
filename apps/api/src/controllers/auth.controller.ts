import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/user.repository.js';
import { env } from '../config/env.js';
import { mapUserResponse } from '../utils/user-mapper.js';

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // 1. Usamos el repositorio para buscar al usuario
    const user = await userRepository.findByEmail(email);

    if (!user) {
      return res.status(401).json({ error: 'Credencials invàlides' });
    }

    // 2. Verificar password
    console.log(`[Auth] Intento de login para: ${email}`);
    const validPassword = await bcrypt.compare(password, user.passwordHash);

    if (!validPassword) {
      console.warn(`[Auth] Password incorrecto para: ${email}`);
      return res.status(401).json({ error: 'Credencials invàlides' });
    }

    // 3. Generar JWT
    const token = jwt.sign(
      {
        userId: user.id_user,
        email: user.email,
        role: (user as any).role.roleName,
        centreId: user.id_center
      },
      env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // 4. Set Cookie (Web Security)
    res.cookie('token', token, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24h
    });

    res.json({
      token, // Mantener para compatibilidad móvil (Bearer)
      user: mapUserResponse(user)
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

export const logout = async (req: Request, res: Response) => {
  res.clearCookie('token');
  res.json({ message: 'Sessió tancada correctament' });
};

export const register = async (req: Request, res: Response) => {
  // ... (register logic remains same or can be updated if needed)
  // For now focusing on Login
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const user = await userRepository.findWithDetails((req as any).user.userId);
    if (!user) return res.status(404).json({ error: 'Usuari no trobat' });

    res.json(mapUserResponse(user));
  } catch (error) {
    console.error('Error en getMe:', error);
    res.status(500).json({ error: 'Error al obtenir dades' });
  }
};
