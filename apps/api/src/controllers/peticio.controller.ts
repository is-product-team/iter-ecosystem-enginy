import prisma from '../lib/prisma.js';
import { Request, Response } from 'express';
import { RequestStatus, Modalitat } from '@prisma/client';
import { ROLES, REQUEST_STATUSES, PHASES } from '@iter/shared';
import { isPhaseActive } from '../lib/phaseUtils.js';
import { createNotificationInterna } from './notificacio.controller.js';

// GET: Ver peticiones (Filtra por centro si es COORDINADOR) con paginación
export const getRequestns = async (req: Request, res: Response) => {
  const { centreId, role, userId } = req.user || {};
  const { page = 1, limit = 10 } = req.query;
  const isAll = Number(limit) === 0;
  const skip = isAll ? undefined : (Number(page) - 1) * Number(limit);
  const take = isAll ? undefined : Number(limit);

  try {
    const where: any = {};

    // Scoping: Admin sees all, others only their center
    if (role !== ROLES.ADMIN) {
      if (!centreId) {
        return res.json({ data: [], meta: { total: 0, page: Number(page), limit: Number(limit), totalPages: 0 } });
      }
      // If the user is a teacher, they should only see requests related to their assignments
      if (role === ROLES.TEACHER) {
        const assignments = await prisma.assignment.findMany({
          where: {
            teachers: { some: { userId: userId } }
          },
          select: {
            workshopId: true
          }
        });
        const workshopIds = assignments.map(a => a.workshopId);
        where.workshopId = { in: workshopIds };
      } else { // COORDINATOR
        where.centerId = parseInt(centreId.toString());
      }
    }

    const [requests, total] = await Promise.all([
      prisma.request.findMany({
        where,
        skip,
        take,
        include: {
          center: true,
          workshop: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.request.count({ where }),
    ]);

    res.json({
      data: requests,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: isAll ? 1 : Math.ceil(total / (Number(take) || 1)),
      },
    });
  } catch (error) {
    console.error("Error en peticioController.getRequestns:", error);
    return res.status(500).json({ error: 'Error al obtenir requests' });
  }
};

// POST: Crear solicitud
export const createRequest = async (req: Request, res: Response) => {
  const {
    workshopId,
    studentsAprox,
    comments,
    prof1_id,
    prof2_id,
    modality
  } = req.body;
  const { centreId } = req.user!;

  if (!workshopId || !centreId || !prof1_id || !prof2_id) {
    return res.status(400).json({ error: 'Falten camps obligatoris (workshopId, centreId, prof1_id, prof2_id)' });
  }

  // --- VERIFICACIÓN DE PHASE ---
  const phaseStatus = await isPhaseActive(PHASES.APPLICATION);
  if (!phaseStatus.isActive) {
    let errorMessage = 'El període de sol·licitud de tallers no està actiu.';
    if (!phaseStatus.phaseActiveFlag) {
      errorMessage = 'La fase de sol·licitud ha estat desactivada per l\'administrador.';
    } else if (!phaseStatus.isWithinDates) {
      errorMessage = 'El termini per sol·licitar tallers ha finalitzat.';
    }
    return res.status(403).json({ error: errorMessage });
  }

  // --- VALIDACIONES DE MODALIDAD C (REGLAS DEL PROGRAMA) ---
  if (modality === 'C') {
    if (studentsAprox > 4) {
      return res.status(400).json({ error: 'En la Modalitat C, el màxim és de 4 alumnes d\'un mateix institut per projecte.' });
    }

    // Comprobar límite total de 12 alumnos para el centro en Modalidad C
    const requestsC = await prisma.request.findMany({
      where: {
        centerId: centreId,
        modality: 'C'
      }
    });

    const totalStudentsC = requestsC.reduce((sum: number, p: any) => sum + (p.studentsAprox || 0), 0);
    if (totalStudentsC + parseInt(studentsAprox) > 12) {
      return res.status(400).json({
        error: `Límit superat. L'institut ja té ${totalStudentsC} alumnes en projectes de Modalitat C. El màxim total permès és 12.`
      });
    }
  }

  try {
    const existingRequest = await prisma.request.findFirst({
      where: {
        centerId: centreId,
        workshopId: parseInt(workshopId)
      }
    });

    if (existingRequest) {
      return res.status(400).json({ error: 'Aquest centre ja ha realitzat una sol·licitud per a aquest taller.' });
    }

    const nuevaRequest = await prisma.request.create({
      data: {
        centerId: parseInt(centreId),
        workshopId: parseInt(workshopId),
        studentsAprox: parseInt(studentsAprox),
        comments: comments,
        status: REQUEST_STATUSES.PENDING,
        modality,
        prof1_id: parseInt(prof1_id),
        prof2_id: parseInt(prof2_id),
      },
      include: {
        workshop: true
      }
    });

    res.json(nuevaRequest);
  } catch (error) {
    console.error("Error en peticioController.createRequest:", error);
    res.status(500).json({ error: 'Error al crear la petició' });
  }
};

// PUT: Actualizar solicitud existente (solo campos permitidos y si está Pendent)
export const updateRequest = async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    studentsAprox,
    comments,
    prof1_id,
    prof2_id,
    modality       // Renamed from modalitat
  } = req.body;
  const { centreId, role } = req.user!;

  try {
    const peticioId = parseInt(id as string);
    const existingRequest = await prisma.request.findUnique({
      where: { requestId: peticioId }
    });

    if (!existingRequest) {
      return res.status(404).json({ error: 'Petició no trobada.' });
    }

    // Verificar permisos: Coordinador solo edita las suyas
    if (role !== ROLES.ADMIN && existingRequest.centerId !== centreId) {
      return res.status(403).json({ error: 'No tens permís per editar aquesta petició.' });
    }

    // Verificar estado: Solo se pueden editar las pendientes
    if (existingRequest.status !== RequestStatus.PENDING) {
      return res.status(400).json({ error: 'Només es poden editar requests pendents.' });
    }

    // --- VERIFICACIÓN DE PHASE ---
    // Si NO es admin, verificamos la fase. Los admins pueden editar siempre.
    if (role !== ROLES.ADMIN) {
      const phaseStatus = await isPhaseActive(PHASES.APPLICATION);
      if (!phaseStatus.isActive) {
        let errorMessage = 'El període de sol·licitud de tallers no està actiu.';
        if (!phaseStatus.phaseActiveFlag) {
          errorMessage = 'La fase de sol·licitud ha estat desactivada per l\'administrador.';
        } else if (!phaseStatus.isWithinDates) {
          errorMessage = 'El termini per sol·licitar tallers ha finalitzat.';
        }
        return res.status(403).json({ error: errorMessage });
      }
    }

    // --- VALIDACIONES DE MODALIDAD C (REGLAS DEL PROGRAMA) ---
    if (existingRequest.modality === 'C' && studentsAprox !== undefined) {
      const nuevosStudents = parseInt(studentsAprox);
      if (nuevosStudents > 4) {
        return res.status(400).json({ error: 'En la Modalitat C, el màxim és de 4 alumnes d\'un mateix institut per projecte.' });
      }

      // Comprobar límite total de 12 alumnos (excluyendo la cantidad actual de esta petición)
      const requestsC = await prisma.request.findMany({
        where: {
          centerId: existingRequest.centerId,
          modality: 'C',
          requestId: { not: peticioId } // Excluir la actual
        }
      });

      const totalStudentsC = requestsC.reduce((sum: number, p: any) => sum + (p.studentsAprox || 0), 0);
      if (totalStudentsC + nuevosStudents > 12) {
        return res.status(400).json({
          error: `Límit superat. L'institut ja té ${totalStudentsC} alumnes en altres projectes de Modalitat C. Amb aquest canvi (${nuevosStudents}) superaria el màxim de 12.`
        });
      }
    }

    const updatedRequest = await prisma.request.update({
      where: { requestId: peticioId },
      data: {
        studentsAprox: studentsAprox ? parseInt(studentsAprox) : undefined,
        comments,
        prof1_id: parseInt(prof1_id),
        prof2_id: parseInt(prof2_id),
      },
      include: {
        workshop: true
      }
    });

    res.json(updatedRequest);
  } catch (error) {
    console.error("Error en peticioController.updateRequest:", error);
    res.status(500).json({ error: 'Error al actualitzar la petició' });
  }
};

// PATCH: Cambiar estado (Aprobar/Rechazar)
export const updateRequestStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const updated = await prisma.request.update({
      where: { requestId: parseInt(id as string) },
      data: { status: status as RequestStatus },
      include: { workshop: true }
    });

    await createNotificationInterna({
      centerId: updated.centerId,
      title: `Sol·licitud ${updated.status === RequestStatus.APPROVED ? 'Aprovada' : 'Rebutjada'}`,
      message: `La teva sol·licitud per al taller "${updated.workshop.title}" ha estat ${updated.status.toLowerCase()}.`,
      type: 'REQUEST',
      importancia: updated.status === RequestStatus.APPROVED ? 'INFO' : 'WARNING'
    });

    res.json(updated);
  } catch (error) {
    console.error("Error en updateRequestStatus:", error);
    res.status(500).json({ error: 'Error al actualitzar l\'estat' });
  }
};
