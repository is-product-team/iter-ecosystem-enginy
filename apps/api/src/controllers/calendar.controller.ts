import { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import { ROLES } from '@iter/shared';

export const getCalendarEvents = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { start, end } = req.query;
    const events = await fetchEventsForUser(
      { userId: user.userId, role: user.role, centreId: user.centreId },
      start as string,
      end as string
    );
    res.json(events);
  } catch (error) {
    console.error("[Calendar] Critical error in getCalendarEvents:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
