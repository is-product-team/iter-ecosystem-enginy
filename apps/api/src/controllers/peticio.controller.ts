import prisma from '../lib/prisma.js';
import { Request, Response } from 'express';
import { EstadoRequestn } from '@iter/shared';
import { isPhaseActive, PHASES } from '../lib/phaseUtils.js';
import { createNotificationInterna } from './notificacio.controller.js';

// GET: Ver peticiones (Filtra por centro si es COORDINADOR) con paginación
export const getRequestns = async (req: Request, res: Response) => {
  const { centreId, role } = req.user || {};
  const { page = 1, limit = 10 } = req.query;
  const isAll = Number(limit) === 0;
  const skip = isAll ? undefined : (Number(page) - 1) * Number(limit);
  const take = isAll ? undefined : Number(limit);

  try {
    const where: any = {};

    // Scoping: Admin sees all, others only their center
    if (role !== 'ADMIN') {
      if (!centreId) {
        return res.json({ data: [], meta: { total: 0, page: Number(page), limit: Number(limit), totalPages: 0 } });
      }
      where.id_center = parseInt(centreId.toString());
    }

    const [peticions, total] = await Promise.all([
      prisma.request.findMany({
        where,
        skip,
        take,
        include: {
          centre: true,
          taller: true,
          prof1: true,
          prof2: true,
          students: true
        },
        orderBy: {
          data_peticio: 'desc'
        }
      }),
      prisma.request.count({ where }),
    ]);

    res.json({
      data: peticions,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: isAll ? 1 : Math.ceil(total / (Number(take) || 1)),
      },
    });
  } catch (error) {
    console.error("Error en peticioController.getRequestns:", error);
    return res.status(500).json({ error: 'Error al obtenir peticions' });
  }
};

// POST: Crear solicitud
export const createRequest = async (req: Request, res: Response) => {
  const {
    id_workshop,
    alumnes_aprox,
    comentaris,
    prof1_id,
    prof2_id,
    modalitat
  } = req.body;
  const { centreId } = req.user!;

  if (!id_workshop || !centreId || !prof1_id || !prof2_id) {
    return res.status(400).json({ error: 'Falten camps obligatoris (id_workshop, centreId, prof1_id, prof2_id)' });
  }

  // --- VERIFICACIÓN DE FASE ---
  const phaseStatus = await isPhaseActive(PHASES.SOLICITUD);
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
  if (modalitat === 'C') {
    if (alumnes_aprox > 4) {
      return res.status(400).json({ error: 'En la Modalitat C, el màxim és de 4 alumnes d\'un mateix institut per projecte.' });
    }

    // Comprobar límite total de 12 alumnos para el centro en Modalidad C
    const peticionsC = await prisma.request.findMany({
      where: {
        id_center: centreId,
        modalitat: 'C'
      }
    });

    const totalStudentsC = peticionsC.reduce((sum: number, p: any) => sum + (p.alumnes_aprox || 0), 0);
    if (totalStudentsC + alumnes_aprox > 12) {
      return res.status(400).json({
        error: `Límit superat. L'institut ya té ${totalStudentsC} alumnes en projectes de Modalitat C. El màxim total permès és 12.`
      });
    }
  }

  try {
    const existingRequest = await prisma.request.findFirst({
      where: {
        id_center: centreId,
        id_workshop: parseInt(id_workshop)
      }
    });

    if (existingRequest) {
      return res.status(400).json({ error: 'Aquest centre ya ha realitzat una sol·licitud per a aquest taller.' });
    }

    const nuevaRequest = await prisma.request.create({
      data: {
        id_center: centreId,
        id_workshop: parseInt(id_workshop),
        alumnes_aprox: parseInt(alumnes_aprox),
        comentaris,
        estat: 'Pendent',
        modalitat,
        prof1_id: parseInt(prof1_id),
        prof2_id: parseInt(prof2_id),
      },
      include: {
        taller: true
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
    alumnes_aprox,
    comentaris,
    prof1_id,
    prof2_id,
  } = req.body;
  const { centreId, role } = req.user!;

  try {
    const peticioId = parseInt(id as string);
    const existingRequest = await prisma.request.findUnique({
      where: { id_request: peticioId }
    });

    if (!existingRequest) {
      return res.status(404).json({ error: 'Petició no trobada.' });
    }

    // Verificar permisos: Coordinador solo edita las suyas
    if (role !== 'ADMIN' && existingRequest.id_center !== (centreId ? (typeof centreId === 'string' ? centreId : centreId) : 0)) {
      return res.status(403).json({ error: 'No tens permís per editar aquesta petició.' });
    }

    // Verificar estado: Solo se pueden editar las pendientes
    if (existingRequest.estat !== 'Pendent') {
      return res.status(400).json({ error: 'Només es poden editar peticions pendents.' });
    }

    // --- VERIFICACIÓN DE FASE ---
    // Si NO es admin, verificamos la fase. Los admins pueden editar siempre.
    if (role !== 'ADMIN') {
      const phaseStatus = await isPhaseActive(PHASES.SOLICITUD);
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
    if (existingRequest.modalitat === 'C' && alumnes_aprox !== undefined) {
      const nuevosStudents = parseInt(alumnes_aprox);
      if (nuevosStudents > 4) {
        return res.status(400).json({ error: 'En la Modalitat C, el màxim és de 4 alumnes d\'un mateix institut per projecte.' });
      }

      // Comprobar límite total de 12 alumnos (excluyendo la cantidad actual de esta petición)
      const peticionsC = await prisma.request.findMany({
        where: {
          id_center: existingRequest.id_center,
          modalitat: 'C',
          id_request: { not: peticioId } // Excluir la actual
        }
      });

      const totalStudentsC = peticionsC.reduce((sum: number, p: any) => sum + (p.alumnes_aprox || 0), 0);
      if (totalStudentsC + nuevosStudents > 12) {
        return res.status(400).json({
          error: `Límit superat. L'institut ya té ${totalStudentsC} alumnes en altres projectes de Modalitat C. Amb aquest canvi (${nuevosStudents}) superaria el màxim de 12.`
        });
      }
    }

    const updatedRequest = await prisma.request.update({
      where: { id_request: peticioId },
      data: {
        alumnes_aprox: alumnes_aprox ? parseInt(alumnes_aprox) : undefined,
        comentaris,
        prof1_id: parseInt(prof1_id),
        prof2_id: parseInt(prof2_id),
      },
      include: {
        taller: true
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
  const { estat } = req.body;

  try {
    const updated = await prisma.request.update({
      where: { id_request: parseInt(id as string) },
      data: { estat: estat as EstadoRequestn },
      include: { taller: true }
    });

    await createNotificationInterna({
      id_center: updated.id_center,
      titol: `Sol·licitud ${updated.estat === 'Aprovada' ? 'Aprovada' : 'Rebutjada'}`,
      missatge: `La teva sol·licitud per al taller "${updated.workshop.titol}" ha estat ${updated.estat.toLowerCase()}.`,
      tipus: 'PETICIO',
      importancia: updated.estat === 'Aprovada' ? 'INFO' : 'WARNING'
    });

    res.json(updated);
  } catch (error) {
    console.error("Error en updateRequestStatus:", error);
    res.status(500).json({ error: 'Error al actualitzar l\'estat' });
  }
};
