import { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import { isPhaseActive, PHASES } from '../lib/phaseUtils.js';

/**
 * Registra o actualiza la asistencia de un alumno en una sesión.
 */
export const registerAttendance = async (req: Request, res: Response) => {
  const { assistencia, id_assignment } = req.body;

  try {
    if (!Array.isArray(assistencia) || !id_assignment) {
        return res.status(400).json({ error: 'Format de dades incorrecte. S\'espera array d\'assistencia i id_assignment.' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Determines session number (defaults to 1 if not strictly scheduled)
    const sessionMatch = await prisma.session.findFirst({
        where: { 
            id_assignment: parseInt(id_assignment),
            data_sessio: today
        }
    });
    const sessionNum = sessionMatch ? sessionMatch.id_sessio : 1;

    // Helper to map mobile status (UPPERCASE) to Prisma Enum (PascalCase)
    const mapStatus = (status: string) => {
        switch (status) {
            case 'PRESENT': return 'Present';
            case 'ABSENT': return 'Absencia'; // Maps to "Absencia" or "Absencia_Justificada" if needed
            case 'RETARD': return 'Retard';
            default: return 'Present'; // Fallback
        }
    };

    const results = await Promise.all(assistencia.map(async (item: any) => {
        // Resolve student ID
        const idStudentInt = parseInt(item.id_student);
        
        // Find Enrollment (Enrollment)
        const validEnrollment = await prisma.enrollment.findFirst({
             where: {
                 id_assignment: parseInt(id_assignment),
                 id_student: idStudentInt
             }
        });

        if (!validEnrollment) return null;

        const prismaStatus = mapStatus(item.estat);

        // Check for existing attendance today
        const existing = await prisma.attendance.findFirst({
            where: {
                id_enrollment: validEnrollment.id_enrollment,
                data_sessio: today
            }
        });

        if (existing) {
            return prisma.attendance.update({
                where: { id_attendance: existing.id_attendance },
                data: {
                    estat: prismaStatus as any, // Cast to any to avoid strict typing issues with generated enums if imports missing
                    observacions: item.observacions
                }
            });
        } else {
            return prisma.attendance.create({
                data: {
                    id_enrollment: validEnrollment.id_enrollment,
                    numero_sessio: sessionNum,
                    data_sessio: today,
                    estat: prismaStatus as any, 
                    observacions: item.observacions
                }
            });
        }
    }));

    res.json({ success: true, processed: results.filter(r => r !== null).length });
  } catch (error) {
    console.error("Error en registerAttendance:", error);
    res.status(500).json({ error: 'Error al registrar l\'assistència.' });
  }
};

/**
 * Obtiene la asistencia de una asignación completa.
 */
export const getAttendanceByAssignment = async (req: Request, res: Response) => {
  const { idAssignment } = req.params;

  try {
    const assistencies = await prisma.attendance.findMany({
      where: {
        inscripcio: {
          id_assignment: parseInt(idAssignment as string)
        }
      },
      include: {
        inscripcio: {
          include: {
            alumne: true
          }
        }
      }
    });

    res.json(assistencies);
  } catch (error) {
    console.error("Error en assistencia.controller.getAttendanceByAssignment:", error);
    res.status(500).json({ error: 'Error al carregar l\'assistència.' });
  }
};
