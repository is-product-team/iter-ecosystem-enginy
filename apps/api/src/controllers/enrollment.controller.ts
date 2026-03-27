import { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import * as xlsx from 'xlsx';
import { ROLES } from '@iter/shared';

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
      surnames: row.cognoms || row.Apellidos || '',
      idalu: String(row.idalu || row.ID || ''),
      curs: row.curs || row.Curso || ''
    })).filter(s => s.name && s.idalu);

    const assignacio = await prisma.assignment.findUnique({
      where: { assignmentId: parseInt(idAssignment as string) },
      include: { center: true }
    });

    if (!assignacio) {
      return res.status(404).json({ error: 'Assignment not found.', importance: 'WARNING' });
    }

    const results = [];
    for (const s of studentsToCreate) {
      // Upsert student (they might already exist if they are in multiple workshops or from previous years)
      const alumne = await prisma.student.upsert({
        where: { idalu: s.idalu },
        update: {
          fullName: s.nom,
          lastName: s.cognoms,
          curs: s.curs
        },
        create: {
          fullName: s.nom,
          lastName: s.cognoms, // Renamed 'surnames' to 'lastName'
          idalu: s.idalu,
          curs: s.curs,
          originCenterCode: assignacio.center.centerCode // Fixed field name and derived value prefix
        }
      });

      // Create inscription
      const inscripcio = await prisma.enrollment.upsert({
        where: {
          // We don't have a unique key for inscripcio, so we manually check
          enrollmentId: -1 // dummy
        },
        update: {},
        create: {
          assignmentId: assignacio.assignmentId,
          studentId: alumne.studentId
        }
      }).catch(async () => {
        // Manual check for existing
        const existing = await prisma.enrollment.findFirst({
          where: { assignmentId: assignacio.assignmentId, studentId: alumne.studentId }
        });
        if (!existing) {
          return prisma.enrollment.create({
            data: { assignmentId: assignacio.assignmentId, studentId: alumne.studentId }
          });
        }
        return existing;
      });

      results.push(inscripcio);
    }

    // Update checklist
    await prisma.assignmentChecklist.updateMany({
      where: {
        assignmentId: assignacio.assignmentId,
        stepName: { contains: 'Registro Nominal' }
      },
      data: {
        isCompleted: true,
        completedAt: new Date()
      }
    });

    res.json({
      message: `${results.length} students enrolled successfully.`,
      count: results.length
    });
  } catch (error) {
    console.error('Enrollment Error:', error);
    res.status(500).json({ error: 'Failed to process Excel file.' });
  }
};
