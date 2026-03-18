import prisma from '../lib/prisma.js';
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';

export const getTeachers = async (req: Request, res: Response) => {
  const { centreId, role } = req.user! || {};

  try {
    const where: any = {};
    
    // Scoping: Admin sees all, others only their center
    if (role !== 'ADMIN') {
      if (!centreId) {
        return res.json([]); // No center assigned, no access
      }
      where.id_center = parseInt(centreId.toString());
    }

    const professors = await prisma.teacher.findMany({
      where,
      include: { 
        centre: true,
        usuari: {
          select: {
            id_user: true,
            email: true,
            url_foto: true
          }
        }
      }
    });
    res.json(professors);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener profesores' });
  }
};

export const createTeacher = async (req: Request, res: Response) => {
  const { centreId } = req.user!;
  const { nom, contacte, password } = req.body;
  
  try {
    const finalCenterId = centreId ? centreId : req.body.id_center;

    if (!finalCenterId) {
      return res.status(400).json({ error: 'ID de centre requerit.' });
    }

    // Usamos una transacción para asegurar que se creen ambos o ninguno
    const result = await prisma.$transaction(async (tx: any) => {
      // 1. Buscar el rol de profesor
      const rolProfe = await tx.role.findFirst({
        where: { nom_rol: 'PROFESSOR' }
      });

      if (!rolProfe) throw new Error('Role PROFESSOR no trobat.');

      // 2. Crear el usuario
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password || 'Iter@1234', salt);

      const usuari = await tx.user.create({
        data: {
          nom_complet: nom,
          email: contacte, // Usamos el contacto como email principal
          password_hash: passwordHash,
          id_role: rolProfe.id_role,
          id_center: finalCenterId
        }
      });

      // 3. Crear el profesor vinculado
      const professor = await tx.teacher.create({
        data: {
          nom,
          contacte,
          id_center: finalCenterId,
          id_user: usuari.id_user
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
  const { nom, contacte, id_center } = req.body;
  try {
    const professor = await prisma.teacher.update({
      where: { id_teacher: parseInt(id as string) },
      data: req.body
    });
    res.json(professor);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar profesor' });
  }
};

export const deleteTeacher = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.teacher.delete({
      where: { id_teacher: parseInt(id as string) }
    });
    res.json({ message: 'Profesor eliminado' });
  } catch (error) {
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
        OR: [
           { teachers: { some: { id_user: userId } } },
           { prof1: { id_user: userId } },
           { prof2: { id_user: userId } }
        ]
      },
      include: {
        taller: true,
        centre: true,
        prof1: true,
        prof2: true,
        sessions: {
            orderBy: { data_sessio: 'asc' }
        },
        teachers: {
          include: {
            usuari: {
              select: {
                nom_complet: true,
                email: true
              }
            }
          }
        },
        submissions: {
            include: {
                model: true
            }
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
    if (role !== 'ADMIN' && parseInt(idCenter as string) !== centreId) {
      return res.status(403).json({ error: 'Accés denegat' });
    }

    const professors = await prisma.teacher.findMany({
      where: { id_center: parseInt(idCenter as string) },
      include: {
        usuari: {
          select: {
            id_user: true,
            email: true,
            nom_complet: true,
            url_foto: true
          }
        }
      }
    });

    res.json(professors);
  } catch (error) {
    console.error("Error fetching professors by centre:", error);
    res.status(500).json({ error: 'Error al obtenir els professors del centre.' });
  }
};
