import { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

export const getSyncToken = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { userId: req.user!.userId },
      select: { syncToken: true }
    });
    res.json({ syncToken: user?.syncToken });
  } catch (error) {
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
  } catch (error) {
    res.status(500).json({ error: 'Error generating sync token' });
  }
};
