import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import prisma from '../lib/prisma.js';
import { createNotificationInternal } from '../controllers/notification.controller.js';

const router = Router();

// Get all phases with their status
router.get('/', authenticateToken, async (_req: Request, res: Response) => {
  const phases = await prisma.phase.findMany({
    orderBy: { order: 'asc' },
    include: {
      _count: {
        select: { events: true }
      }
    }
  });
  
  // Return consistent structure
  res.json({
    data: phases,
    meta: {
      total: phases.length,
      page: 1,
      limit: phases.length,
      totalPages: 1
    }
  });
});

// Update a specific phase (Admin only)
router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { startDate, endDate, isActive, name, description } = req.body;
  const user = req.user!;

  if (user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Access denied: Only administrators can modify phases.' });
  }

  const updatedPhase = await prisma.phase.update({
    where: { phaseId: parseInt(id as string) },
    data: {
      name,
      description,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      isActive: isActive !== undefined ? isActive : undefined
    }
  });

  if (isActive === true) {
    await prisma.phase.updateMany({
      where: { phaseId: { not: parseInt(id as string) } },
      data: { isActive: false }
    });

    // Notify all centers about the start of the new phase (Broadcast)
    await createNotificationInternal({
      title: 'phase_start_title',
      message: JSON.stringify({
        key: 'phase_start_msg',
        params: { name: updatedPhase.name }
      }),
      type: 'PHASE',
      importance: 'URGENT',
      isBroadcast: true
    });
  }

  res.json(updatedPhase);
});

export default router;
