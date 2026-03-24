import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/user.repository.js';
import { env } from '../config/env.js';

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
        role: (user as any).role.nom_roleee,
        centreId: user.id_center 
      },
      env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // 4. Respuesta limpia (Omitimos el hash del password por seguridad)
    const { password_hash, ...userSafe } = user;

    // 5. Set Cookie (Web Security)
    res.cookie('token', token, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24h
    });

    res.json({
      token, // Mantener para compatibilidad móvil (Bearer)
      user: userSafe
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
  const { email, password, nom_complet, id_role, id_center } = req.body;

  try {
    // 1. Verificar si el usuario ya existe
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'L\'usuari ja existeix' });
    }

    // 2. Hash del password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // 3. Crear usuario
    const user = await userRepository.create({
      email,
      password_hash,
      nom_complet,
      role: { connect: { id_role: parseInt(id_role) } },
      center: id_center ? { connect: { id_center: parseInt(id_center) } } : undefined,
    });

    res.status(201).json({ message: 'Usuari registrat correctament', userId: user.id_user });
  } catch (error) {
    console.error('Error en register:', error);
    res.status(500).json({ error: 'Error al registrar l\'usuari' });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const user = await userRepository.findWithDetails((req as any).user.userId);
    if (!user) return res.status(404).json({ error: 'Usuari no trobat' });

    const { password_hash, ...userSafe } = user;
    res.json(userSafe);
  } catch (error) {
    console.error('Error en getMe:', error);
    res.status(500).json({ error: 'Error al obtenir dades' });
  }
};
