import prisma from '../lib/prisma.js';
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';

export const getProfessors = async (req: Request, res: Response) => {
  const { centreId, role } = (req as any).user || {};

  try {
    const where: any = {};
    
    // Scoping: Admin sees all, others only their center
    if (role !== 'ADMIN') {
      if (!centreId) {
        return res.json([]); // No center assigned, no access
      }
      where.id_centre = parseInt(centreId.toString());
    }

    const professors = await prisma.professor.findMany({
      where,
      include: { 
        centre: true,
        usuari: {
          select: {
            id_usuari: true,
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

export const createProfessor = async (req: Request, res: Response) => {
  const { centreId } = (req as any).user;
  const { nom, contacte, password } = req.body;
  
  try {
    const finalCentreId = centreId ? parseInt(centreId) : req.body.id_centre;

    if (!finalCentreId) {
      return res.status(400).json({ error: 'ID de centre requerit.' });
    }

    // Usamos una transacción para asegurar que se creen ambos o ninguno
    const result = await prisma.$transaction(async (tx: any) => {
      // 1. Buscar el rol de profesor
      const rolProfe = await tx.rol.findFirst({
        where: { nom_rol: 'PROFESSOR' }
      });

      if (!rolProfe) throw new Error('Rol PROFESSOR no trobat.');

      // 2. Crear el usuario
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password || 'Iter@1234', salt);

      const usuari = await tx.usuari.create({
        data: {
          nom_complet: nom,
          email: contacte, // Usamos el contacto como email principal
          password_hash: passwordHash,
          id_rol: rolProfe.id_rol,
          id_centre: finalCentreId
        }
      });

      // 3. Crear el profesor vinculado
      const professor = await tx.professor.create({
        data: {
          nom,
          contacte,
          id_centre: finalCentreId,
          id_usuari: usuari.id_usuari
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

export const updateProfessor = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { nom, contacte, id_centre } = req.body;
  try {
    const professor = await prisma.professor.update({
      where: { id_professor: parseInt(id as string) },
      data: req.body
    });
    res.json(professor);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar profesor' });
  }
};

export const deleteProfessor = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.professor.delete({
      where: { id_professor: parseInt(id as string) }
    });
    res.json({ message: 'Profesor eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar profesor' });
  }
};

export const getProfessorAssignments = async (req: Request, res: Response) => {
  const { userId, centreId } = (req as any).user;

  try {
    // Verify user belongs to center or is admin (optional safety check)
    if (!centreId) {
      return res.json([]);
    }

    const assignments = await prisma.assignacio.findMany({
      where: {
        OR: [
           { professors: { some: { id_usuari: parseInt(userId) } } },
           { prof1: { id_usuari: parseInt(userId) } },
           { prof2: { id_usuari: parseInt(userId) } }
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
        professors: {
          include: {
            usuari: {
              select: {
                nom_complet: true,
                email: true
              }
            }
          }
        },
        enviaments: {
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

export const getProfessorsByCentre = async (req: Request, res: Response) => {
  const { idCentre } = req.params;
  const { centreId, role } = (req as any).user || {};

  try {
    // Scoping check
    if (role !== 'ADMIN' && parseInt(idCentre as string) !== centreId) {
      return res.status(403).json({ error: 'Accés denegat' });
    }

    const professors = await prisma.professor.findMany({
      where: { id_centre: parseInt(idCentre as string) },
      include: {
        usuari: {
          select: {
            id_usuari: true,
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
