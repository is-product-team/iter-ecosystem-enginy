import { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

/**
 * Registers or updates student attendance in a session.
 */
export const registerAttendance = async (req: Request, res: Response) => {
  const { attendance, assignmentId } = req.body;

  try {
    if (!Array.isArray(attendance) || !assignmentId) {
      return res.status(400).json({ error: 'Incorrect data format. Expected an array of attendance and assignmentId.' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Determines session number (defaults to 1 if not strictly scheduled)
    const sessionMatch = await prisma.session.findFirst({
      where: {
        assignmentId: parseInt(assignmentId),
        sessionDate: today
      }
    });
    const sessionNum = sessionMatch ? sessionMatch.sessionId : 1;

    // Helper to map status to Prisma Enum
    const mapStatus = (status: string) => {
      switch (status) {
        case 'PRESENT': return 'PRESENT';
        case 'ABSENT': return 'ABSENT';
        case 'JUSTIFIED_ABSENCE': return 'JUSTIFIED_ABSENCE';
        case 'LATE': return 'LATE';
        default: return 'PRESENT'; // Fallback
      }
    };

    const results = await Promise.all(attendance.map(async (item: any) => {
      const studentIdInt = parseInt(item.studentId);

      // Find Enrollment
      const validEnrollment = await prisma.enrollment.findFirst({
        where: {
          assignmentId: parseInt(assignmentId),
          studentId: studentIdInt
        }
      });

      if (!validEnrollment) return null;

      const prismaStatus = mapStatus(item.status);

      // Check for existing attendance today
      const existing = await prisma.attendance.findFirst({
        where: {
          enrollmentId: validEnrollment.enrollmentId,
          sessionDate: today
        }
      });

      if (existing) {
        return prisma.attendance.update({
          where: { attendanceId: existing.attendanceId },
          data: {
            status: prismaStatus as any,
            observations: item.observations
          }
        });
      } else {
        return prisma.attendance.create({
          data: {
            enrollmentId: validEnrollment.enrollmentId,
            sessionNumber: sessionNum,
            sessionDate: today,
            status: prismaStatus as any,
            observations: item.observations
          }
        });
      }
    }));

    res.json({ success: true, processed: results.filter(r => r !== null).length });
  } catch (error) {
    console.error("Error in registerAttendance:", error);
    res.status(500).json({ error: 'Error registering attendance.' });
  }
};

/**
 * Obtains attendance for a complete assignment.
 */
export const getAttendanceByAssignment = async (req: Request, res: Response) => {
  const { assignmentId } = req.params;

  try {
    const attendances = await prisma.attendance.findMany({
      where: {
        enrollment: {
          assignmentId: parseInt(assignmentId as string)
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

    res.json(attendances);
  } catch (error) {
    console.error("Error in getAttendanceByAssignment:", error);
    res.status(500).json({ error: 'Error loading attendance.' });
  }
};
