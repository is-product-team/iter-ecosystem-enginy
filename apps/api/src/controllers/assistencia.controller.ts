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
        sessionDate: today
      }
    });
    const sessionNum = sessionMatch ? sessionMatch.id_session : 1;

    // Helper to map mobile status (UPPERCASE) to Prisma Enum (uppercase English)
    const mapStatus = (status: string) => {
      switch (status) {
        case 'PRESENT': return 'PRESENT';
        case 'ABSENT': return 'ABSENCE';
        case 'RETARD': return 'LATE';
        default: return 'PRESENT'; // Fallback
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
          sessionDate: today
        }
      });

      if (existing) {
        return prisma.attendance.update({
          where: { id_attendance: existing.id_attendance },
          data: {
            status: prismaStatus as any,
            observations: item.observacions
          }
        });
      } else {
        return prisma.attendance.create({
          data: {
            id_enrollment: validEnrollment.id_enrollment,
            sessionNumber: sessionNum,
            sessionDate: today,
            status: prismaStatus as any,
            observations: item.observacions
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
        enrollment: {
          id_assignment: parseInt(idAssignment as string)
        }
      },
      include: {
        enrollment: {
          include: {
            student: true
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
