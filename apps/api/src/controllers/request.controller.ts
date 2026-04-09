import prisma from '../lib/prisma.js';
import { Request, Response } from 'express';
import { RequestStatus, Modality } from '@prisma/client';
import { ROLES, REQUEST_STATUSES, PHASES } from '@iter/shared';
import { isPhaseActive } from '../lib/phaseUtils.js';
import { createNotificationInternal } from './notification.controller.js';
import { RequestService } from '../services/request.service.js';

// GET: View requests (Filters by center if COORDINATOR) with pagination
export const getRequests = async (req: Request, res: Response) => {
  const { centerId, role, userId } = req.user || {};
  const { page = 1, limit = 10 } = req.query;
  const isAll = Number(limit) === 0;
  const skip = isAll ? undefined : (Number(page) - 1) * Number(limit);
  const take = isAll ? undefined : Number(limit);

  try {
    const where: any = {};

    // Scoping: Admin sees all, others only their center
    if (role !== ROLES.ADMIN) {
      if (!centerId) {
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
        where.centerId = centerId;
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
    console.error("Error in request.controller.getRequests:", error);
    return res.status(500).json({ error: 'Failed to retrieve requests' });
  }
};

// POST: Create request
export const createRequest = async (req: Request, res: Response) => {
  const {
    workshopId,
    studentsAprox,
    comments,
    prof1Id,
    prof2Id,
    modality
  } = req.body;
  const { centerId } = req.user!;

  if (!workshopId || !centerId || !prof1Id || !prof2Id) {
    return res.status(400).json({ error: 'Missing mandatory fields (workshopId, centerId, prof1Id, prof2Id)' });
  }

  // --- PHASE VERIFICATION ---
  const phaseStatus = await isPhaseActive(PHASES.APPLICATION);
  if (!phaseStatus.isActive) {
    let errorMessage = `The workshop request period ('${PHASES.APPLICATION}') is not currently active.`;
    if (!phaseStatus.phaseActiveFlag) {
      errorMessage = `The request phase ('${PHASES.APPLICATION}') has been deactivated by the administrator manually.`;
    } else if (!phaseStatus.isWithinDates) {
      const start = phaseStatus.phase?.startDate?.toLocaleDateString() || 'N/A';
      const end = phaseStatus.phase?.endDate?.toLocaleDateString() || 'N/A';
      errorMessage = `The deadline for requesting workshops has ended or hasn't started yet. Active period: ${start} to ${end}. Today: ${new Date().toLocaleDateString()}.`;
    }
    return res.status(403).json({ error: errorMessage });
  }

  // --- TEACHER VALIDATION ---
  const teacherCheck = await RequestService.verifyTeachersExist(parseInt(prof1Id), parseInt(prof2Id));
  if (!teacherCheck.valid) {
    return res.status(400).json({ error: teacherCheck.error });
  }

  // --- MODALITY C VALIDATIONS (PROGRAM RULES) ---
  if (modality === Modality.C) {
    const modalityCheck = await RequestService.validateModalityCRules(centerId, parseInt(studentsAprox));
    if (!modalityCheck.valid) {
      return res.status(400).json({ error: modalityCheck.error });
    }
  }

  try {
    const existingRequest = await prisma.request.findFirst({
      where: {
        centerId: centerId,
        workshopId: parseInt(workshopId)
      }
    });

    if (existingRequest) {
      return res.status(400).json({ error: 'This center has already made a request for this workshop.' });
    }

    const newRequest = await prisma.request.create({
      data: {
        centerId: centerId,
        workshopId: parseInt(workshopId),
        studentsAprox: parseInt(studentsAprox),
        comments: comments,
        status: REQUEST_STATUSES.PENDING as RequestStatus,
        modality: modality as Modality,
        prof1Id: parseInt(prof1Id),
        prof2Id: parseInt(prof2Id),
      },
      include: {
        workshop: true
      }
    });

    res.json(newRequest);
  } catch (error) {
    console.error("Error in request.controller.createRequest:", error);
    res.status(500).json({ error: 'Error creating the request' });
  }
};

// PUT: Update existing request (only allowed fields and if Pending)
export const updateRequest = async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    studentsAprox,
    comments,
    prof1Id,
    prof2Id,
    modality
  } = req.body;
  const { centerId, role } = req.user!;

  try {
    const requestId = parseInt(id as string);
    const existingRequest = await prisma.request.findUnique({
      where: { requestId: requestId }
    });

    if (!existingRequest) {
      return res.status(404).json({ error: 'Request not found.' });
    }

    // Verify permissions: Coordinator only edits their own
    if (role !== ROLES.ADMIN && existingRequest.centerId !== centerId) {
      return res.status(403).json({ error: 'You do not have permission to edit this request.' });
    }

    // Verify status: Only pending requests can be edited
    if (existingRequest.status !== RequestStatus.PENDING) {
      return res.status(400).json({ error: 'Only pending requests can be edited.' });
    }

    // --- PHASE VERIFICATION ---
    // If NOT admin, we verify the phase. Admins can always edit.
    if (role !== ROLES.ADMIN) {
      const phaseStatus = await isPhaseActive(PHASES.APPLICATION);
      if (!phaseStatus.isActive) {
        let errorMessage = `The workshop request period ('${PHASES.APPLICATION}') is not currently active.`;
        if (!phaseStatus.phaseActiveFlag) {
          errorMessage = `The request phase ('${PHASES.APPLICATION}') has been deactivated by the administrator manually.`;
        } else if (!phaseStatus.isWithinDates) {
          const start = phaseStatus.phase?.startDate?.toLocaleDateString() || 'N/A';
          const end = phaseStatus.phase?.endDate?.toLocaleDateString() || 'N/A';
          errorMessage = `The deadline for requesting workshops has ended or hasn't started yet. Active period: ${start} to ${end}. Today: ${new Date().toLocaleDateString()}.`;
        }
        return res.status(403).json({ error: errorMessage });
      }
    }

    // --- TEACHER VALIDATION ---
    const teacherCheck = await RequestService.verifyTeachersExist(prof1Id ? parseInt(prof1Id) : undefined, prof2Id ? parseInt(prof2Id) : undefined);
    if (!teacherCheck.valid) {
      return res.status(400).json({ error: teacherCheck.error });
    }

    // --- MODALITY C VALIDATIONS (PROGRAM RULES) ---
    if ((modality === Modality.C || existingRequest.modality === Modality.C) && studentsAprox !== undefined) {
      const modalityCheck = await RequestService.validateModalityCRules(existingRequest.centerId, parseInt(studentsAprox), requestId);
      if (!modalityCheck.valid) {
        return res.status(400).json({ error: modalityCheck.error });
      }
    }

    const updatedRequest = await prisma.request.update({
      where: { requestId: requestId },
      data: {
        studentsAprox: studentsAprox ? parseInt(studentsAprox) : undefined,
        comments,
        prof1Id: parseInt(prof1Id),
        prof2Id: parseInt(prof2Id),
        modality: modality as Modality,
      },
      include: {
        workshop: true
      }
    });

    res.json(updatedRequest);
  } catch (error) {
    console.error("Error in request.controller.updateRequest:", error);
    res.status(500).json({ error: 'Error updating the request' });
  }
};

// PATCH: Change status (Approve/Reject)
export const updateRequestStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const requestIdInt = parseInt(id as string);
    const oldRequest = await prisma.request.findUnique({
      where: { requestId: requestIdInt }
    });

    const updated = await prisma.request.update({
      where: { requestId: requestIdInt },
      data: { status: status as RequestStatus },
      include: { workshop: true }
    });

    if (oldRequest) {
      await logStatusChange(requestIdInt, oldRequest.status, updated.status, req.user?.userId);
    }

    await createNotificationInternal({
      centerId: updated.centerId,
      title: `Request ${updated.status === RequestStatus.APPROVED ? 'Approved' : 'Rejected'}`,
      message: `Your request for the workshop "${updated.workshop.title}" has been ${updated.status.toLowerCase()}.`,
      type: 'REQUEST',
      importance: updated.status === RequestStatus.APPROVED ? 'INFO' : 'WARNING'
    });

    res.json(updated);
  } catch (error) {
    console.error("Error in updateRequestStatus:", error);
    res.status(500).json({ error: 'Error updating the status' });
  }
};

/**
 * HELPER: Log status changes
 */
async function logStatusChange(requestId: number, oldState: string, newState: string, userId: number = 0) {
  if (oldState === newState) return;
  try {
    await prisma.auditLog.create({
      data: {
        userId: userId, // 0 for system if not provided
        action: `Status change for request ${requestId} from ${oldState} to ${newState}`,
        details: { requestId, oldState, newState }
      }
    });
  } catch (e) {
    console.error("Error logging status change:", e);
  }
}
