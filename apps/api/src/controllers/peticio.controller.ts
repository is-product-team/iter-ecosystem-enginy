import prisma from '../lib/prisma.js';
import { Request, Response } from 'express';
import { EstadoPeticion } from '@iter/shared';
import { isPhaseActive, PHASES } from '../lib/phaseUtils.js';
import { createNotificacioInterna } from './notificacio.controller.js';

// GET: Ver peticiones (Filtra por centro si es COORDINADOR) con paginación
export const getPeticions = async (req: Request, res: Response) => {
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
      where.id_centre = parseInt(centreId.toString());
    }

    const [peticions, total] = await Promise.all([
      prisma.peticio.findMany({
        where,
        skip,
        take,
        include: {
          centre: true,
          taller: true,
          prof1: true,
          prof2: true,
          alumnes: true
        },
        orderBy: {
          data_peticio: 'desc'
        }
      }),
      prisma.peticio.count({ where }),
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
    console.error("Error en peticioController.getPeticions:", error);
    return res.status(500).json({ error: 'Error al obtenir peticions' });
  }
};

// POST: Crear solicitud
export const createPeticio = async (req: Request, res: Response) => {
  const {
    id_taller,
    alumnes_aprox,
    comentaris,
    prof1_id,
    prof2_id,
    modalitat
  } = req.body;
  const { centreId } = req.user!;

  if (!id_taller || !centreId || !prof1_id || !prof2_id) {
    return res.status(400).json({ error: 'Falten camps obligatoris (id_taller, centreId, prof1_id, prof2_id)' });
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
    const peticionsC = await prisma.peticio.findMany({
      where: {
        id_centre: centreId,
        modalitat: 'C'
      }
    });

    const totalAlumnesC = peticionsC.reduce((sum: number, p: any) => sum + (p.alumnes_aprox || 0), 0);
    if (totalAlumnesC + alumnes_aprox > 12) {
      return res.status(400).json({
        error: `Límit superat. L'institut ya té ${totalAlumnesC} alumnes en projectes de Modalitat C. El màxim total permès és 12.`
      });
    }
  }

  try {
    const existingPeticio = await prisma.peticio.findFirst({
      where: {
        id_centre: centreId,
        id_taller: parseInt(id_taller)
      }
    });

    if (existingPeticio) {
      return res.status(400).json({ error: 'Aquest centre ya ha realitzat una sol·licitud per a aquest taller.' });
    }

    const nuevaPeticio = await prisma.peticio.create({
      data: {
        id_centre: centreId,
        id_taller: parseInt(id_taller),
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

    res.json(nuevaPeticio);
  } catch (error) {
    console.error("Error en peticioController.createPeticio:", error);
    res.status(500).json({ error: 'Error al crear la petició' });
  }
};

// PUT: Actualizar solicitud existente (solo campos permitidos y si está Pendent)
export const updatePeticio = async (req: Request, res: Response) => {
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
    const existingPeticio = await prisma.peticio.findUnique({
      where: { id_peticio: peticioId }
    });

    if (!existingPeticio) {
      return res.status(404).json({ error: 'Petició no trobada.' });
    }

    // Verificar permisos: Coordinador solo edita las suyas
    if (role !== 'ADMIN' && existingPeticio.id_centre !== (centreId ? (typeof centreId === 'string' ? centreId : centreId) : 0)) {
      return res.status(403).json({ error: 'No tens permís per editar aquesta petició.' });
    }

    // Verificar estado: Solo se pueden editar las pendientes
    if (existingPeticio.estat !== 'Pendent') {
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
    if (existingPeticio.modalitat === 'C' && alumnes_aprox !== undefined) {
      const nuevosAlumnes = parseInt(alumnes_aprox);
      if (nuevosAlumnes > 4) {
        return res.status(400).json({ error: 'En la Modalitat C, el màxim és de 4 alumnes d\'un mateix institut per projecte.' });
      }

      // Comprobar límite total de 12 alumnos (excluyendo la cantidad actual de esta petición)
      const peticionsC = await prisma.peticio.findMany({
        where: {
          id_centre: existingPeticio.id_centre,
          modalitat: 'C',
          id_peticio: { not: peticioId } // Excluir la actual
        }
      });

      const totalAlumnesC = peticionsC.reduce((sum: number, p: any) => sum + (p.alumnes_aprox || 0), 0);
      if (totalAlumnesC + nuevosAlumnes > 12) {
        return res.status(400).json({
          error: `Límit superat. L'institut ya té ${totalAlumnesC} alumnes en altres projectes de Modalitat C. Amb aquest canvi (${nuevosAlumnes}) superaria el màxim de 12.`
        });
      }
    }

    const updatedPeticio = await prisma.peticio.update({
      where: { id_peticio: peticioId },
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

    res.json(updatedPeticio);
  } catch (error) {
    console.error("Error en peticioController.updatePeticio:", error);
    res.status(500).json({ error: 'Error al actualitzar la petició' });
  }
};

// PATCH: Cambiar estado (Aprobar/Rechazar)
export const updatePeticioStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { estat } = req.body;

  try {
    const updated = await prisma.peticio.update({
      where: { id_peticio: parseInt(id as string) },
      data: { estat: estat as EstadoPeticion },
      include: { taller: true }
    });

    await createNotificacioInterna({
      id_centre: updated.id_centre,
      titol: `Sol·licitud ${updated.estat === 'Aprovada' ? 'Aprovada' : 'Rebutjada'}`,
      missatge: `La teva sol·licitud per al taller "${updated.taller.titol}" ha estat ${updated.estat.toLowerCase()}.`,
      tipus: 'PETICIO',
      importancia: updated.estat === 'Aprovada' ? 'INFO' : 'WARNING'
    });

    res.json(updated);
  } catch (error) {
    console.error("Error en updatePeticioStatus:", error);
    res.status(500).json({ error: 'Error al actualitzar l\'estat' });
  }
};
