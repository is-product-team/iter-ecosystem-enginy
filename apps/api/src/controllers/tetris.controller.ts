import { Request, Response } from 'express';
import { runTetris } from '../services/tetris.service.js';
import { ROLES } from '@iter/shared';

export const triggerTetris = async (req: Request, res: Response) => {
  const { role } = (req as any).user;

  if (role !== ROLES.ADMIN) {
    return res.status(403).json({ error: 'Only admins can trigger the assignment process.' });
  }

  try {
    const result = await runTetris();
    res.json({
      message: 'Tetris assignment completed successfully.',
      stats: result.stats,
      assignmentsCreated: result.createdAssignments.length
    });
  } catch (error) {
    console.error('Tetris Error:', error);
    res.status(500).json({ error: 'An error occurred during the Tetris assignment process.' });
  }
};
