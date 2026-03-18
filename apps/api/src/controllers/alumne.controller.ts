import prisma from '../lib/prisma.js';
import { Request, Response } from 'express';

export const getAlumnes = async (req: Request, res: Response) => {
  const { centreId, role } = (req as any).user || {};

  try {
    const where: any = {};
    
    // Scoping: Admin sees all, others only their center
    if (role !== 'ADMIN') {
      if (!centreId) {
        return res.json([]); // No center assigned, no access
      }
      where.id_centre_procedencia = parseInt(centreId.toString());
    }

    const alumnes = await prisma.alumne.findMany({
      where,
      include: { centre_procedencia: true }
    });
    res.json(alumnes);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener alumnos' });
  }
};

export const createAlumne = async (req: Request, res: Response) => {
  const { centreId } = (req as any).user;
  try {
    const alumne = await prisma.alumne.create({
      data: {
        ...req.body,
        id_centre_procedencia: centreId ? parseInt(centreId) : req.body.id_centre_procedencia
      }
    });
    res.json(alumne);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear alumno' });
  }
};

export const updateAlumne = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { nom, cognoms, curs, id_centre_procedencia, idalu } = req.body;
  try {
    const alumne = await prisma.alumne.update({
      where: { id_alumne: parseInt(id as string) },
      data: req.body
    });
    res.json(alumne);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar alumno' });
  }
};

export const deleteAlumne = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.alumne.delete({
      where: { id_alumne: parseInt(id as string) }
    });
    res.json({ message: 'Alumno eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar alumno' });
  }
};