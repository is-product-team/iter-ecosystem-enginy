import { Modality } from '@prisma/client';
import prisma from '../lib/prisma.js';

export class RequestService {
  /**
   * Validates if a request follows Modality C rules:
   * 1. Max students per project in Modality C is 4.
   * 2. Total students in Modality C for a center cannot exceed 12.
   */
  static async validateModalityCRules(centerId: number, studentsAprox: number, excludeRequestId?: number) {
    if (studentsAprox > 4) {
      return { valid: false, error: 'In Modality C, the maximum is 4 students from the same institute per project.' };
    }

    // Check total limit of 12 students for the center in Modality C
    const requestsC = await prisma.request.findMany({
      where: {
        centerId: centerId,
        modality: Modality.C,
        ...(excludeRequestId ? { requestId: { not: excludeRequestId } } : {})
      }
    });

    const totalStudentsC = requestsC.reduce((sum, p) => sum + (p.studentsAprox || 0), 0);
    if (totalStudentsC + studentsAprox > 12) {
      return {
        valid: false,
        error: `Limit exceeded. The institute already has ${totalStudentsC} students in Modality C projects. The maximum total allowed is 12.`
      };
    }

    return { valid: true };
  }

  /**
   * Verifies that the designated teachers exist in the system.
   */
  static async verifyTeachersExist(prof1Id?: number, prof2Id?: number) {
    if (prof1Id) {
      const user1 = await prisma.user.findUnique({ where: { userId: prof1Id } });
      if (!user1) return { valid: false, error: `Teacher with ID ${prof1Id} not found.` };
    }
    if (prof2Id) {
      const user2 = await prisma.user.findUnique({ where: { userId: prof2Id } });
      if (!user2) return { valid: false, error: `Teacher with ID ${prof2Id} not found.` };
    }
    return { valid: true };
  }
}
