import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/user.repository.js';
import { env } from '../config/env.js';
import { mapUserResponse } from '../utils/user-mapper.js';
import prisma from '../lib/prisma.js';

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // 1. Use the repository to find the user
    const user = await userRepository.findByEmail(email);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 2. Verify password
    console.log(`[Auth] Login attempt for: ${email}`);
    const validPassword = await bcrypt.compare(password, user.passwordHash);

    if (!validPassword) {
      console.warn(`[Auth] Incorrect password for: ${email}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 3. Generate JWT
    const token = jwt.sign(
      {
        userId: user.userId,
        email: user.email,
        role: (user as any).role.roleName,
        centerId: user.centerId
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
      token, // Maintain for mobile compatibility (Bearer)
      user: mapUserResponse(user)
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const register = async (req: Request, res: Response) => {
  const { email, password, fullName, roleId, centerId } = req.body;

  try {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName,
        roleId: parseInt(roleId),
        centerId: centerId ? parseInt(centerId) : null
      },
      include: { role: true, center: true }
    });

    res.status(201).json(mapUserResponse(user));
  } catch (error) {
    console.error('Error during register:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const logout = async (req: Request, res: Response) => {
  res.clearCookie('token');
  res.json({ message: 'Session closed successfully' });
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const user = await userRepository.findWithDetails((req as any).user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json(mapUserResponse(user));
  } catch (error) {
    console.error('Error in getMe:', error);
    res.status(500).json({ error: 'Failed to retrieve user data' });
  }
};
