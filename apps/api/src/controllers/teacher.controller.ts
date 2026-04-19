import prisma from '../lib/prisma.js';
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { ROLES } from '@iter/shared';

export const getTeachers = async (req: Request, res: Response) => {
  const { centerId, role } = req.user! || {};

  try {
    const where: any = {};

    // Scoping: Admin sees all, others only their center
    if (role !== ROLES.ADMIN) {
      if (!centerId) {
        return res.json([]); // No center assigned, no access
      }
      where.centerId = centerId;
    }

    const teachers = await prisma.teacher.findMany({
      where,
      include: {
        center: true,
        user: {
          select: {
            userId: true,
            email: true,
            photoUrl: true
          }
        }
      }
    });
    res.json(teachers);
  } catch (error) {
    console.error("Error in teacher.controller.getTeachers:", error);
    res.status(500).json({ error: 'Failed to retrieve teachers' });
  }
};

export const createTeacher = async (req: Request, res: Response) => {
  const { centerId } = req.user!;
  const { name, contact, password } = req.body;

  try {
    const finalCenterId = centerId ? centerId : req.body.centerId;

    if (!finalCenterId) {
      return res.status(400).json({ error: 'Center ID is required.' });
    }

    // Use a transaction to ensure both user and teacher are created or neither
    const result = await prisma.$transaction(async (tx: any) => {
      // 1. Find the teacher role
      const teacherRole = await tx.role.findFirst({
        where: { roleName: ROLES.TEACHER }
      });

      if (!teacherRole) throw new Error(`Role ${ROLES.TEACHER} not found.`);

      // 2. Create the user
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password || 'Iter@1234', salt);

      const user = await tx.user.create({
        data: {
          fullName: name,
          email: contact, // Use contact as primary email
          passwordHash: passwordHash,
          roleId: teacherRole.roleId,
          centerId: finalCenterId
        }
      });

      // 3. Create the linked teacher
      const teacher = await tx.teacher.create({
        data: {
          name: name,
          contact: contact,
          centerId: finalCenterId,
          userId: user.userId
        }
      });

      return teacher;
    });

    res.json(result);
  } catch (error: any) {
    console.error("Error in teacher.controller.createTeacher:", error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'This email is already in use.' });
    }
    res.status(500).json({ error: 'Failed to create teacher and user.' });
  }
};

export const updateTeacher = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, contact, password, email, centerId } = req.body;
  
  try {
    const teacherId = parseInt(id as string);
    
    const result = await prisma.$transaction(async (tx) => {
      // 1. Get existing teacher to find user
      const existingTeacher = await tx.teacher.findUnique({
        where: { teacherId },
        include: { user: true }
      });
      
      if (!existingTeacher) throw new Error('Teacher not found');

      // 2. Update User data if provided
      const userData: any = {};
      if (name) userData.fullName = name;
      if (email) userData.email = email;
      if (password) {
        const bcrypt = await import('bcrypt');
        userData.passwordHash = await bcrypt.default.hash(password, 10);
      }

      if (Object.keys(userData).length > 0) {
        await tx.user.update({
          where: { userId: existingTeacher.userId },
          data: userData
        });
      }

      // 3. Update Teacher data
      const teacherData: any = {};
      if (name) teacherData.name = name;
      if (contact) teacherData.contact = contact;
      if (centerId) teacherData.centerId = parseInt(centerId);

      return await tx.teacher.update({
        where: { teacherId },
        data: teacherData,
        include: {
          user: {
            select: {
              userId: true,
              fullName: true,
              email: true,
              photoUrl: true
            }
          }
        }
      });
    });

    res.json(result);
  } catch (error: any) {
    console.error("Error in teacher.controller.updateTeacher:", error);
    res.status(500).json({ error: error.message || 'Failed to update teacher' });
  }
};

export const deleteTeacher = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.teacher.delete({
      where: { teacherId: parseInt(id as string) }
    });
    res.json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    console.error("Error in teacher.controller.deleteTeacher:", error);
    res.status(500).json({ error: 'Failed to delete teacher' });
  }
};

export const getTeacherAssignments = async (req: Request, res: Response) => {
  const { userId, centerId } = req.user!;

  try {
    // Verify user belongs to center or is admin (optional safety check)
    if (!centerId) {
      return res.json([]);
    }

    const assignments = await prisma.assignment.findMany({
      where: {
        teachers: { some: { userId: userId } }
      },
      include: {
        workshop: true,
        center: true,
        teachers: {
          include: {
            user: {
              select: {
                userId: true,
                fullName: true,
                email: true
              }
            }
          }
        },
        sessions: {
          orderBy: { sessionDate: 'asc' }
        },
        questionnaires: {
          where: {
            target: 'TEACHER',
            isCompleted: true
          },
          select: {
            questionnaireId: true,
            isCompleted: true,
            target: true
          }
        }
      }
    });

    // Map questionnaires to submissions for frontend compatibility
    const transformed = assignments.map(assig => ({
      ...assig,
      submissions: assig.questionnaires.map(q => ({
        ...q,
        status: q.isCompleted ? 'RESPONDED' : 'PENDING'
      }))
    }));

    res.json(transformed);
  } catch (error) {
    console.error("Error fetching teacher assignments:", error);
    res.status(500).json({ error: 'Failed to retrieve center assignments.' });
  }
};

export const getTeachersByCenter = async (req: Request, res: Response) => {
  const { centerId: targetCenterId } = req.params;
  const { centerId, role } = req.user! || {};

  try {
    // Scoping check
    if (role !== ROLES.ADMIN && parseInt(targetCenterId as string) !== centerId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const teachers = await prisma.teacher.findMany({
      where: { centerId: parseInt(targetCenterId as string) },
      include: {
        user: {
          select: {
            userId: true,
            email: true,
            fullName: true,
            photoUrl: true
          }
        }
      }
    });

    res.json(teachers);
  } catch (error) {
    console.error("Error fetching teachers by center:", error);
    res.status(500).json({ error: 'Failed to retrieve teachers from the center.' });
  }
};
