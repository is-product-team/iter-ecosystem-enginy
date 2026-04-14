import prisma from '../lib/prisma.js';
import { CertificateService } from './certificate.service.js';
import { ASSIGNMENT_STATUSES } from '@iter/shared';

const certificateService = new CertificateService();

export class ClosureService {
  /**
   * Closes an assignment, triggering certificate generation.
   * Finalizes the Phase 4 for this group.
   */
  async closeAssignment(assignmentId: number) {
    const assignment = await prisma.assignment.findUnique({
      where: { assignmentId },
      include: {
        enrollments: {
          include: {
            evaluations: true
          }
        }
      }
    }) as any;

    if (!assignment) throw new Error('Assignment not found');

    // Validation: At least some students should have evaluations
    // Requirement can be stricter: ALL students must have evaluations
    const totalEnrollments = assignment.enrollments.length;
    const evaluatedCount = assignment.enrollments.filter((e: any) => e.evaluations.length > 0).length;

    if (evaluatedCount === 0 && totalEnrollments > 0) {
      throw new Error('No teacher evaluations found. At least one evaluation is required to close.');
    }

    // Update status to COMPLETED
    const updatedAssignment = await prisma.assignment.update({
      where: { assignmentId },
      data: {
        status: ASSIGNMENT_STATUSES.COMPLETED
      }
    });

    // Strategy: Batch issue certificates in the DB
    const certResults = await certificateService.issueCertificatesForAssignment(assignmentId);

    return {
      assignmentId,
      status: updatedAssignment.status,
      certResults,
      warnings: evaluatedCount < totalEnrollments ? 
        `Warning: Only ${evaluatedCount}/${totalEnrollments} students have teacher evaluations.` : 
        null
    };
  }
}
