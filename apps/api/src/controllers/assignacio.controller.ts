import prisma from '../lib/prisma.js';
import { Request, Response } from 'express';
import { AssignmentChecklistSchema, ROLES } from '@iter/shared';
import { isPhaseActive, PHASES } from '../lib/phaseUtils.js';
import { createNotificacioInterna } from './notificacio.controller.js';

// GET: Todas las asignaciones (Admin solo)
export const getAssignacions = async (req: Request, res: Response) => {
  const { role } = (req as any).user;

  if (role !== 'ADMIN') {
    return res.status(403).json({ error: 'Accés denegat' });
  }

  try {
    const assignacions = await prisma.assignacio.findMany({
      include: {
        taller: true,
        centre: true,
        checklist: true,
        prof1: true,
        prof2: true,
        inscripcions: {
          include: {
            alumne: true
          }
        }
      },
      orderBy: {
        id_assignacio: 'desc'
      }
    });
    res.json(assignacions);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtenir les assignacions' });
  }
};

// GET: Una asignación por ID (Detalle completo)
export const getAssignacioById = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { centreId, role } = (req as any).user;

  try {
    const assignacio = await prisma.assignacio.findUnique({
      where: { id_assignacio: parseInt(id) },
      include: {
        taller: true,
        centre: true,
        checklist: true,
        prof1: true,
        prof2: true,
        sessions: {
          include: {
            staff: {
              include: {
                usuari: true
              }
            }
          }
        },
        professors: {
          include: {
            usuari: true
          }
        },
        inscripcions: {
          include: {
            alumne: true
          }
        }
      }
    });

    if (!assignacio) {
      return res.status(404).json({ error: 'Assignació no trobada' });
    }

    // Security Scoping
    if (role !== 'ADMIN' && assignacio.id_centre !== centreId) {
      return res.status(403).json({ error: 'Accés denegat' });
    }

    res.json(assignacio);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtenir el detall de l\'assignació' });
  }
};

// GET: Listar asignaciones de un centro
export const getAssignacionsByCentre = async (req: Request, res: Response) => {
  const { idCentre } = req.params;
  const { centreId, role } = (req as any).user;

  // Security Scoping
  if (role !== 'ADMIN' && parseInt(idCentre as string) !== centreId) {
    return res.status(403).json({ error: 'Accés denegat: No pots veure les assignacions d\'altre centre' });
  }

  try {
    const assignacions = await prisma.assignacio.findMany({
      where: { id_centre: parseInt(idCentre as string) },
      include: {
        taller: true,
        centre: true,
        checklist: true,
        prof1: {
          include: { usuari: { select: { nom_complet: true } } }
        },
        prof2: {
          include: { usuari: { select: { nom_complet: true } } }
        },
        sessions: {
          orderBy: { data_sessio: 'asc' },
          include: {
            staff: {
              include: {
                usuari: true
              }
            }
          }
        },
        inscripcions: {
          include: {
            alumne: true,
            avaluacio_docent: true
          }
        }
      }
    });
    res.json(assignacions);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtenir assignacions' });
  }
};

// GET: Obtener alumnos inscritos en una asignación
export const getStudents = async (req: Request, res: Response) => {
  const { idAssignacio } = req.params;
  const { userId, role } = (req as any).user;

  try {
    const inscripcions = await prisma.inscripcio.findMany({
      where: { id_assignacio: parseInt(idAssignacio as string) },
      include: {
        alumne: true,
        avaluacio_docent: { select: { id_avaluacio_docent: true } } // include evaluation check
      }
    });

    // Flatten structure to return just students with relevant info + evaluated status
    const students = inscripcions.map((i: any) => ({
      ...i.alumne,
      evaluated: !!i.avaluacio_docent // true if exists, false otherwise
    }));
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtenir alumnes' });
  }
};

// GET: Checklist de una asignación
export const getChecklist = async (req: Request, res: Response) => {
  const { idAssignacio } = req.params;
  try {
    const checklist = await prisma.checklistAssignacio.findMany({
      where: { id_assignacio: parseInt(idAssignacio as string) }
    });
    res.json(checklist);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtenir la llista de comprovació' });
  }
};

// PATCH: Actualizar ítem de checklist
export const updateChecklistItem = async (req: Request, res: Response) => {
  const { idItem } = req.params;
  const result = AssignmentChecklistSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ error: 'Dades de validació invàlides', details: result.error.format() });
  }

  const { completat, url_evidencia } = result.data;

  try {
    const updated = await prisma.checklistAssignacio.update({
      where: { id_checklist: parseInt(idItem as string) },
      data: {
        completat,
        url_evidencia,
        data_completat: completat ? new Date() : null
      }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualitzar la llista de comprovació' });
  }
};

// GET: Incidencias de un centro
export const getIncidenciesByCentre = async (req: Request, res: Response) => {
  const { idCentre } = req.params;
  const { centreId, role } = (req as any).user;

  // Security Scoping
  if (role !== 'ADMIN' && parseInt(idCentre as string) !== centreId) {
    return res.status(403).json({ error: 'Accés denegat: No pots veure les incidències d\'altre centre' });
  }

  try {
    const incidencies = await prisma.incidencia.findMany({
      where: { id_centre: parseInt(idCentre as string) },
      orderBy: { data_creacio: 'desc' }
    });
    res.json(incidencies);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtenir les incidències' });
  }
};

// POST: Crear incidencia
export const createIncidencia = async (req: Request, res: Response) => {
  const { id_centre, descripcio } = req.body;
  try {
    const nuevaIncidencia = await prisma.incidencia.create({
      data: {
        id_centre: parseInt(id_centre),
        descripcio
      }
    });
    res.status(201).json(nuevaIncidencia);
  } catch (error) {
    console.error("Error al crear incidencia:", error);
    res.status(500).json({ error: 'Error al crear la incidència i executar l\'anàlisi de risc' });
  }
};

// POST: Validar subida de documento (Vision AI)
import { VisionService } from '../services/vision.service.js';

export const validateDocumentUpload = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No s\'ha pujat cap fitxer.' });
    }

    const visionService = new VisionService();
    const validation = await visionService.validateDocument(req.file);

    if (!validation.valid) {
      // Rechazar subida
      return res.status(400).json({
        error: 'Documento rechazado por la IA.',
        details: validation.errors,
        metadata: validation.metadata
      });
    }

    // Si es válido, aquí iría la lógica para guardar en S3/Disco
    // const s3Url = await uploadToS3(req.file);

    res.json({
      success: true,
      message: 'Documento validado y aceptado correctamente.',
      metadata: validation.metadata
      // url: s3Url
    });

  } catch (error) {
    console.error("Error en validación de documento:", error);
    res.status(500).json({ error: 'Error al processar el document.' });
  }
};

// POST: Crear Asignación desde Petición (Admin Only)
export const createAssignacioFromPeticio = async (req: Request, res: Response) => {
  const { idPeticio } = req.body;
  const { role } = (req as any).user;

  if (role !== ROLES.ADMIN) {
    return res.status(403).json({ error: 'Només els administradors poden realitzar assignacions.' });
  }

  try {
    const peticio = await prisma.peticio.findUnique({
      where: { id_peticio: parseInt(idPeticio) },
      include: { centre: true, taller: true }
    });

    if (!peticio) {
      return res.status(404).json({ error: 'Petició no trobada.' });
    }

    if (peticio.estat !== 'Aprovada') {
      return res.status(400).json({ error: 'La petició ha d\'estar aprovada per crear una assignació.' });
    }

    // Comprobar si ya existe una asignación para esta petición
    const existing = await prisma.assignacio.findFirst({
      where: { id_peticio: peticio.id_peticio }
    });

    if (existing) {
      return res.status(400).json({ error: 'Ja existeix una assignació per a aquesta petició.' });
    }

    const nuevaAssignacio = await prisma.assignacio.create({
      data: {
        id_peticio: peticio.id_peticio,
        id_centre: peticio.id_centre,
        id_taller: peticio.id_taller,
        estat: 'PUBLISHED',
        prof1_id: peticio.prof1_id ?? undefined,
        prof2_id: peticio.prof2_id ?? undefined,
        // Inicializar checklist por defecto para Fase 2
        // SIEMPRE 3 pasos para consistencia visual, pero Marcando como completado el que no aplique
        checklist: {
          create: [
            { pas_nom: 'Designar Profesores Referentes', completat: false },
            { pas_nom: 'Subir Registro Nominal (Excel)', completat: false },
            { pas_nom: 'Acuerdo Pedagógico (Modalidad C)', completat: peticio.modalitat !== 'C' }
          ]
        }
      }
    });

    res.status(201).json(nuevaAssignacio);
  } catch (error) {
    console.error("Error al crear asignación:", error);
    res.status(500).json({ error: 'Error al crear l\'assignació.' });
  }
};

// POST: Publicar Asignaciones (Admin Only)
export const publishAssignments = async (req: Request, res: Response) => {
  const { role } = (req as any).user;
  if (role !== ROLES.ADMIN) return res.status(403).json({ error: 'No autoritzat' });

  try {
    const result = await prisma.assignacio.updateMany({
      where: { estat: 'PROVISIONAL' },
      data: { estat: 'PUBLISHED' }
    });

    // Notify centers (simplified logic)
    await prisma.notificacio.create({
      data: {
        titol: 'Assignacions Publicades',
        missatge: 'Ja podeu consultar les assignacions i començar a introduir les dades.',
        tipus: 'FASE',
        importancia: 'URGENT'
      }
    });

    res.json({ message: `${result.count} assignacions publicades correctament.` });
  } catch (error) {
    res.status(500).json({ error: 'Error al publicar assignacions.' });
  }
};

// POST: Realizar Registro Nominal (Inscribir alumnos en una asignación)
export const createInscripcions = async (req: Request, res: Response) => {
  const idAssignacio = parseInt(req.params.idAssignacio as string);
  const { ids_alumnes } = req.body; // Array de IDs de alumnos

  try {
    const result = await prisma.$transaction(async (tx: any) => {
      // 1. Verificar existencia de la asignación
      const assignacio = await tx.assignacio.findUnique({
        where: { id_assignacio: idAssignacio },
        include: { inscripcions: true }
      });

      if (!assignacio) {
        throw new Error('Assignació no trobada.');
      }

      // 2. Validación de Cupo (Máx 4 alumnos en Mod C)
      const taller = await tx.taller.findUnique({ where: { id_taller: assignacio.id_taller } });
      if (taller?.modalitat === 'C' && ids_alumnes.length > 4) {
        throw new Error('Límit superat: En Modalitat C només es permeten un màxim de 4 alumnes per centre.');
      }

      // 3. Sincronizar inscripciones
      const currentIds = assignacio.inscripcions.map((i: any) => i.id_alumne);
      const newIds = ids_alumnes.map((id: any) => parseInt(id));

      const toAdd = newIds.filter((id: number) => !currentIds.includes(id));
      const toRemove = currentIds.filter((id: number) => !newIds.includes(id));

      if (toRemove.length > 0) {
        await tx.inscripcio.deleteMany({
          where: {
            id_assignacio: idAssignacio,
            id_alumne: { in: toRemove }
          }
        });
      }

      for (const idAlumne of toAdd) {
        await tx.inscripcio.create({
          data: {
            id_assignacio: idAssignacio,
            id_alumne: idAlumne
          }
        });
      }

      // 4. Actualizar estado si ya tiene profes y alumnos
      // Logic: If documented and teachers ok, state => DATA_SUBMITTED?
      // For now, update checklist
      await tx.checklistAssignacio.updateMany({
        where: {
          id_assignacio: idAssignacio,
          pas_nom: { contains: 'Registro Nominal' }
        },
        data: {
          completat: true,
          data_completat: new Date()
        }
      });

      return { added: toAdd.length, removed: toRemove.length, total: newIds.length };
    });

    res.json({ message: 'Registro nominal sincronizado correctamente', details: result });
  } catch (error: any) {
    console.error("Error al realizar registro nominal:", error);
    res.status(400).json({ error: error.message });
  }
};

// PATCH: Designar profesores para una asignación
export const designateProfessors = async (req: Request, res: Response) => {
  const { idAssignacio } = req.params;
  const { prof1_id, prof2_id } = req.body;

  try {
    // 1. Validar que los profesores sean diferentes
    if (prof1_id === prof2_id) {
      return res.status(400).json({ error: 'Has de designar dos professors diferents.' });
    }

    const oldAssignacio = await prisma.assignacio.findUnique({ where: { id_assignacio: parseInt(idAssignacio as string) } });
    
    const updated = await prisma.assignacio.update({
      where: { id_assignacio: parseInt(idAssignacio as string) },
      data: {
        prof1_id,
        prof2_id,
        estat: 'DATA_ENTRY' // Transition state once they start filling data
      }
    });

    if (oldAssignacio) {
        await logStatusChange(parseInt(idAssignacio as string), oldAssignacio.estat, 'DATA_ENTRY');
    }

    // Actualizar checklist
    await prisma.checklistAssignacio.updateMany({
      where: {
        id_assignacio: parseInt(idAssignacio as string),
        pas_nom: { contains: 'Profesores Referentes' }
      },
      data: {
        completat: !!(prof1_id && prof2_id),
        data_completat: (prof1_id && prof2_id) ? new Date() : null
      }
    });

    res.json(updated);
  } catch (error) {
    console.error("Error al designar profesores:", error);
    res.status(500).json({ error: 'Error al designar professors.' });
  }
};

// POST: Validar Datos del Centro (Admin)
export const validateCenterData = async (req: Request, res: Response) => {
  const idAssignacio = req.params.idAssignacio as string;
  const { aprobado, feedback } = req.body;
  const { role } = (req as any).user;

  if (role !== ROLES.ADMIN) return res.status(403).json({ error: 'No autorizado' });

  try {
    const oldAssignacio = await prisma.assignacio.findUnique({ where: { id_assignacio: parseInt(idAssignacio) } });
    const newState = aprobado ? 'VALIDATED' : 'DATA_ENTRY';
    
    await prisma.assignacio.update({
      where: { id_assignacio: parseInt(idAssignacio) },
      data: { 
        estat: newState,
      }
    });

    if (oldAssignacio) {
        await logStatusChange(parseInt(idAssignacio), oldAssignacio.estat, newState);
    }

    res.json({ message: `Assignació ${aprobado ? 'validada' : 'rebutjada'} correctament.` });
  } catch (error) {
    res.status(500).json({ error: 'Error al validar dades.' });
  }
};

// POST: Enviar Notificación de Documento Incorrecto
export const sendDocumentNotification = async (req: Request, res: Response) => {
  const idAssignacio = req.params.idAssignacio as string;
  const { documentName, comment, greeting } = req.body;
  const { role } = (req as any).user;

  if (role !== ROLES.ADMIN) return res.status(403).json({ error: 'No autorizado' });

  try {
    const assignacio = await prisma.assignacio.findUnique({
      where: { id_assignacio: parseInt(idAssignacio) },
      include: { 
        centre: true,
        taller: true
      }
    });

    if (!assignacio) {
      return res.status(404).json({ error: 'Assignació no trobada' });
    }

    const missatge = `${greeting}, el document ${documentName} del taller ${assignacio.taller.titol} està malament. ${comment}`;

    await createNotificacioInterna({
      id_centre: assignacio.id_centre,
      titol: 'Documentació Incorrecta',
      missatge,
      tipus: 'SISTEMA',
      importancia: 'WARNING'
    });

    res.json({ success: true, message: 'Notificació enviada correctament.' });
  } catch (error) {
    console.error("Error al enviar notificación:", error);
    res.status(500).json({ error: 'Error al enviar la notificació.' });
  }
};

// POST: Generar Asignaciones Automáticas (AI)
import { AutoAssignmentService } from '../services/auto-assignment.service.js';

export const generateAutomaticAssignments = async (req: Request, res: Response) => {
  const { role } = (req as any).user;
  // if (role !== ROLES.ADMIN) return res.status(403).json({ error: 'No autorizado' });

  try {
    const service = new AutoAssignmentService();
    const result = await service.generateAssignments();
    res.json(result);
  } catch (error) {
    console.error("Error en asignación automática:", error);
    res.status(500).json({ error: 'Error al executar el motor d\'assignació.' });
  }
};

// POST: Confirmar Registre CEB (Centro)
// POST: Confirmar Registre CEB (Centro) y Generar Sesiones
export const confirmLegalRegistration = async (req: Request, res: Response) => {
  const idAssignacio = req.params.idAssignacio as string;
  try {
    // 1. Marcar inscripciones como confirmadas
    await prisma.inscripcio.updateMany({
      where: { id_assignacio: parseInt(idAssignacio) },
      data: { registre_ceb_confirmat: true }
    });

    // 2. Obtener datos del taller para generar sesiones
    const assignacio = await prisma.assignacio.findUnique({
      where: { id_assignacio: parseInt(idAssignacio) },
      include: { taller: true }
    });

    if (!assignacio || !assignacio.taller) {
        return res.status(404).json({ error: 'Assignació no trobada' });
    }

    // 3. Generar sesiones si no existen
    // Comprobamos si ya hay sesiones para no duplicar si le dan dos veces
    const existingSessions = await prisma.sessio.count({
        where: { id_assignacio: parseInt(idAssignacio) }
    });

    if (existingSessions === 0) {
        const schedule = assignacio.taller.dies_execucio as any[]; 
        
        // 3.1 Obtener fechas de la Fase 3
        const { phase: phase3 } = await isPhaseActive(PHASES.EJECUCION);
        
        if (phase3 && Array.isArray(schedule) && schedule.length > 0) {
            const startDate = new Date(Math.max(new Date().getTime(), phase3.data_inici.getTime()));
            const endDate = phase3.data_fi;
            
            // Buscar los usuarios asociados a los profesores referentes para auto-asignarlos
            const referentProfessors = await prisma.professor.findMany({
                where: { id_professor: { in: [assignacio.prof1_id, assignacio.prof2_id].filter(Boolean) as number[] } },
                select: { id_usuari: true }
            });
            const referentUserIds = referentProfessors.map((p: any) => p.id_usuari).filter(Boolean) as number[];

            // Iterar por semanas desde startDate hasta endDate
            let currentPointer = new Date(startDate);
            while (currentPointer <= endDate) {
                for (const slot of schedule) {
                    const sessionDate = new Date(currentPointer);
                    
                    // Calcular el día de la semana deseado para esta sesión
                    const currentDay = sessionDate.getDay(); 
                    let daysUntil = (slot.dayOfWeek + 7 - currentDay) % 7;
                    sessionDate.setDate(sessionDate.getDate() + daysUntil);

                    // Verificar que seguimos dentro del rango de la fase
                    if (sessionDate >= startDate && sessionDate <= endDate) {
                        // Crear la sesión
                        const createdSession = await prisma.sessio.create({
                            data: {
                                id_assignacio: assignacio.id_assignacio,
                                data_sessio: sessionDate,
                                hora_inici: slot.startTime,
                                hora_fi: slot.endTime
                            }
                        });
                    }
                }
                // Avanzar a la siguiente semana
                currentPointer.setDate(currentPointer.getDate() + 7);
                // Asegurarse de que el puntero no se quede atascado si el incremento cruza meses de forma extraña (raro en JS Date pero preventivo)
                if (currentPointer > endDate && currentPointer.getTime() - endDate.getTime() < 86400000 * 7) {
                    // Ya nos pasamos, el bucle terminará
                }
            }
        }
    }

    const oldAssignacio = await prisma.assignacio.findUnique({ where: { id_assignacio: parseInt(idAssignacio) } });

    // 4. Actualizar estado de la asignación a 'IN_PROGRESS'
    await prisma.assignacio.update({
        where: { id_assignacio: parseInt(idAssignacio) },
        data: { estat: 'IN_PROGRESS' }
    });

    if (oldAssignacio) {
        await logStatusChange(parseInt(idAssignacio), oldAssignacio.estat, 'IN_PROGRESS');
    }

    // 5. Enviar notificació al centre confirmant l'inici del taller
    await createNotificacioInterna({
        id_centre: assignacio.id_centre,
        titol: 'Registre Confirmat: Taller en Marxa',
        missatge: `El registre per al taller "${assignacio.taller.titol}" s'ha completat correctament. El taller ja està actiu i les sessions s'han generat al vostre calendari.`,
        tipus: 'FASE',
        importancia: 'INFO'
    });

    res.json({ success: true, message: 'Registre confirmat i sessions generades.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al confirmar el registre.' });
  }
};

/**
 * PATCH: Validar un documento específico de una inscripción
 */
export const validateInscripcioDocument = async (req: Request, res: Response) => {
    const { idInscripcio } = req.params;
    const { field, valid } = req.body; // field: 'validat_acord_pedagogic', etc.
    const { role } = (req as any).user;

    if (role !== ROLES.ADMIN) {
        return res.status(403).json({ error: 'Només els administradors poden validar documents.' });
    }

    const permittedFields = ['validat_acord_pedagogic', 'validat_autoritzacio_mobilitat', 'validat_drets_imatge'];
    if (!permittedFields.includes(field)) {
        return res.status(400).json({ error: 'Camp de validació no vàlid.' });
    }

    try {
        const updated = await prisma.inscripcio.update({
            where: { id_inscripcio: parseInt(idInscripcio as string) },
            data: { [field]: !!valid }
        });
        res.json(updated);
    } catch (error) {
        console.error("Error validant document:", error);
        res.status(500).json({ error: 'Error al validar el document.' });
    }
};

/**
 * HELPER: Log status changes as requested by user
 */
async function logStatusChange(idAssignacio: number, oldState: string, newState: string) {
    if (oldState === newState) return;
    try {
        const a = await prisma.assignacio.findUnique({
            where: { id_assignacio: idAssignacio },
            include: { centre: true, taller: true }
        });
        if (a) {
            console.log(`[STATUS CHANGE] Center: ${a.centre.nom} - Workshop: ${a.taller.titol} - From: ${oldState} - To: ${newState}`);
        }
    } catch (e) {
        console.error("Error logging status change:", e);
    }
}
// POST: Actualitzar Documents de Conformitat (Centro)
export const updateComplianceDocuments = async (req: Request, res: Response) => {
  const idAssignacio = req.params.idAssignacio as string;
  const { idAlumne, acord_pedagogic, autoritzacio_mobilitat, drets_imatge } = req.body;

  try {
    const updated = await prisma.inscripcio.update({
      where: {
        id_inscripcio: parseInt(idAlumne) // Assuming we update per student or per assignment
      },
      data: {
        acord_pedagogic,
        autoritzacio_mobilitat,
        drets_imatge
      }
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualitzar documents.' });
  }
};

// POST: Pujar document de l'alumne
import fs from 'fs';
import path from 'path';

const sanitizeFileName = (str: string) => {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Treure accents
    .replace(/[^a-z0-9]/g, "_")    // Només lletres i números
    .replace(/_+/g, "_")           // Treure guions baixos consecutius
    .replace(/(^_|_$)/g, "");      // Treure guions baixos a l'inici o final
};

export const uploadStudentDocument = async (req: Request, res: Response) => {
  const { idAssignacio } = req.params;
  const { idInscripcio, documentType } = req.body;
  
  if (!req.file) {
    return res.status(400).json({ error: 'No s\'ha pujat cap fitxer.' });
  }

  try {
    const inscripcio = await prisma.inscripcio.findUnique({
      where: { id_inscripcio: parseInt(idInscripcio) },
      include: {
        alumne: true,
        assignacio: {
          include: {
            taller: true
          }
        }
      }
    });

    if (!inscripcio || !inscripcio.alumne || !inscripcio.assignacio?.taller) {
      return res.status(404).json({ error: 'Inscripció o dades associades no trobades.' });
    }

    const { alumne, assignacio } = inscripcio;
    const taller = assignacio.taller;

    const fileExt = path.extname(req.file.originalname);
    
    // Generar nom descriptiu
    const nomAlumne = sanitizeFileName(`${alumne.nom}_${alumne.cognoms}`);
    const cursAlumne = sanitizeFileName(alumne.curs || 'sense_curs');
    const titolTaller = sanitizeFileName(taller.titol);
    
    const fileName = `${nomAlumne}_${cursAlumne}_${titolTaller}_${documentType}_${Date.now()}${fileExt}`;
    const docDir = path.join('uploads', 'documents');
    const filePath = path.join(docDir, fileName);

    // Ensure documents dir exists
    if (!fs.existsSync(docDir)) {
      fs.mkdirSync(docDir, { recursive: true });
    }

    fs.writeFileSync(filePath, req.file.buffer);

    const url = `/uploads/documents/${fileName}`;
    const fieldMap: Record<string, string> = {
      'acord_pedagogic': 'url_acord_pedagogic',
      'autoritzacio_mobilitat': 'url_autoritzacio_mobilitat',
      'drets_imatge': 'url_drets_imatge'
    };

    const updateField = fieldMap[documentType];
    const boolFieldMap: Record<string, string> = {
      'acord_pedagogic': 'acord_pedagogic',
      'autoritzacio_mobilitat': 'autoritzacio_mobilitat',
      'drets_imatge': 'drets_imatge'
    };
    const boolField = boolFieldMap[documentType];

    if (!updateField) {
      return res.status(400).json({ error: 'Tipus de document no vàlid.' });
    }

    const updated = await prisma.inscripcio.update({
      where: { id_inscripcio: parseInt(idInscripcio) },
      data: {
        [updateField]: url,
        [boolField]: true // També marquem el boolean com a completat
      }
    });

    res.json(updated);
  } catch (error) {
    console.error("Error al pujar document:", error);
    res.status(500).json({ error: 'Error al processar la pujada del document.' });
  }
};

export const getSessions = async (req: Request, res: Response) => {
  const idAssignacio = req.params.idAssignacio as string;
  try {
    const sessions = await prisma.sessio.findMany({
      where: { id_assignacio: parseInt(idAssignacio) },
      orderBy: { data_sessio: 'asc' }
    });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtenir sessions' });
  }
};

export const getSessionAttendance = async (req: Request, res: Response) => {
  res.status(501).json({ error: 'Funcionalitat no implementada: getSessionAttendance' });
};

export const registerAttendance = async (req: Request, res: Response) => {
  res.status(501).json({ error: 'Funcionalitat no implementada: registerAttendance' });
};

// Phase 2: Teaching Staff Management
export const addTeachingStaff = async (req: Request, res: Response) => {
  const idAssignacio = req.params.idAssignacio as string;
  const { idUsuari, esPrincipal } = req.body;

  try {
    const relation = await prisma.assignacioProfessor.upsert({
      where: {
        id_assignacio_id_usuari: {
          id_assignacio: parseInt(idAssignacio),
          id_usuari: parseInt(idUsuari)
        }
      },
      update: {
        es_principal: esPrincipal || false
      },
      create: {
        id_assignacio: parseInt(idAssignacio),
        id_usuari: parseInt(idUsuari),
        es_principal: esPrincipal || false
      }
    });
    res.status(201).json(relation);
  } catch (error) {
    res.status(500).json({ error: 'Error al afegir professor a l\'equip' });
  }
};

export const removeTeachingStaff = async (req: Request, res: Response) => {
  const idAssignacio = req.params.idAssignacio as string;
  const idUsuari = req.params.idUsuari as string;

  try {
    await prisma.assignacioProfessor.delete({
      where: {
        id_assignacio_id_usuari: {
          id_assignacio: parseInt(idAssignacio),
          id_usuari: parseInt(idUsuari)
        }
      }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar professor de l\'equip' });
  }
};

// Phase 3: Dynamic Session Teaching Staff
export const addSessionProfessor = async (req: Request, res: Response) => {
  const { idSessio } = req.params;
  const { idUsuari } = req.body;

  try {
    const relation = await prisma.sessioProfessor.upsert({
      where: {
        id_sessio_id_usuari: {
          id_sessio: parseInt(idSessio as string),
          id_usuari: parseInt(idUsuari)
        }
      },
      update: {}, // No update needed if exists
      create: {
        id_sessio: parseInt(idSessio as string),
        id_usuari: parseInt(idUsuari)
      }
    });
    res.status(201).json(relation);
  } catch (error) {
    console.error("Error al afegir professor a la sessió:", error);
    res.status(500).json({ error: 'Error al afegir professor a la sessió' });
  }
};

export const removeSessionProfessor = async (req: Request, res: Response) => {
  const { idSessio, idUsuari } = req.params;

  try {
    await prisma.sessioProfessor.delete({
      where: {
        id_sessio_id_usuari: {
          id_sessio: parseInt(idSessio as string),
          id_usuari: parseInt(idUsuari as string)
        }
      }
    });
    res.status(204).send();
  } catch (error) {
    console.error("Error al eliminar professor de la sessió:", error);
    res.status(500).json({ error: 'Error al eliminar professor de la sessió' });
  }
};

// Phase 4: Closing
export const closeAssignacio = async (req: Request, res: Response) => {
  res.status(501).json({ error: 'Funcionalitat no implementada: closeAssignacio' });
};
