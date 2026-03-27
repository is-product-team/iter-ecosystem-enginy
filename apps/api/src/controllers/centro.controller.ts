import prisma from '../lib/prisma.js';
import { Request, Response } from 'express';

// GET: Listar todos con paginación
export const getCenters = async (req: Request, res: Response) => {
  const { page = 1, limit = 100 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const [centers, total] = await Promise.all([
    prisma.center.findMany({
      skip,
      take,
    }),
    prisma.center.count(),
  ]);

  res.json({
    data: centers,
    meta: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / take),
    },
  });
};

// GET: Uno por ID
export const getCenterById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const centre = await prisma.center.findUnique({
    where: { centerId: parseInt(id as string) }
  });
  if (!centre) return res.status(404).json({ error: 'Centro no encontrado' });
  res.json(centre);
};

// POST: Crear
export const createCenter = async (req: Request, res: Response) => {
  const newCenter = await prisma.center.create({
    data: req.body
  });
  res.json(newCenter);
};

// PATCH: Actualizar centro
export const updateCenter = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updated = await prisma.center.update({
    where: { centerId: parseInt(id as string) },
    data: req.body
  });
  res.json(updated);
};

// DELETE: Eliminar centro
export const deleteCenter = async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.center.delete({
    where: { centerId: parseInt(id as string) }
  });
  res.status(204).send();
};