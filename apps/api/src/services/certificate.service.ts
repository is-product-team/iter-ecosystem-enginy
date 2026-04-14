import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import prisma from '../lib/prisma.js';
import AdmZip from 'adm-zip';

export class CertificateService {
  /**
   * Generates a PDF certificate for a student in a workshop.
   * Returns the PDF buffer.
   */
  async generateCertificate(studentName: string, workshopTitle: string, hours: number, date: Date) {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 400]);
    const { width, height } = page.getSize();

    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Background color / Border
    page.drawRectangle({
      x: 20,
      y: 20,
      width: width - 40,
      height: height - 40,
      borderColor: rgb(0, 0.26, 0.42), // Consorci Dark Blue
      borderWidth: 2,
    });

    // Content
    page.drawText('CERTIFICAT D\'APROFITAMENT', {
      x: 100,
      y: height - 80,
      size: 24,
      font,
      color: rgb(0, 0.26, 0.42),
    });

    page.drawText('Certifiquem que:', {
      x: 100,
      y: height - 130,
      size: 14,
      font: regularFont,
    });

    page.drawText(studentName, {
      x: 100,
      y: height - 170,
      size: 20,
      font,
    });

    page.drawText(`Ha completat amb èxit el taller de formació:`, {
      x: 100,
      y: height - 210,
      size: 14,
      font: regularFont,
    });

    page.drawText(`"${workshopTitle}"`, {
      x: 100,
      y: height - 240,
      size: 16,
      font,
    });

    page.drawText(`Amb una durada total de ${hours} hores.`, {
      x: 100,
      y: height - 280,
      size: 12,
      font: regularFont,
    });

    page.drawText(`Barcelona, ${date.toLocaleDateString('ca-ES')}`, {
      x: 100,
      y: height - 330,
      size: 10,
      font: regularFont,
    });

    // Footer - Iter Ecosystem
    page.drawText('Iter Ecosystem - Programa de Tallers de Formació Professional', {
      x: 100,
      y: 40,
      size: 8,
      font: regularFont,
      color: rgb(0.5, 0.5, 0.5),
    });

    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  }

  /**
   * Issues database records for students who meet the attendance criteria.
   * Typically called when an assignment is closed.
   */
  async issueCertificatesForAssignment(assignmentId: number) {
    const assignment = await prisma.assignment.findUnique({
      where: { assignmentId },
      include: {
          enrollments: {
              include: {
                  attendance: true
              }
          },
          sessions: true
      }
    });

    if (!assignment) throw new Error('Assignment not found');

    const totalSessions = assignment.sessions.length || 10;
    let certificatesIssued = 0;

    for (const enrollment of assignment.enrollments) {
        const attendedCount = enrollment.attendance.filter((a: any) =>
            a.status === 'PRESENT' || a.status === 'LATE'
        ).length;

        const percentage = totalSessions > 0 ? (attendedCount / totalSessions) * 100 : 0;

        // Requirement: 80% attendance
        if (percentage >= 80) {
            await prisma.certificate.upsert({
                where: {
                    studentId_assignmentId: {
                        studentId: enrollment.studentId,
                        assignmentId
                    }
                },
                update: {},
                create: {
                    studentId: enrollment.studentId,
                    assignmentId,
                    issuedAt: new Date()
                }
            });
            certificatesIssued++;
        }
    }

    return {
        certificatesIssued,
        totalStudents: assignment.enrollments.length
    };
  }

  /**
   * Orchestrates certificate data gathering and generation.
   */
  async getCertificateForStudent(enrollmentId: number) {
     const enrollment = await prisma.enrollment.findUnique({
       where: { enrollmentId },
       include: {
         student: true,
         assignment: {
           include: { workshop: true }
         }
       }
     });

     if (!enrollment) throw new Error('Enrollment not found');

     return this.generateCertificate(
       `${enrollment.student.fullName} ${enrollment.student.lastName}`,
       enrollment.assignment.workshop.title,
       enrollment.assignment.workshop.durationHours,
       new Date()
     );
  }

  /**
   * Generates a ZIP buffer with all certificates for an assignment.
   */
  async generateBulkZip(assignmentId: number) {
    const certificates = await prisma.certificate.findMany({
      where: { assignmentId },
      include: {
        student: true,
        assignment: {
          include: { workshop: true }
        }
      }
    });

    if (certificates.length === 0) {
      throw new Error('No certificates found for this assignment. Make sure it is closed.');
    }

    const zip = new AdmZip();

    for (const cert of certificates) {
      const pdfBuffer = await this.generateCertificate(
        `${cert.student.fullName} ${cert.student.lastName}`,
        cert.assignment.workshop.title,
        cert.assignment.workshop.durationHours,
        cert.issuedAt
      );
      
      // Sanitized filename
      const fileName = `${cert.student.lastName}_${cert.student.fullName}_certificat.pdf`
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove accents
        .replace(/\s+/g, '_')
        .toLowerCase();
        
      zip.addFile(fileName, Buffer.from(pdfBuffer));
    }

    return zip.toBuffer();
  }
}
