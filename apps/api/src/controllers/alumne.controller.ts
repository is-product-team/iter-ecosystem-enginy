import { Request, Response } from 'express';
import { studentRepository } from '../repositories/student.repository.js';

export const getStudents = async (req: Request, res: Response) => {
  const { centreId, role } = req.user! || {};

  try {
    let students;
    if (role === 'ADMIN') {
      students = await studentRepository.findAll({ include: { center_origin: true } });
    } else if (centreId) {
      students = await studentRepository.findByCenter(parseInt(centreId.toString()));
    } else {
      return res.json([]);
    }
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtenir els alumnes' });
  }
};

export const createStudent = async (req: Request, res: Response) => {
  const { centreId } = req.user!;
  try {
    const student = await studentRepository.create({
      ...req.body,
      center_origin: centreId ? { connect: { id_center: centreId } } : undefined
    });
    res.status(201).json(student);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear l\'alumne' });
  }
};

export const updateStudent = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const { id_student, ...updateData } = req.body;
    const student = await studentRepository.update(parseInt(String(id)), updateData);
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualitzar l\'alumne' });
  }
};

export const deleteStudent = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await studentRepository.delete(parseInt(String(id)));
    res.json({ message: 'Alumne eliminat' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar l\'alumne' });
  }
};
