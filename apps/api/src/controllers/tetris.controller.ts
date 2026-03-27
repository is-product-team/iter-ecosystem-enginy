import { Request, Response } from 'express';
import { TetrisService } from '../services/tetris.service.js';
import { ROLES } from '@iter/shared';

const tetrisService = new TetrisService();

export const triggerTetris = async (req: Request, res: Response) => {
  const { role } = req.user!;

  if (role !== ROLES.ADMIN && role.name !== ROLES.ADMIN) {
    return res.status(403).json({ error: 'Only admins can trigger the assignment process.' });
  }

  try {
    const result = await tetrisService.processVacancies();
    res.json({
      message: 'Tetris assignment completed successfully.',
      resolved: result.resolved
    });
  } catch (error) {
    console.error('Tetris Error:', error);
    res.status(500).json({ error: 'An error occurred during the Tetris assignment process.' });
  }
};
