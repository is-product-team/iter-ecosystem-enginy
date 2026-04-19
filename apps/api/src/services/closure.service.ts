import prisma from '../lib/prisma.js';
import { CertificateService } from './certificate.service.js';
import { ASSIGNMENT_STATUSES } from '@iter/shared';
import { NotificationService } from './notification.service.js';

const certificateService = new CertificateService();

export class ClosureService {
  /**
   * Finalizes an assignment, validates attendance, and issues certificates.
   */
  async closeAssignment(assignmentId: number) {
    // 1. Verify if it's already completed
    const assignment = await prisma.assignment.findUnique({
      where: { assignmentId },
      include: {
        enrollments: {
          include: { student: true, evaluations: true }
        },
        workshop: true
      }
    }) as any;

    if (!assignment) throw new Error('Assignment not found');
    
    // Check if it's already COMPLETED
    if (assignment.status === ASSIGNMENT_STATUSES.COMPLETED) {
      return {
          success: true,
          message: 'Assignment was already completed.',
          status: assignment.status
      };
    }

    // 2. Validate prerequisites: At least one student must have been evaluated
    const evaluatedCount = assignment.enrollments.filter((e: any) => e.evaluations.length > 0).length;

    if (evaluatedCount === 0 && assignment.enrollments.length > 0) {
      throw new Error('No teacher evaluations found. At least one evaluation is required to close.');
    }

    // 3. Update status to COMPLETED
    const updatedAssignment = await prisma.assignment.update({
      where: { assignmentId },
      data: { status: ASSIGNMENT_STATUSES.COMPLETED }
    });

    // 4. Issue certificates
    const certResults = await certificateService.issueCertificatesForAssignment(assignmentId);

    // 5. Dispatch Notifications ONLY to Students who qualified (Task 3.2)
    if (certResults.issued > 0) {
      console.log(`[ClosureService] 📢 Notifying ${certResults.issued} students who earned a certificate.`);
      
      const qualifiedStudentIds: number[] = certResults.issuedStudentIds || [];

      for (const enrollment of assignment.enrollments) {
        // Only notify if student is in the qualified list
        if (enrollment.student.userId && qualifiedStudentIds.includes(enrollment.studentId)) {
            await NotificationService.notify({
              userId: enrollment.student.userId,
              title: 'workshop_completed_title',
              message: JSON.stringify({
                key: 'workshop_completed_msg',
                params: { title: assignment.workshop.title }
              }),
              type: 'PHASE_CLOSURE',
              importance: 'INFO'
            });
        }
      }
    }

    return {
      assignmentId,
      status: updatedAssignment.status,
      certResults,
      warnings: evaluatedCount < assignment.enrollments.length ? 
        `Warning: Only ${evaluatedCount}/${assignment.enrollments.length} students have teacher evaluations.` : 
        null
    };
  }
}
