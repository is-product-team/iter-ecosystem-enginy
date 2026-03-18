import prisma from '../lib/prisma.js';
import { Request, Response } from 'express';

export const getStudents = async (req: Request, res: Response) => {
  const { centreId, role } = req.user! || {};

  try {
    const where: any = {};
    
    // Scoping: Admin sees all, others only their center
    if (role !== 'ADMIN') {
      if (!centreId) {
        return res.json([]); // No center assigned, no access
      }
      where.id_center_origin = parseInt(centreId.toString());
    }

    const students = await prisma.student.findMany({
      where,
      include: { center_origin: true }
    });
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtenir els alumnes' });
  }
};

export const createStudent = async (req: Request, res: Response) => {
  const { centreId } = req.user!;
  try {
    const student = await prisma.student.create({
      data: {
        ...req.body,
        id_center_origin: centreId ? centreId : req.body.id_center_origin
      }
    });
    res.json(student);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear l\'alumne' });
  }
};

export const updateStudent = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const student = await prisma.student.update({
      where: { id_student: parseInt(id as string) },
      data: req.body
    });
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualitzar l\'alumne' });
  }
};

export const deleteStudent = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.student.delete({
      where: { id_student: parseInt(id as string) }
    });
    res.json({ message: 'Student eliminat' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar l\'alumne' });
  }
};
