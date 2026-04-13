import prisma from '../lib/prisma.js';
import { Request, Response } from 'express';
import { AssignmentChecklistSchema, ROLES, REQUEST_STATUSES, CHECKLIST_STEPS } from '@iter/shared';
import { createNotificationInternal } from './notification.controller.js';
import { VisionService } from '../services/vision.service.js';
import { AutoAssignmentService } from '../services/auto-assignment.service.js';
import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import { SessionService } from '../services/session.service.js';
import { PDFService } from '../services/pdf.service.js';
import { EvaluationService } from '../services/evaluation.service.js';
import { ClosureService } from '../services/closure.service.js';

const closureService = new ClosureService();
const evaluationService = new EvaluationService();
const visionService = new VisionService();

// Helper to flatten enrollment docsStatus for frontend compatibility
const flattenEnrollmentDocs = (enrollment: any) => {
  const docsStatus = enrollment.docsStatus || {};
  return {
    ...enrollment,
    pedagogicalAgreementUrl: docsStatus.pedagogicalAgreementUrl || null,
    mobilityAuthorizationUrl: docsStatus.mobilityAuthorizationUrl || null,
    imageRightsUrl: docsStatus.imageRightsUrl || null,
    isPedagogicalAgreementValidated: docsStatus.isPedagogicalAgreementValidated || false,
    isMobilityAuthorizationValidated: docsStatus.isMobilityAuthorizationValidated || false,
    isImageRightsValidated: docsStatus.isImageRightsValidated || false
  };
};

const MIN_ATTENDANCE_PERCENTAGE = 80;

// Schema for bulk attendance update
const AttendanceUpdateSchema = z.array(z.object({
  enrollmentId: z.number(),
  status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'JUSTIFIED_ABSENCE']),
  observations: z.string().optional().nullable()
}));

// GET: All assignments (Admin only)
export const getAssignments = async (req: Request, res: Response) => {
  const { role } = req.user!;

  if (role !== ROLES.ADMIN) {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    const assignments = await prisma.assignment.findMany({
      include: {
        workshop: true,
        center: true,
        checklist: true,
        request: true, // Include request for fallback dates
        sessions: {
          orderBy: { sessionDate: 'asc' }
        },
        teachers: {
          include: {
            user: {
              select: {
                userId: true,
                fullName: true,
                photoUrl: true
              }
            }
          }
        },
        enrollments: {
          include: {
            student: true
          }
        }
      },
      orderBy: {
        assignmentId: 'desc'
      }
    });

    // Transform assignments to flatten enrollment docs and handle dates
    const transformed = assignments.map(assig => ({
      ...assig,
      startDate: assig.startDate || assig.sessions[0]?.sessionDate || null,
      endDate: assig.endDate || assig.sessions[assig.sessions.length - 1]?.sessionDate || null,
      enrollments: assig.enrollments.map(flattenEnrollmentDocs)
    }));

    res.json(transformed);
  } catch (_error) {
    res.status(500).json({ error: 'Error obtaining assignments' });
  }
};

// GET: One assignment by ID (Full detail)
export const getAssignmentById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { centerId, role } = req.user!;

  try {
    const assignment = await prisma.assignment.findUnique({
      where: { assignmentId: parseInt(id as string) },
      include: {
        workshop: true,
        center: true,
        checklist: true,
        request: true,
        sessions: {
          orderBy: { sessionDate: 'asc' },
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
            student: true,
            evaluations: true,
            attendance: true
          }
        }
      }
    });

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Transform
    const transformed = {
      ...assignment,
      startDate: assignment.startDate || assignment.sessions[0]?.sessionDate || null,
      endDate: assignment.endDate || assignment.sessions[assignment.sessions.length - 1]?.sessionDate || null,
      enrollments: assignment.enrollments.map(flattenEnrollmentDocs)
    };

    // Security Scoping
    if (role !== ROLES.ADMIN && Number(assignment.centerId) !== Number(centerId)) {
      return res.status(403).json({ error: 'Access denied: You cannot view assignments from another center' });
    }

    res.json(transformed);
  } catch (_error) {
    res.status(500).json({ error: 'Error obtaining assignment details' });
  }
};

// GET: List assignments of a center
export const getAssignmentsByCenter = async (req: Request, res: Response) => {
  const { idCenter: targetCenterId } = req.params;
  const { centerId, role } = req.user!;

  let queryCenterId = parseInt(targetCenterId as string);

  // Security Scoping
  if (role !== ROLES.ADMIN) {
    if (!centerId) {
      return res.status(403).json({ error: 'Access denied: Your account has no center assigned' });
    }

    // Explicitly check if the requested centerId matches the user's centerId
    if (queryCenterId !== centerId) {
      return res.status(403).json({ error: 'Access denied: You cannot view assignments from another center' });
    }

    // For Coordinators/Teachers, we use the centerId from their token (already verified match)
    queryCenterId = centerId;
  }

  try {
    const assignments = await prisma.assignment.findMany({
      where: { centerId: queryCenterId },
      include: {
        workshop: true,
        center: true,
        checklist: true,
        request: true,
        teachers: {
          include: { user: { select: { fullName: true, userId: true } } }
        },
        sessions: {
          orderBy: { sessionDate: 'asc' },
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
            evaluations: true
          }
        }
      }
    });

    const transformed = assignments.map(assig => ({
      ...assig,
      startDate: assig.startDate || assig.sessions[0]?.sessionDate || null,
      endDate: assig.endDate || assig.sessions[assig.sessions.length - 1]?.sessionDate || null,
      enrollments: assig.enrollments.map(flattenEnrollmentDocs)
    }));

    res.json(transformed);
  } catch (_error) {
    res.status(500).json({ error: 'Error obtaining assignments' });
  }
};

// GET: Get students enrolled in an assignment
export const getStudents = async (req: Request, res: Response) => {
  const { idAssignment: assignmentId } = req.params;

  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { assignmentId: parseInt(assignmentId as string) },
      include: {
        student: true,
        evaluations: { select: { evaluationId: true } } // include evaluation check
      }
    });

    // Flatten structure to return just students with relevant info + evaluated status
    const students = enrollments.map((i: any) => ({
      ...i.student,
      evaluated: i.evaluations.length > 0 // true if exists, false otherwise
    }));
    res.json(students);
  } catch (_error) {
    res.status(500).json({ error: 'Error obtaining students' });
  }
};

// GET: Checklist of an assignment
export const getChecklist = async (req: Request, res: Response) => {
  const { idAssignment: assignmentId } = req.params;
  try {
    const checklist = await prisma.assignmentChecklist.findMany({
      where: { assignmentId: parseInt(assignmentId as string) }
    });
    res.json(checklist);
  } catch (_error) {
    res.status(500).json({ error: 'Error obtaining the checklist' });
  }
};

// PATCH: Update checklist item
export const updateChecklistItem = async (req: Request, res: Response) => {
  const { idItem: itemId } = req.params;
  const result = AssignmentChecklistSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ error: 'Invalid validation data', details: result.error.format() });
  }

  const { isCompleted, evidenceUrl } = result.data;

  try {
    const updated = await prisma.assignmentChecklist.update({
      where: { checklistId: parseInt(itemId as string) },
      data: {
        isCompleted: isCompleted,
        evidenceUrl,
        completedAt: isCompleted ? new Date() : null
      }
    });
    res.json(updated);
  } catch (_error) {
    res.status(500).json({ error: 'Error updating the checklist' });
  }
};

// GET: Issues of a center
export const getIssuesByCenter = async (req: Request, res: Response) => {
  const { idCenter: targetCenterId } = req.params;
  const { centerId, role } = req.user!;

  let queryCenterId = parseInt(targetCenterId as string);

  // Security Scoping
  if (role !== ROLES.ADMIN) {
    if (!centerId) {
      return res.status(403).json({ error: 'Access denied: Your account has no center assigned' });
    }
    // For non-admins, force their own centerId
    queryCenterId = centerId;
  }

  try {
    const issues = await prisma.issue.findMany({
      where: { centerId: queryCenterId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(issues);
  } catch (_error) {
    res.status(500).json({ error: 'Error obtaining issues' });
  }
};

// POST: Create issue
export const createIssue = async (req: Request, res: Response) => {
  const { centerId, description, assignmentId, sessionId } = req.body;
  try {
    const newIssue = await prisma.issue.create({
      data: {
        centerId: parseInt(centerId),
        description: description,
        assignmentId: assignmentId ? parseInt(assignmentId) : undefined,
        sessionId: sessionId ? parseInt(sessionId) : undefined
      } as any
    });
    res.status(201).json(newIssue);
  } catch (error) {
    console.error("Error creating issue:", error);
    res.status(500).json({ error: 'Error creating issue and executing risk analysis' });
  }
};

// POST: Validate document upload (Vision AI)
export const validateDocumentUpload = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const visionService = new VisionService();
    const validation = await visionService.validateDocument(req.file);

    if (!validation.valid) {
      // Reject upload
      return res.status(400).json({
        error: 'Document rejected by AI.',
        details: validation.errors,
        metadata: validation.metadata
      });
    }

    res.json({
      success: true,
      message: 'Document validated and accepted correctly.',
      metadata: validation.metadata
    });

  } catch (error) {
    console.error("Error in document validation:", error);
    res.status(500).json({ error: 'Error processing the document.' });
  }
};

// POST: Create Assignment from Request (Admin Only)
export const createAssignmentFromRequest = async (req: Request, res: Response) => {
  const { requestId } = req.body;
  const { role } = req.user!;

  if (role !== ROLES.ADMIN) {
    return res.status(403).json({ error: 'Only administrators can perform assignments.' });
  }

  try {
    const request = await prisma.request.findUnique({
      where: { requestId: parseInt(requestId) },
      include: { center: true, workshop: true }
    });

    if (!request) {
      return res.status(404).json({ error: 'Request not found.' });
    }

    if (request.status !== REQUEST_STATUSES.APPROVED) {
      return res.status(400).json({ error: 'The request must be approved to create an assignment.' });
    }

    // Check if an assignment already exists for this request
    const existing = await prisma.assignment.findFirst({
      where: { requestId: request.requestId }
    });

    if (existing) {
      return res.status(400).json({ error: 'An assignment already exists for this request.' });
    }

    const newAssignment = await prisma.assignment.create({
      data: {
        requestId: request.requestId,
        centerId: request.centerId,
        workshopId: request.workshopId,
        status: 'PUBLISHED',
        teachers: {
          create: [
            ...(request.prof1Id ? [{ userId: request.prof1Id, isPrincipal: true }] : []),
            ...(request.prof2Id ? [{ userId: request.prof2Id, isPrincipal: false }] : [])
          ]
        },
        // Initialize default checklist for Phase 2
        checklist: {
          create: [
            { stepName: CHECKLIST_STEPS.DESIGNATE_TEACHERS, isCompleted: true },
            { stepName: CHECKLIST_STEPS.INPUT_STUDENTS, isCompleted: false },
            { stepName: CHECKLIST_STEPS.CONFIRM_REGISTRATION, isCompleted: false },
            { stepName: CHECKLIST_STEPS.PEDAGOGICAL_AGREEMENT, isCompleted: request.modality !== 'C' }
          ]
        }
      }
    });

    res.status(201).json(newAssignment);
  } catch (error) {
    console.error("Error creating assignment:", error);
    res.status(500).json({ error: 'Error creating assignment.' });
  }
};

// POST: Publish Assignments (Admin Only)
export const publishAssignments = async (req: Request, res: Response) => {
  const { role } = req.user!;
  if (role !== ROLES.ADMIN) return res.status(403).json({ error: 'Unauthorized' });

  try {
    const result = await prisma.assignment.updateMany({
      where: { status: 'PUBLISHED' },
      data: { status: 'DATA_ENTRY' }
    });

    // Notify centers (simplified logic)
    await prisma.notification.create({
      data: {
        title: 'Assignments Published',
        message: 'You can now consult the assignments and start entering data.',
        type: 'PHASE',
        importance: 'URGENT'
      }
    });

    res.json({ message: `${result.count} assignments published correctly.` });
  } catch (_error) {
    res.status(500).json({ error: 'Error publishing assignments.' });
  }
};

// POST: Perform Nominal Registration (Enroll students in an assignment)
export const createEnrollments = async (req: Request, res: Response) => {
  const assignmentId = parseInt(req.params.idAssignment as string);
  const { studentIds } = req.body;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Verify existence of the assignment
      const assignment = await tx.assignment.findUnique({
        where: { assignmentId: assignmentId },
        include: { enrollments: true }
      });

      if (!assignment) {
        throw new Error('Assignment not found.');
      }

      // 2. Capacity Validation (Max 4 students in Mod C)
      const workshop = await tx.workshop.findUnique({ where: { workshopId: assignment.workshopId } });
      if (workshop?.modality === 'C' && studentIds.length > 4) {
        throw new Error('Limit exceeded: In Modality C only a maximum of 4 students per center is allowed.');
      }

      // 3. Synchronize enrollments
      const currentIds = assignment.enrollments.map(i => i.studentId);
      const newIds = (studentIds as (string | number)[]).map(id => parseInt(id as string));

      const toAdd = newIds.filter((id) => !currentIds.includes(id));
      const toRemove = currentIds.filter((id) => !newIds.includes(id));

      if (toRemove.length > 0) {
        await tx.enrollment.deleteMany({
          where: {
            assignmentId: assignmentId,
            studentId: { in: toRemove }
          }
        });
      }

      for (const studentId of toAdd) {
        await tx.enrollment.create({
          data: {
            assignmentId: assignmentId,
            studentId: studentId
          }
        });
      }

      // 4. Update status if it already has teachers and students
      await tx.assignmentChecklist.updateMany({
        where: {
          assignmentId: assignmentId,
          stepName: CHECKLIST_STEPS.INPUT_STUDENTS
        },
        data: {
          isCompleted: true,
          completedAt: new Date()
        }
      });

      return { added: toAdd.length, removed: toRemove.length, total: newIds.length };
    });

    res.json({ message: 'Nominal registration synchronized correctly', details: result });
  } catch (error: any) {
    console.error("Error performing nominal registration:", error);
    res.status(400).json({ error: error.message });
  }
};

// PATCH: Designate teachers for an assignment
export const designateTeachers = async (req: Request, res: Response) => {
  const { idAssignment: assignmentId } = req.params;
  const { teacher1Id, teacher2Id } = req.body;

  try {
    // 1. Validate that teachers are different
    if (teacher1Id && teacher2Id && teacher1Id === teacher2Id) {
      return res.status(400).json({ error: 'You must designate two different teachers.' });
    }

    const oldAssignment = await prisma.assignment.findUnique({ where: { assignmentId: parseInt(assignmentId as string) } });

    // Update teachers using deletions and creations
    await prisma.$transaction([
      prisma.assignmentTeacher.deleteMany({ where: { assignmentId: parseInt(assignmentId as string) } }),
      prisma.assignmentTeacher.createMany({
        data: [
          ...(teacher1Id ? [{ assignmentId: parseInt(assignmentId as string), userId: teacher1Id, isPrincipal: true }] : []),
          ...(teacher2Id ? [{ assignmentId: parseInt(assignmentId as string), userId: teacher2Id, isPrincipal: false }] : [])
        ]
      }),
      prisma.assignment.update({
        where: { assignmentId: parseInt(assignmentId as string) },
        data: { status: 'DATA_ENTRY' }
      })
    ]);

    if (oldAssignment) {
      await logStatusChange(parseInt(assignmentId as string), oldAssignment.status, 'DATA_ENTRY');
    }

    // Update checklist
    await prisma.assignmentChecklist.updateMany({
      where: {
        assignmentId: parseInt(assignmentId as string),
        stepName: CHECKLIST_STEPS.DESIGNATE_TEACHERS
      },
      data: {
        isCompleted: !!(teacher1Id && teacher2Id),
        completedAt: (teacher1Id && teacher2Id) ? new Date() : null
      }
    });

    const updatedAssignment = await prisma.assignment.findUnique({
      where: { assignmentId: parseInt(assignmentId as string) },
      include: { teachers: true }
    });

    res.json(updatedAssignment);
  } catch (error) {
    console.error("Error designating teachers:", error);
    res.status(500).json({ error: 'Error designating teachers.' });
  }
};

// POST: Validate Center Data (Admin)
export const validateCenterData = async (req: Request, res: Response) => {
  const { idAssignment: assignmentId } = req.params;
  const { approved, feedback: _feedback } = req.body;
  const { role } = req.user!;

  if (role !== ROLES.ADMIN) return res.status(403).json({ error: 'Unauthorized' });

  try {
    const oldAssignment = await prisma.assignment.findUnique({ where: { assignmentId: parseInt(assignmentId as string) } });
    const newState = approved ? 'VALIDATED' : 'DATA_ENTRY';
    const updated = await prisma.assignment.update({
      where: { assignmentId: parseInt(assignmentId as string) },
      data: { status: newState }
    });

    // If approved, log change and notify
    if (updated.status === 'VALIDATED') {
      await logStatusChange(parseInt(assignmentId as string), oldAssignment!.status, newState);
    }

    res.json({ message: `Assignment ${approved ? 'validated' : 'rejected'} correctly.` });
  } catch (_error) {
    res.status(500).json({ error: 'Error validating data.' });
  }
};

// POST: Send Notification of Incorrect Document
export const sendDocumentNotification = async (req: Request, res: Response) => {
  const { assignmentId } = req.params;
  const { documentName, comment, greeting } = req.body;
  const { role } = req.user!;

  if (role !== ROLES.ADMIN) return res.status(403).json({ error: 'Unauthorized' });

  try {
    const assignment = await prisma.assignment.findUnique({
      where: { assignmentId: parseInt(assignmentId as string) },
      include: {
        center: true,
        workshop: true
      }
    });

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    const message = `${greeting}, the document ${documentName} of workshop ${assignment.workshop.title} is incorrect. ${comment}`;

    await createNotificationInternal({
      centerId: assignment.centerId,
      title: 'Incorrect Documentation',
      message,
      type: 'SYSTEM',
      importance: 'WARNING'
    });

    res.json({ success: true, message: 'Notification sent correctly.' });
  } catch (error) {
    console.error("Error sending notification:", error);
    res.status(500).json({ error: 'Error sending notification.' });
  }
};

// POST: Generate Automatic Assignments (AI)
export const generateAutomaticAssignments = async (req: Request, res: Response) => {
  const { role: _role } = req.user!;

  try {
    const service = new AutoAssignmentService();
    const result = await service.generateAssignments();
    res.json(result);
  } catch (error) {
    console.error("Error in automatic assignment:", error);
    res.status(500).json({ error: 'Error executing the assignment engine.' });
  }
};

// POST: Confirm CEB Registration (Center) and Generate Sessions
export const confirmLegalRegistration = async (req: Request, res: Response) => {
  const { assignmentId } = req.params;
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Mark enrollments as confirmed
      const enrollments = await tx.enrollment.findMany({ where: { assignmentId: parseInt(assignmentId as string) } });

      for (const enrollment of enrollments) {
        const docsStatus = (enrollment.docsStatus as Record<string, any>) || {};
        await tx.enrollment.update({
          where: { enrollmentId: enrollment.enrollmentId },
          data: {
            docsStatus: {
              ...docsStatus,
              cebRegistrationConfirmed: true
            }
          }
        });
      }

      // 2. Get workshop data to generate sessions
      const assignment = await tx.assignment.findUnique({
        where: { assignmentId: parseInt(assignmentId as string) },
        include: { workshop: true }
      });

      if (!assignment || !assignment.workshop) {
        throw new Error('Assignment or workshop not found');
      }

      // 3. Generate sessions using SessionService
      await SessionService.syncSessionsForAssignment(assignment.assignmentId);

      return assignment;
    });

    const assignment = result;

    const oldAssignment = await prisma.assignment.findUnique({ where: { assignmentId: parseInt(assignmentId as string) } });

    // 4. Update assignment status to 'IN_PROGRESS'
    const updatedAssignment = await prisma.assignment.update({
      where: { assignmentId: parseInt(assignmentId as string) },
      data: { status: 'IN_PROGRESS' }
    });

    if (oldAssignment) {
      await logStatusChange(parseInt(assignmentId as string), oldAssignment.status, updatedAssignment.status);
    }

    // 5. Send notification to center confirming start of workshop
    await createNotificationInternal({
      centerId: assignment.centerId,
      title: 'Registration Confirmed: Workshop in Progress',
      message: `Registration for workshop "${assignment.workshop.title}" has been completed correctly. The workshop is now active and sessions have been generated in your calendar.`,
      type: 'PHASE',
      importance: 'INFO'
    });

    res.json({ success: true, message: 'Registration confirmed and sessions generated.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error confirming registration.' });
  }
};

/**
 * PATCH: Validate a specific document of an enrollment
 */
export const validateEnrollmentDocument = async (req: Request, res: Response) => {
  const { enrollmentId } = req.params;
  const { field, valid } = req.body;
  const { role } = req.user!;

  if (role !== ROLES.ADMIN) {
    return res.status(403).json({ error: 'Only admins can validate documents.' });
  }

  const permittedFields = ['isPedagogicalAgreementValidated', 'isMobilityAuthorizationValidated', 'isImageRightsValidated'];
  if (!permittedFields.includes(field)) {
    return res.status(400).json({ error: 'Invalid validation field.' });
  }

  try {
    const enrollment = await prisma.enrollment.findUnique({ where: { enrollmentId: parseInt(enrollmentId as string) } });
    const docsStatus = (enrollment?.docsStatus as any) || {};

    const updated = await prisma.enrollment.update({
      where: { enrollmentId: parseInt(enrollmentId as string) },
      data: {
        docsStatus: {
          ...docsStatus,
          [field]: !!valid
        }
      }
    });
    res.json(updated);
  } catch (error) {
    console.error("Error validating document:", error);
    res.status(500).json({ error: 'Error validating the document.' });
  }
};

/**
 * HELPER: Log status changes
 */
async function logStatusChange(assignmentId: number, oldState: string, newState: string) {
  if (oldState === newState) return;
  try {
    await prisma.auditLog.create({
      data: {
        userId: 0, // System user or current user
        action: `Status change for assignment ${assignmentId} from ${oldState} to ${newState}`,
        details: { assignmentId, oldState, newState }
      }
    });
  } catch (e) {
    console.error("Error logging status change:", e);
  }
}

// POST: Update Compliance Documents (Center)
export const updateComplianceDocuments = async (req: Request, res: Response) => {
  const { enrollmentId, isPedagogicalAgreementValidated, isMobilityAuthorizationValidated, isImageRightsValidated } = req.body;

  try {
    const enrollment = await prisma.enrollment.findUnique({ where: { enrollmentId: parseInt(enrollmentId as string) } });
    if (!enrollment) return res.status(404).json({ error: 'Enrollment not found' });

    const docsStatus = (enrollment.docsStatus as any) || {};

    const updated = await prisma.enrollment.update({
      where: {
        enrollmentId: parseInt(enrollmentId as string)
      },
      data: {
        docsStatus: {
          ...docsStatus,
          isPedagogicalAgreementValidated: isPedagogicalAgreementValidated !== undefined ? !!isPedagogicalAgreementValidated : docsStatus.isPedagogicalAgreementValidated,
          isMobilityAuthorizationValidated: isMobilityAuthorizationValidated !== undefined ? !!isMobilityAuthorizationValidated : docsStatus.isMobilityAuthorizationValidated,
          isImageRightsValidated: isImageRightsValidated !== undefined ? !!isImageRightsValidated : docsStatus.isImageRightsValidated
        }
      }
    });

    res.json(updated);
  } catch (error) {
    console.error("Error updating compliance documents:", error);
    res.status(500).json({ error: 'Error updating documents.' });
  }
};

const sanitizeFileName = (str: string) => {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9]/g, "_")    // Only letters and numbers
    .replace(/_+/g, "_")           // Remove consecutive underscores
    .replace(/(^_|_$)/g, "");      // Remove leading/trailing underscores
};

export const uploadStudentDocument = async (req: Request, res: Response) => {
  const { idEnrollment, documentType } = req.body;
  const enrollmentId = idEnrollment; // Rename for internal logic

  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  try {
    const enrollment = await prisma.enrollment.findUnique({
      where: { enrollmentId: parseInt(enrollmentId as string) },
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
      return res.status(404).json({ error: 'Enrollment or associated data not found.' });
    }

    const { student, assignment } = enrollment;
    const workshop = assignment.workshop;

    const fileExt = path.extname(req.file.originalname);

    // Generate descriptive name
    const studentName = sanitizeFileName(`${student.fullName}_${student.lastName}`);
    const studentCourse = sanitizeFileName(student.grade || 'no_grade');
    const workshopTitle = sanitizeFileName(workshop.title);

    const fileName = `${studentName}_${studentCourse}_${workshopTitle}_${documentType}_${Date.now()}${fileExt}`;
    const docDir = path.resolve(process.cwd(), 'uploads', 'documents');
    const filePath = path.join(docDir, fileName);

    // Ensure documents dir exists
    if (!fs.existsSync(docDir)) {
      fs.mkdirSync(docDir, { recursive: true });
    }

    console.log(`[Upload] Saving file to: ${filePath}`);
    fs.writeFileSync(filePath, req.file.buffer);

    const url = `/uploads/documents/${fileName}`;

    // --- AI VALIDATION (OLLAMA) ---
    console.log(`[Upload] Starting AI validation with Ollama for ${documentType}...`);
    const visionService = new VisionService();
    let aiResult;
    try {
      // 30s timeout safety for AI
      aiResult = await Promise.race([
        visionService.validateDocument(req.file),
        new Promise((_, reject) => setTimeout(() => reject(new Error('AI_TIMEOUT')), 30000))
      ]) as any;
      console.log(`[Upload] AI Result:`, aiResult);
    } catch (aiError) {
      console.error(`[Upload] AI validation failed or timed out:`, aiError);
      // Fallback: Mark as not validated but allow the upload to continue
      aiResult = { valid: false, errors: ["IA no disponible en este momento"], metadata: { hasSignature: false, confidence: 0, error: 'AI_FALLBACK' } };
    }
    // ------------------------------

    const fieldMap: Record<string, string> = {
      'pedagogical_agreement': 'pedagogicalAgreementUrl',
      'mobility_authorization': 'mobilityAuthorizationUrl',
      'image_rights': 'imageRightsUrl'
    };

    const updateField = fieldMap[documentType];

    if (!updateField) {
      return res.status(400).json({ error: 'Invalid document type.' });
    }

    const docsStatus = (enrollment?.docsStatus as any) || {};

    console.log(`[Upload] Updating database for enrollment ${enrollmentId}...`);
    const updated = await prisma.enrollment.update({
      where: { enrollmentId: parseInt(enrollmentId as string) },
      data: {
        docsStatus: {
          ...docsStatus,
          [updateField]: url,
          [`${documentType}Present`]: true,
          [`${documentType}Validated`]: aiResult.valid,
          [`${documentType}AIResult`]: aiResult.metadata
        }
      }
    });

    console.log(`[Upload] Success! URL: ${url}`);
    res.json(updated);
  } catch (error: any) {
    console.error("Error uploading document:", error);
    res.status(500).json({ 
      error: `Server Error: ${error.message || 'Unknown error'}`,
      details: error.stack
    });
  }
};

export const getSessions = async (req: Request, res: Response) => {
  const { idAssignment: assignmentId } = req.params;
  try {
    const sessions = await prisma.session.findMany({
      where: { assignmentId: parseInt(assignmentId as string) },
      orderBy: { sessionDate: 'asc' }
    });
    res.json(sessions);
  } catch (_error) {
    res.status(500).json({ error: 'Error obtaining sessions' });
  }
};

export const getSessionAttendance = async (req: Request, res: Response) => {
  const { idAssignment, sessionNum } = req.params;
  const assignmentId = parseInt(idAssignment as string);
  const num = parseInt(sessionNum as string);

  if (isNaN(assignmentId) || isNaN(num)) {
    return res.status(400).json({ error: 'Invalid parameters' });
  }

  try {
    // 0. Sync sessions if they don't exist yet
    let sessions = await prisma.session.findMany({
      where: { assignmentId },
      orderBy: { sessionDate: 'asc' }
    });

    if (sessions.length === 0) {
      await SessionService.syncSessionsForAssignment(assignmentId);
      sessions = await prisma.session.findMany({
        where: { assignmentId },
        orderBy: { sessionDate: 'asc' }
      });
    }

    const targetSession = sessions[num - 1];
    if (!targetSession) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // 2. Ensure attendance records are initialized
    await SessionService.ensureAttendanceRecords(assignmentId, num, targetSession.sessionDate);

    // 3. Get combined attendance list
    const rawAttendance = await prisma.attendance.findMany({
      where: {
        enrollment: { assignmentId },
        sessionNumber: num
      },
      include: {
        enrollment: {
          include: {
            student: true
          }
        }
      }
    });

    const attendance = rawAttendance.map((r) => ({
      attendanceId: r.attendanceId,
      enrollmentId: r.enrollmentId,
      sessionNumber: r.sessionNumber,
      sessionDate: r.sessionDate.toISOString(),
      status: r.status,
      observations: r.observations,
      enrollment: {
        student: {
          fullName: r.enrollment.student.fullName,
          lastName: r.enrollment.student.lastName,
          idalu: r.enrollment.student.idalu
        }
      }
    }));

    res.json(attendance);
  } catch (error) {
    console.error("Error in getSessionAttendance:", error);
    res.status(500).json({ error: 'Error obtaining attendance records' });
  }
};

/**
 * Obtains all attendance records for a complete assignment.
 */
export const getAttendanceByAssignment = async (req: Request, res: Response) => {
  const { idAssignment } = req.params;
  const assignmentId = parseInt(idAssignment as string);

  try {
    const attendances = await prisma.attendance.findMany({
      where: {
        enrollment: {
          assignmentId
        }
      },
      include: {
        enrollment: {
          include: {
            student: true
          }
        }
      },
      orderBy: [
        { sessionNumber: 'asc' },
        { enrollment: { student: { lastName: 'asc' } } }
      ]
    });

    res.json(attendances);
  } catch (error) {
    console.error("Error in getAttendanceByAssignment:", error);
    res.status(500).json({ error: 'Error loading full attendance report.' });
  }
};

export const registerAttendance = async (req: Request, res: Response) => {
  const { idAssignment, sessionNum } = req.params;
  const assignmentId = parseInt(idAssignment as string);
  const num = parseInt(sessionNum as string);

  if (isNaN(assignmentId) || isNaN(num)) {
    return res.status(400).json({ error: 'Invalid parameters' });
  }

  // Validate body
  const validation = AttendanceUpdateSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: 'Invalid attendance data', details: validation.error.format() });
  }

  const validatedData = validation.data;

  try {
    // 1. Get the session to have the correct date if possible
    const session = await prisma.session.findFirst({
      where: {
        assignmentId,
      },
      orderBy: { sessionDate: 'asc' },
      skip: num - 1,
      take: 1
    });

    const sessionDate = session ? session.sessionDate : new Date();

    // 2. Perform updates in a transaction
    await prisma.$transaction(async (tx) => {
      for (const item of validatedData) {
        const existing = await tx.attendance.findFirst({
          where: { enrollmentId: item.enrollmentId, sessionNumber: num }
        });

        if (existing) {
          await tx.attendance.update({
            where: { attendanceId: existing.attendanceId },
            data: {
              status: item.status,
              observations: item.observations
            }
          });
        } else {
          await tx.attendance.create({
            data: {
              enrollmentId: item.enrollmentId,
              sessionNumber: num,
              sessionDate: sessionDate,
              status: item.status,
              observations: item.observations
            }
          });
        }
      }
    });

    res.json({ success: true, message: 'Attendance registered correctly' });
  } catch (error) {
    console.error("Error in registerAttendance:", error);
    res.status(500).json({ error: 'Error saving attendance' });
  }
};

// Phase 2: Teaching Staff Management
export const addTeachingStaff = async (req: Request, res: Response) => {
  const { idAssignment: assignmentId } = req.params;
  const { userId, isPrincipal } = req.body;

  try {
    const relation = await prisma.assignmentTeacher.upsert({
      where: {
        assignmentId_userId: {
          assignmentId: parseInt(assignmentId as string),
          userId: parseInt(userId as string)
        }
      },
      update: {
        isPrincipal: isPrincipal || false
      },
      create: {
        assignmentId: parseInt(assignmentId as string),
        userId: parseInt(userId as string),
        isPrincipal: isPrincipal || false
      }
    });
    res.status(201).json(relation);
  } catch (_error) {
    res.status(500).json({ error: 'Error adding teacher to the team' });
  }
};

export const removeTeachingStaff = async (req: Request, res: Response) => {
  const { idAssignment: assignmentId, userId } = req.params;

  try {
    await prisma.assignmentTeacher.delete({
      where: {
        assignmentId_userId: {
          assignmentId: parseInt(assignmentId as string),
          userId: parseInt(userId as string)
        }
      }
    });
    res.status(204).send();
  } catch (_error) {
    res.status(500).json({ error: 'Error removing teacher from the team' });
  }
};

// Phase 3: Dynamic Session Teaching Staff
export const addSessionTeacher = async (req: Request, res: Response) => {
  const { idSession: sessionId } = req.params;
  const { userId } = req.body;

  try {
    const relation = await prisma.sessionTeacher.upsert({
      where: {
        sessionId_userId: {
          sessionId: parseInt(sessionId as string),
          userId: parseInt(userId as string)
        }
      },
      update: {},
      create: {
        sessionId: parseInt(sessionId as string),
        userId: parseInt(userId as string)
      }
    });
    res.status(201).json(relation);
  } catch (error) {
    console.error("Error adding teacher to session:", error);
    res.status(500).json({ error: 'Error adding teacher to session' });
  }
};

export const removeSessionTeacher = async (req: Request, res: Response) => {
  const { idSession: sessionId, userId } = req.params;

  try {
    await prisma.sessionTeacher.delete({
      where: {
        sessionId_userId: {
          sessionId: parseInt(sessionId as string),
          userId: parseInt(userId as string)
        }
      }
    });
    res.status(204).send();
  } catch (error) {
    console.error("Error removing teacher from session:", error);
    res.status(500).json({ error: 'Error removing teacher from session' });
  }
};

// Phase 4: Closing
export const closeAssignment = async (req: Request, res: Response) => {
  const { idAssignment } = req.params;
  const assignmentId = parseInt(idAssignment as string);

  try {
    const result = await closureService.closeAssignment(assignmentId);
    
    // Log the change
    await logStatusChange(assignmentId, 'IN_PROGRESS', 'COMPLETED');

    res.json({
      success: true,
      ...result
    });

  } catch (error: any) {
    console.error("Error in closeAssignment:", error);
    res.status(400).json({ error: error.message });
  }
};
