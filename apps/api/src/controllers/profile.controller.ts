import { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

export const getSyncToken = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { userId: req.user!.userId },
      select: { syncToken: true }
    });
    res.json({ syncToken: user?.syncToken });
  } catch (_error) {
    res.status(500).json({ error: 'Error fetching sync token' });
  }
};

export const generateSyncToken = async (req: Request, res: Response) => {
  try {
    const newToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    await prisma.user.update({
      where: { userId: req.user!.userId },
      data: { syncToken: newToken }
    });
    res.json({ syncToken: newToken });
  } catch (_error) {
    res.status(500).json({ error: 'Error generating sync token' });
  }
};

export const updateSettings = async (req: Request, res: Response) => {
  try {
    const { 
      emailNotificationsEnabled, 
      emailNotificationsFilter,
      fullName,
      email,
      phone 
    } = req.body;
    
    const userId = req.user!.userId;

    // Check if user exists first to provide a better error if the token is stale
    const currentUser = await prisma.user.findUnique({ where: { userId } });
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found. Please log out and log in again.' });
    }

    // If email is changing, check if it's already taken
    if (email && email !== currentUser.email) {
      const emailTaken = await prisma.user.findUnique({ where: { email } });
      if (emailTaken) {
        return res.status(400).json({ error: 'Email already in use' });
      }
    }

    const updated = await prisma.user.update({
      where: { userId },
      data: { 
        emailNotificationsEnabled: emailNotificationsEnabled !== undefined ? emailNotificationsEnabled : currentUser.emailNotificationsEnabled,
        emailNotificationsFilter: emailNotificationsFilter !== undefined ? emailNotificationsFilter : currentUser.emailNotificationsFilter,
        fullName: fullName || currentUser.fullName,
        email: email || currentUser.email,
        phone: phone !== undefined ? phone : currentUser.phone
      },
      include: {
        role: true,
        center: true
      }
    });

    res.json({ 
      success: true, 
      user: {
        userId: updated.userId,
        fullName: updated.fullName,
        email: updated.email,
        phone: updated.phone,
        photoUrl: updated.photoUrl,
        role: updated.role,
        center: updated.center,
        emailNotificationsEnabled: updated.emailNotificationsEnabled,
        emailNotificationsFilter: updated.emailNotificationsFilter
      }
    });
  } catch (_error) {
    console.error('[Profile] Error updating profile settings:', _error);
    res.status(500).json({ error: 'Error updating profile settings' });
  }
};
