import prisma from '../lib/prisma.js';
import { Request, Response } from 'express';

// GET: Listar todos los sectores
export const getSectors = async (req: Request, res: Response) => {
  try {
    const sectors = await prisma.sector.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(sectors);
  } catch (error) {
    console.error("Error en sectorController.getSectors:", error);
    res.status(500).json({ error: 'Error al obtener los sectores' });
  }
};
