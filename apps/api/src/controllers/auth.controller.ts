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
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credencials invàlides' });
    }

    // 3. Generar JWT
    const token = jwt.sign(
      { 
        userId: user.id_user, 
        email: user.email, 
        role: user.role.nom_role,
        centreId: user.id_center 
      },
      env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // 4. Respuesta limpia usando el mapper
    res.json({
      token,
      user: mapUserResponse(user)
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
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
