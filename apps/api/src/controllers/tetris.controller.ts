import { Request, Response } from 'express';
import { AutoAssignmentService } from '../services/auto-assignment.service.js';
import { ROLES } from '@iter/shared';

const autoAssignmentService = new AutoAssignmentService();

export const triggerTetris = async (req: Request, res: Response) => {
  const { role } = req.user!;

  if (role !== ROLES.ADMIN) {
    return res.status(403).json({ error: 'Only admins can trigger the assignment process.' });
  }

  try {
    const result = await autoAssignmentService.generateAssignments();
    res.json({
      message: 'Tetris assignment completed successfully.',
      assignmentsCreated: (result as any).assignmentsCreated || 0
    });
  } catch (error) {
    console.error('Tetris Error:', error);
    res.status(500).json({ error: 'An error occurred during the Tetris assignment process.' });
  }
};
