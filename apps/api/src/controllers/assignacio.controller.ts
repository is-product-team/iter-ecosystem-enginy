import prisma from '../lib/prisma.js';
import { Request, Response } from 'express';
import { AssignmentChecklistSchema, ROLES } from '@iter/shared';
import { isPhaseActive, PHASES } from '../lib/phaseUtils.js';
import { createNotificationInterna } from './notificacio.controller.js';

// GET: Todas las asignaciones (Admin solo)
export const getAssignments = async (req: Request, res: Response) => {
  const { role } = req.user!;

  if (role !== 'ADMIN') {
    return res.status(403).json({ error: 'Accés denegat' });
  }

  try {
    const assignments = await prisma.assignment.findMany({
      include: {
        workshop: true,
        center: true,
        checklist: true,
        teacher1: true,
        teacher2: true,
        enrollments: {
          include: {
            student: true
          }
        }
      },
      orderBy: {
        id_assignment: 'desc'
      }
    });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtenir les assignacions' });
  }
};

// GET: Una asignación por ID (Detalle completo)
export const getAssignmentById = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { centreId, role } = req.user!;

  try {
    const assignment = await prisma.assignment.findUnique({
      where: { id_assignment: parseInt(id) },
      include: {
        workshop: true,
        center: true,
        checklist: true,
        teacher1: true,
        teacher2: true,
        sessions: {
          include: {
            staff: {
              include: {
                user: true
              }
            }
          }
        },
        teachers: {
          include: {
            user: true
          }
        },
        enrollments: {
          include: {
            student: true
          }
        }
      }
    });

    if (!assignment) {
      return res.status(404).json({ error: 'Assignació no trobada' });
    }

    // Security Scoping
    if (role !== 'ADMIN' && assignment.id_center !== centreId) {
      return res.status(403).json({ error: 'Accés denegat' });
    }

    res.json(assignment);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtenir el detall de l\'assignació' });
  }
};

// GET: Listar asignaciones de un centro
export const getAssignmentsByCenter = async (req: Request, res: Response) => {
  const { idCenter } = req.params;
  const { centreId, role } = req.user!;

  // Security Scoping
  if (role !== 'ADMIN' && parseInt(idCenter as string) !== centreId) {
    return res.status(403).json({ error: 'Accés denegat: No pots veure les assignacions d\'altre centre' });
  }

  try {
    const assignments = await prisma.assignment.findMany({
      where: { id_center: parseInt(idCenter as string) },
      include: {
        workshop: true,
        center: true,
        checklist: true,
        teacher1: {
          include: { user: { select: { nom_complet: true } } }
        },
        teacher2: {
          include: { user: { select: { nom_complet: true } } }
        },
        sessions: {
          orderBy: { data_session: 'asc' },
          include: {
            staff: {
              include: {
                user: true
              }
            }
          }
        },
        enrollments: {
          include: {
            student: true,
            evaluation: true
          }
        }
      }
    });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtenir assignacions' });
  }
};

// GET: Obtener alumnos inscritos en una asignación
export const getStudents = async (req: Request, res: Response) => {
  const { idAssignment } = req.params;
  const { userId, role } = req.user!;

  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { id_assignment: parseInt(idAssignment as string) },
      include: {
        student: true,
        evaluation: { select: { id_evaluation_teacher: true } } // include evaluation check
      }
    });

    // Flatten structure to return just students with relevant info + evaluated status
    const students = enrollments.map((i: any) => ({
      ...i.student,
      evaluated: !!i.evaluation // true if exists, false otherwise
    }));
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtenir alumnes' });
  }
};

// GET: Checklist de una asignación
export const getChecklist = async (req: Request, res: Response) => {
  const { idAssignment } = req.params;
  try {
    const checklist = await prisma.assignmentChecklist.findMany({
      where: { id_assignment: parseInt(idAssignment as string) }
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
    const updated = await prisma.assignmentChecklist.update({
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

// GET: Issues de un centro
export const getIssuesByCenter = async (req: Request, res: Response) => {
  const { idCenter } = req.params;
  const { centreId, role } = req.user!;

  // Security Scoping
  if (role !== 'ADMIN' && parseInt(idCenter as string) !== centreId) {
    return res.status(403).json({ error: 'Accés denegat: No pots veure les incidències d\'altre centre' });
  }

  try {
    const issues = await prisma.issue.findMany({
      where: { id_center: parseInt(idCenter as string) },
      orderBy: { data_creacio: 'desc' }
    });
    res.json(issues);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtenir les incidències' });
  }
};

// POST: Crear incidencia
export const createIssue = async (req: Request, res: Response) => {
  const { id_center, descripcio } = req.body;
  try {
    const newIssue = await prisma.issue.create({
      data: {
        id_center: parseInt(id_center),
        descripcio
      }
    });
    res.status(201).json(newIssue);
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
export const createAssignmentFromRequest = async (req: Request, res: Response) => {
  const { idRequest } = req.body;
  const { role } = req.user!;

  if (role !== ROLES.ADMIN) {
    return res.status(403).json({ error: 'Només els administradors poden realitzar assignacions.' });
  }

  try {
    const request = await prisma.request.findUnique({
      where: { id_request: parseInt(idRequest) },
      include: { center: true, workshop: true }
    });

    if (!request) {
      return res.status(404).json({ error: 'Petició no trobada.' });
    }

    if (request.estat !== 'Aprovada') {
      return res.status(400).json({ error: 'La petició ha d\'estar aprovada per crear una assignació.' });
    }

    // Comprobar si ya existe una asignación para esta petición
    const existing = await prisma.assignment.findFirst({
      where: { id_request: request.id_request }
    });

    if (existing) {
      return res.status(400).json({ error: 'Ja existeix una assignació per a aquesta petició.' });
    }

    const newAssignment = await prisma.assignment.create({
      data: {
        id_request: request.id_request,
        id_center: request.id_center,
        id_workshop: request.id_workshop,
        estat: 'PUBLISHED',
        teacher1_id: request.teacher1_id ?? undefined,
        teacher2_id: request.teacher2_id ?? undefined,
        // Inicializar checklist por defecto para Phase 2
        // SIEMPRE 3 pasos para consistencia visual, pero Marcando como completado el que no aplique
        checklist: {
          create: [
            { pas_nom: 'Designar Profesores Referentes', completat: false },
            { pas_nom: 'Subir Registro Nominal (Excel)', completat: false },
            { pas_nom: 'Acuerdo Pedagógico (Modalidad C)', completat: request.modalitat !== 'C' }
          ]
        }
      }
    });

    res.status(201).json(newAssignment);
  } catch (error) {
    console.error("Error al crear asignación:", error);
    res.status(500).json({ error: 'Error al crear l\'assignació.' });
  }
};

// POST: Publicar Asignaciones (Admin Only)
export const publishAssignments = async (req: Request, res: Response) => {
  const { role } = req.user!;
  if (role !== ROLES.ADMIN) return res.status(403).json({ error: 'No autoritzat' });

  try {
    const result = await prisma.assignment.updateMany({
      where: { estat: 'PROVISIONAL' },
      data: { estat: 'PUBLISHED' }
    });

    // Notify centers (simplified logic)
    await prisma.notification.create({
      data: {
        titol: 'Assignmentns Publicades',
        missatge: 'Ja podeu consultar les assignacions i començar a introduir les dades.',
        type: 'PHASE',
        importance: 'URGENT'
      }
    });

    res.json({ message: `${result.count} assignacions publicades correctament.` });
  } catch (error) {
    res.status(500).json({ error: 'Error al publicar assignacions.' });
  }
};

// POST: Realizar Registro Nominal (Inscribir alumnos en una asignación)
export const createEnrollments = async (req: Request, res: Response) => {
  const idAssignment = parseInt(req.params.idAssignment as string);
  const { ids_students } = req.body; // Array de IDs de alumnos

  try {
    const result = await prisma.$transaction(async (tx: any) => {
      // 1. Verificar existencia de la asignación
      const assignment = await tx.assignment.findUnique({
        where: { id_assignment: idAssignment },
        include: { enrollments: true }
      });

      if (!assignment) {
        throw new Error('Assignació no trobada.');
      }

      // 2. Validación de Cupo (Máx 4 alumnos en Mod C)
      const workshop = await tx.workshop.findUnique({ where: { id_workshop: assignment.id_workshop } });
      if (workshop?.modalitat === 'C' && ids_students.length > 4) {
        throw new Error('Límit superat: En Modalitat C només es permeten un màxim de 4 alumnes per centre.');
      }

      // 3. Sincronizar inscripciones
      const currentIds = assignment.enrollments.map((i: any) => i.id_student);
      const newIds = ids_students.map((id: any) => parseInt(id));

      const toAdd = newIds.filter((id: number) => !currentIds.includes(id));
      const toRemove = currentIds.filter((id: number) => !newIds.includes(id));

      if (toRemove.length > 0) {
        await tx.enrollment.deleteMany({
          where: {
            id_assignment: idAssignment,
            id_student: { in: toRemove }
          }
        });
      }

      for (const idStudent of toAdd) {
        await tx.enrollment.create({
          data: {
            id_assignment: idAssignment,
            id_student: idStudent
          }
        });
      }

      // 4. Actualizar estado si ya tiene profes y alumnos
      // Logic: If documented and teachers ok, state => DATA_SUBMITTED?
      // For now, update checklist
      await tx.assignmentChecklist.updateMany({
        where: {
          id_assignment: idAssignment,
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
export const designateTeachers = async (req: Request, res: Response) => {
  const { idAssignment } = req.params;
  const { teacher1_id, teacher2_id } = req.body;

  try {
    // 1. Validar que los profesores sean diferentes
    if (teacher1_id === teacher2_id) {
      return res.status(400).json({ error: 'Has de designar dos professors diferents.' });
    }

    const oldAssignment = await prisma.assignment.findUnique({ where: { id_assignment: parseInt(idAssignment as string) } });
    
    const updated = await prisma.assignment.update({
      where: { id_assignment: parseInt(idAssignment as string) },
      data: {
        teacher1_id,
        teacher2_id,
        estat: 'DATA_ENTRY' // Transition state once they start filling data
      }
    });

    if (oldAssignment) {
        await logStatusChange(parseInt(idAssignment as string), oldAssignment.estat, 'DATA_ENTRY');
    }

    // Actualizar checklist
    await prisma.assignmentChecklist.updateMany({
      where: {
        id_assignment: parseInt(idAssignment as string),
        pas_nom: { contains: 'Profesores Referentes' }
      },
      data: {
        completat: !!(teacher1_id && teacher2_id),
        data_completat: (teacher1_id && teacher2_id) ? new Date() : null
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
  const idAssignment = req.params.idAssignment as string;
  const { aprobado, feedback } = req.body;
  const { role } = req.user!;

  if (role !== ROLES.ADMIN) return res.status(403).json({ error: 'No autorizado' });

  try {
    const oldAssignment = await prisma.assignment.findUnique({ where: { id_assignment: parseInt(idAssignment) } });
    const newState = aprobado ? 'VALIDATED' : 'DATA_ENTRY';
    
    await prisma.assignment.update({
      where: { id_assignment: parseInt(idAssignment) },
      data: { 
        estat: newState,
      }
    });

    if (oldAssignment) {
        await logStatusChange(parseInt(idAssignment), oldAssignment.estat, newState);
    }

    res.json({ message: `Assignació ${aprobado ? 'validada' : 'rebutjada'} correctament.` });
  } catch (error) {
    res.status(500).json({ error: 'Error al validar dades.' });
  }
};

// POST: Enviar Notificación de Documento Incorrecto
export const sendDocumentNotification = async (req: Request, res: Response) => {
  const idAssignment = req.params.idAssignment as string;
  const { documentName, comment, greeting } = req.body;
  const { role } = req.user!;

  if (role !== ROLES.ADMIN) return res.status(403).json({ error: 'No autorizado' });

  try {
    const assignment = await prisma.assignment.findUnique({
      where: { id_assignment: parseInt(idAssignment) },
      include: { 
        center: true,
        workshop: true
      }
    });

    if (!assignment) {
      return res.status(404).json({ error: 'Assignació no trobada' });
    }

    const missatge = `${greeting}, el document ${documentName} del taller ${assignment.workshop.titol} està malament. ${comment}`;

    await createNotificationInterna({
      id_center: assignment.id_center,
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
  const { role } = req.user!;
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
  const idAssignment = req.params.idAssignment as string;
  try {
    // 1. Marcar inscripciones como confirmadas
    await prisma.enrollment.updateMany({
      where: { id_assignment: parseInt(idAssignment) },
      data: { registre_ceb_confirmat: true }
    });

    // 2. Obtener datos del taller para generar sesiones
    const assignment = await prisma.assignment.findUnique({
      where: { id_assignment: parseInt(idAssignment) },
      include: { workshop: true }
    });

    if (!assignment || !assignment.workshop) {
        return res.status(404).json({ error: 'Assignació no trobada' });
    }

    // 3. Generar sesiones si no existen
    // Comprobamos si ya hay sesiones para no duplicar si le dan dos veces
    const existingSessions = await prisma.session.count({
        where: { id_assignment: parseInt(idAssignment) }
    });

    if (existingSessions === 0) {
        const schedule = assignment.workshop.dies_execucio as any[]; 
        
        // 3.1 Obtener fechas de la Phase 3
        const { phase: phase3 } = await isPhaseActive(PHASES.EJECUCION);
        
        if (phase3 && Array.isArray(schedule) && schedule.length > 0) {
            const startDate = new Date(Math.max(new Date().getTime(), phase3.data_inici.getTime()));
            const endDate = phase3.data_fi;
            
            // Buscar los usuarios asociados a los profesores referentes para auto-asignarlos
            const referentTeachers = await prisma.teacher.findMany({
                where: { id_teacher: { in: [assignment.teacher1_id, assignment.teacher2_id].filter(Boolean) as number[] } },
                select: { id_user: true }
            });
            const referentUserIds = referentTeachers.map((p: any) => p.id_user).filter(Boolean) as number[];

            // Iterar por semanas desde startDate hasta endDate
            const currentPointer = new Date(startDate);
            while (currentPointer <= endDate) {
                for (const slot of schedule) {
                    const sessionDate = new Date(currentPointer);
                    
                    // Calcular el día de la semana deseado para esta sesión
                    const currentDay = sessionDate.getDay(); 
                    const daysUntil = (slot.dayOfWeek + 7 - currentDay) % 7;
                    sessionDate.setDate(sessionDate.getDate() + daysUntil);

                    // Verificar que seguimos dentro del rango de la fase
                    if (sessionDate >= startDate && sessionDate <= endDate) {
                        // Crear la sesión
                        await prisma.session.create({
                            data: {
                                id_assignment: assignment.id_assignment,
                                data_session: sessionDate,
                                hora_inici: slot.startTime,
                                hora_fi: slot.endTime
                            }
                        });
                    }
                }
                // Avanzar a la siguiente semana
                currentPointer.setDate(currentPointer.getDate() + 7);
            }
        }
    }

    const oldAssignment = await prisma.assignment.findUnique({ where: { id_assignment: parseInt(idAssignment) } });

    // 4. Actualizar estado de la asignación a 'IN_PROGRESS'
    await prisma.assignment.update({
        where: { id_assignment: parseInt(idAssignment) },
        data: { estat: 'IN_PROGRESS' }
    });

    if (oldAssignment) {
        await logStatusChange(parseInt(idAssignment), oldAssignment.estat, 'IN_PROGRESS');
    }

    // 5. Enviar notificació al centre confirmant l'inici del taller
    await createNotificationInterna({
        id_center: assignment.id_center,
        titol: 'Registre Confirmat: Workshop en Marxa',
        missatge: `El registre per al taller "${assignment.workshop.titol}" s'ha completat correctament. El taller ja està actiu i les sessions s'han generat al vostre calendari.`,
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
export const validateEnrollmentDocument = async (req: Request, res: Response) => {
    const { idEnrollment } = req.params;
    const { field, valid } = req.body; // field: 'validat_acord_pedagogic', etc.
    const { role } = req.user!;

    if (role !== ROLES.ADMIN) {
        return res.status(403).json({ error: 'Només els administradors poden validar documents.' });
    }

    const permittedFields = ['validat_acord_pedagogic', 'validat_autoritzacio_mobilitat', 'validat_drets_imatge'];
    if (!permittedFields.includes(field)) {
        return res.status(400).json({ error: 'Camp de validació no vàlid.' });
    }

    try {
        const updated = await prisma.enrollment.update({
            where: { id_enrollment: parseInt(idEnrollment as string) },
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
async function logStatusChange(idAssignment: number, oldState: string, newState: string) {
    if (oldState === newState) return;
    try {
        const a = await prisma.assignment.findUnique({
            where: { id_assignment: idAssignment },
            include: { center: true, workshop: true }
        });
        if (a) {
            console.log(`[STATUS CHANGE] Center: ${a.center.nom} - Workshop: ${a.workshop.titol} - From: ${oldState} - To: ${newState}`);
        }
    } catch (e) {
        console.error("Error logging status change:", e);
    }
}
// POST: Actualitzar Documents de Conformitat (Centro)
export const updateComplianceDocuments = async (req: Request, res: Response) => {
  const idAssignment = req.params.idAssignment as string;
  const { idStudent, acord_pedagogic, autoritzacio_mobilitat, drets_imatge } = req.body;

  try {
    const updated = await prisma.enrollment.update({
      where: {
        id_enrollment: parseInt(idStudent) // Assuming we update per student or per assignment
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
  const { idAssignment } = req.params;
  const { idEnrollment, documentType } = req.body;
  
  if (!req.file) {
    return res.status(400).json({ error: 'No s\'ha pujat cap fitxer.' });
  }

  try {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id_enrollment: parseInt(idEnrollment) },
      include: {
        student: true,
        assignment: {
          include: {
            workshop: true
          }
        }
      }
    });

    if (!enrollment || !enrollment.student || !enrollment.assignment?.workshop) {
      return res.status(404).json({ error: 'Inscripció o dades associades no trobades.' });
    }

    const { student, assignment } = enrollment;
    const workshop = assignment.workshop;

    const fileExt = path.extname(req.file.originalname);
    
    // Generar nom descriptiu
    const studentName = sanitizeFileName(`${student.nom}_${student.cognoms}`);
    const studentCourse = sanitizeFileName(student.curs || 'sense_curs');
    const workshopTitle = sanitizeFileName(workshop.titol);
    
    const fileName = `${studentName}_${studentCourse}_${workshopTitle}_${documentType}_${Date.now()}${fileExt}`;
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

    const updated = await prisma.enrollment.update({
      where: { id_enrollment: parseInt(idEnrollment) },
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
  const idAssignment = req.params.idAssignment as string;
  try {
    const sessions = await prisma.session.findMany({
      where: { id_assignment: parseInt(idAssignment) },
      orderBy: { data_session: 'asc' }
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
  const idAssignment = req.params.idAssignment as string;
  const { idUser, esPrincipal } = req.body;

  try {
    const relation = await prisma.assignmentTeacher.upsert({
      where: {
        id_assignment_id_user: {
          id_assignment: parseInt(idAssignment),
          id_user: parseInt(idUser)
        }
      },
      update: {
        es_principal: esPrincipal || false
      },
      create: {
        id_assignment: parseInt(idAssignment),
        id_user: parseInt(idUser),
        es_principal: esPrincipal || false
      }
    });
    res.status(201).json(relation);
  } catch (error) {
    res.status(500).json({ error: 'Error al afegir professor a l\'equip' });
  }
};

export const removeTeachingStaff = async (req: Request, res: Response) => {
  const idAssignment = req.params.idAssignment as string;
  const idUser = req.params.idUser as string;

  try {
    await prisma.assignmentTeacher.delete({
      where: {
        id_assignment_id_user: {
          id_assignment: parseInt(idAssignment),
          id_user: parseInt(idUser)
        }
      }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar professor de l\'equip' });
  }
};

// Phase 3: Dynamic Session Teaching Staff
export const addSessionTeacher = async (req: Request, res: Response) => {
  const { idSession } = req.params;
  const { idUser } = req.body;

  try {
    const relation = await prisma.sessionTeacher.upsert({
      where: {
        id_session_id_user: {
          id_session: parseInt(idSession as string),
          id_user: parseInt(idUser)
        }
      },
      update: {}, // No update needed if exists
      create: {
        id_session: parseInt(idSession as string),
        id_user: parseInt(idUser)
      }
    });
    res.status(201).json(relation);
  } catch (error) {
    console.error("Error al afegir professor a la sessió:", error);
    res.status(500).json({ error: 'Error al afegir professor a la sessió' });
  }
};

export const removeSessionTeacher = async (req: Request, res: Response) => {
  const { idSession, idUser } = req.params;

  try {
    await prisma.sessionTeacher.delete({
      where: {
        id_session_id_user: {
          id_session: parseInt(idSession as string),
          id_user: parseInt(idUser as string)
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
export const closeAssignment = async (req: Request, res: Response) => {
  res.status(501).json({ error: 'Funcionalitat no implementada: closeAssignment' });
};
