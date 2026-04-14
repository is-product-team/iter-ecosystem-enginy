import { Request, Response } from 'express';
import { studentRepository } from '../repositories/student.repository.js';

export const getStudents = async (req: Request, res: Response) => {
  const { centerId, role } = req.user! || {};

  try {
    let students;
    if (role === 'ADMIN') {
      students = await studentRepository.findAll({ include: { centerOrigin: true } });
    } else if (centerId) {
      students = await studentRepository.findByCenter(centerId);
    } else {
      return res.json([]);
    }
    res.json(students);
  } catch (_error) {
    res.status(500).json({ error: 'Error obtaining students' });
  }
};

export const createStudent = async (req: Request, res: Response) => {
  const { centerId } = req.user!;
  try {
    const student = await studentRepository.create({
      ...req.body,
      centerOrigin: centerId ? { connect: { centerId: centerId } } : undefined
    });
    res.status(201).json(student);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error creating student' });
  }
};

export const updateStudent = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const { studentId: _, ...updateData } = req.body;
    const student = await studentRepository.update(parseInt(String(id)), updateData);
    res.json(student);
  } catch (_error) {
    res.status(500).json({ error: 'Error updating student' });
  }
};

export const deleteStudent = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await studentRepository.delete(parseInt(String(id)));
    res.json({ message: 'Student deleted' });
  } catch (_error) {
    res.status(500).json({ error: 'Error deleting student' });
  }
};

