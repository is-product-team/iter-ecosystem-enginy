import prisma from '../lib/prisma.js';
import { Request, Response } from 'express';

// GET: List all with pagination
export const getCenters = async (req: Request, res: Response) => {
  const { page = 1, limit = 100 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  try {
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
  } catch (error) {
    res.status(500).json({ error: 'Error obtaining centers' });
  }
};

// GET: One by ID
export const getCenterById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const center = await prisma.center.findUnique({
      where: { centerId: parseInt(id as string) }
    });
    if (!center) return res.status(404).json({ error: 'Center not found' });
    res.json(center);
  } catch (error) {
    res.status(500).json({ error: 'Error obtaining center' });
  }
};

// POST: Create
export const createCenter = async (req: Request, res: Response) => {
  try {
    const newCenter = await prisma.center.create({
      data: req.body
    });
    res.json(newCenter);
  } catch (error) {
    res.status(500).json({ error: 'Error creating center' });
  }
};

// PATCH: Update center
export const updateCenter = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const updated = await prisma.center.update({
      where: { centerId: parseInt(id as string) },
      data: req.body
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Error updating center' });
  }
};

// DELETE: Delete center
export const deleteCenter = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.center.delete({
      where: { centerId: parseInt(id as string) }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error deleting center' });
  }
};
