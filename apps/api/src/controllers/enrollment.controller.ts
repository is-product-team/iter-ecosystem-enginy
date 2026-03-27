import { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import * as xlsx from 'xlsx';

/**
 * Upload Excel and import students to an assignment
 */
export const enrollStudentsViaExcel = async (req: Request, res: Response) => {
  const { idAssignment } = req.params;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: 'No files were uploaded.' });
  }

  try {
    const workbook = xlsx.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet) as any[];

    // Expecting columns: "nom", "cognoms", "idalu", "curs"
    const studentsToCreate = data.map(row => ({
      name: row.nom || row.Nombre || '',
      lastName: row.cognoms || row.Apellidos || '',
      idalu: String(row.idalu || row.ID || ''),
      grade: row.curs || row.Curso || ''
    })).filter(s => s.name && s.idalu);

    const assignment = await prisma.assignment.findUnique({
      where: { assignmentId: parseInt(idAssignment as string) },
      include: { center: true }
    });

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found.' });
    }

    const results = [];
    for (const s of studentsToCreate) {
      // Upsert student
      const student = await prisma.student.upsert({
        where: { idalu: s.idalu },
        update: {
          fullName: s.name,
          lastName: s.lastName,
          grade: s.grade
        },
        create: {
          fullName: s.name,
          lastName: s.lastName,
          idalu: s.idalu,
          grade: s.grade,
          originCenterId: assignment.centerId
        }
      });

      // Create enrollment (check if exists first since we don't have a simple unique key for it)
      const existingEnrollment = await prisma.enrollment.findFirst({
        where: { assignmentId: assignment.assignmentId, studentId: student.studentId }
      });

      if (!existingEnrollment) {
        const enrollment = await prisma.enrollment.create({
          data: {
            assignmentId: assignment.assignmentId,
            studentId: student.studentId
          }
        });
        results.push(enrollment);
      } else {
        results.push(existingEnrollment);
      }
    }

    // Update checklist
    await prisma.assignmentChecklist.updateMany({
      where: {
        assignmentId: assignment.assignmentId,
        stepName: { contains: 'Nominal' } // Standardized search
      },
      data: {
        isCompleted: true,
        completedAt: new Date()
      }
    });

    res.json({
      message: `${results.length} students processed successfully.`,
      count: results.length
    });
  } catch (error) {
    console.error('Enrollment Error:', error);
    res.status(500).json({ error: 'Failed to process Excel file.' });
  }
};
