import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import prisma from '../lib/prisma.js';
import { createNotificationInterna } from '../controllers/notificacio.controller.js';

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
    return res.status(403).json({ error: 'Accés denegat: Només els administradors poden modificar les fases.' });
  }

  const updatedPhase = await prisma.phase.update({
    where: { id_phase: parseInt(id as string) },
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
      where: { id_phase: { not: parseInt(id as string) } },
      data: { isActive: false }
    });

    // Notificar a todos los centros del inicio de la nueva fase
    await createNotificationInterna({
      titol: `Nova Phase: ${updatedPhase.name}`,
      missatge: `S'ha iniciat la fase de "${updatedPhase.name}". Consulta el calendari per a més detalls.`,
      tipus: 'FASE',
      importancia: 'URGENT'
    });
  }

  res.json(updatedPhase);
});

export default router;
