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
    const { emailNotificationsEnabled, emailNotificationsFilter } = req.body;
    
    const updated = await prisma.user.update({
      where: { userId: req.user!.userId },
      data: { 
        emailNotificationsEnabled,
        emailNotificationsFilter
      }
    });

    res.json({ 
      success: true, 
      emailNotificationsEnabled: updated.emailNotificationsEnabled,
      emailNotificationsFilter: updated.emailNotificationsFilter
    });
  } catch (_error) {
    console.error('[Profile] Error updating settings:', _error);
    res.status(500).json({ error: 'Error updating profile settings' });
  }
};
