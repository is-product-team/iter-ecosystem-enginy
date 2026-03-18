import prisma from '../lib/prisma.js';
import { Request, Response } from 'express';

// GET: Listar todos con paginación
export const getCentres = async (req: Request, res: Response) => {
  const { page = 1, limit = 100 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const [centres, total] = await Promise.all([
    prisma.centre.findMany({
      skip,
      take,
    }),
    prisma.centre.count(),
  ]);

  res.json({
    data: centres,
    meta: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / take),
    },
  });
};

// GET: Uno por ID
export const getCentreById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const centre = await prisma.centre.findUnique({
    where: { id_centre: parseInt(id as string) }
  });
  if (!centre) return res.status(404).json({ error: 'Centro no encontrado' });
  res.json(centre);
};

// POST: Crear
export const createCentre = async (req: Request, res: Response) => {
  const newCentre = await prisma.centre.create({
    data: req.body
  });
  res.json(newCentre);
};

// PATCH: Actualizar centro
export const updateCentre = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updated = await prisma.centre.update({
    where: { id_centre: parseInt(id as string) },
    data: req.body
  });
  res.json(updated);
};

// DELETE: Eliminar centro
export const deleteCentre = async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.centre.delete({
    where: { id_centre: parseInt(id as string) }
  });
  res.status(204).send();
};