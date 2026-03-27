import prisma from '../lib/prisma.js';
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { ROLES } from '@iter/shared';

export const getTeachers = async (req: Request, res: Response) => {
  const { centreId, role } = req.user! || {};

  try {
    const where: any = {};

    // Scoping: Admin sees all, others only their center
    if (role !== ROLES.ADMIN) {
      if (!centreId) {
        return res.json([]); // No center assigned, no access
      }
      where.centerId = parseInt(centreId.toString());
    }

    const teachers = await prisma.teacher.findMany({
      where,
      include: {
        center: true,
        user: {
          select: {
            userId: true,
            email: true,
            photoUrl: true
          }
        }
      }
    });
    res.json(teachers);
  } catch (_error) {
    res.status(500).json({ error: 'Error al obtener profesores' });
  }
};

export const createTeacher = async (req: Request, res: Response) => {
  const { centreId } = req.user!;
  const { nom, contacte, password } = req.body;

  try {
    const finalCenterId = centreId ? centreId : req.body.centerId;

    if (!finalCenterId) {
      return res.status(400).json({ error: 'ID de centre requerit.' });
    }

    // Usamos una transacción para asegurar que se creen ambos o ninguno
    const result = await prisma.$transaction(async (tx: any) => {
      // 1. Buscar el rol de profesor
      const rolProfe = await tx.role.findFirst({
        where: { roleName: ROLES.TEACHER }
      });

      if (!rolProfe) throw new Error(`Role ${ROLES.TEACHER} no trobat.`);

      // 2. Crear el usuario
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password || 'Iter@1234', salt);

      const usuari = await tx.user.create({
        data: {
          fullName: nom,
          email: contacte, // Usamos el contacto como email principal
          passwordHash: passwordHash,
          roleId: rolProfe.roleId,
          centerId: finalCenterId
        }
      });

      // 3. Crear el profesor vinculado
      const professor = await tx.teacher.create({
        data: {
          name: nom,
          contact: contacte,
          centerId: finalCenterId,
          userId: usuari.userId
        }
      });

      return professor;
    });

    res.json(result);
  } catch (error: any) {
    console.error(error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Aquest email ja està en ús.' });
    }
    res.status(500).json({ error: 'Error al crear professor i usuari.' });
  }
};

export const updateTeacher = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const professor = await prisma.teacher.update({
      where: { teacherId: parseInt(id as string) },
      data: req.body
    });
    res.json(professor);
  } catch (_error) {
    res.status(500).json({ error: 'Error al actualizar profesor' });
  }
};

export const deleteTeacher = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.teacher.delete({
      where: { teacherId: parseInt(id as string) }
    });
    res.json({ message: 'Profesor eliminado' });
  } catch (_error) {
    res.status(500).json({ error: 'Error al eliminar profesor' });
  }
};

export const getTeacherAssignments = async (req: Request, res: Response) => {
  const { userId, centreId } = req.user!;

  try {
    // Verify user belongs to center or is admin (optional safety check)
    if (!centreId) {
      return res.json([]);
    }

    const assignments = await prisma.assignment.findMany({
      where: {
        teachers: { some: { userId: userId } }
      },
      include: {
        workshop: true,
        center: true,
        teachers: {
          include: {
            user: {
              select: {
                userId: true,
                fullName: true,
                email: true
              }
            }
          }
        },
        sessions: {
          orderBy: { sessionDate: 'asc' }
        }
      }
    });

    res.json(assignments);
  } catch (error) {
    console.error("Error fetching professor assignments:", error);
    res.status(500).json({ error: 'Error al obtener las asignaciones del centro.' });
  }
};

export const getTeachersByCenter = async (req: Request, res: Response) => {
  const { idCenter } = req.params;
  const { centreId, role } = req.user! || {};

  try {
    // Scoping check
    if (role !== ROLES.ADMIN && parseInt(idCenter as string) !== centreId) {
      return res.status(403).json({ error: 'Accés denegat' });
    }

    const teachers = await prisma.teacher.findMany({
      where: { centerId: parseInt(idCenter as string) },
      include: {
        user: {
          select: {
            userId: true,
            email: true,
            fullName: true,
            photoUrl: true
          }
        }
      }
    });

    res.json(teachers);
  } catch (error) {
    console.error("Error fetching teachers by center:", error);
    res.status(500).json({ error: 'Error al obtenir els teachers del centre.' });
  }
};
