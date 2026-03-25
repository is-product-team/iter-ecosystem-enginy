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
      nom: row.nom || row.Nombre || '',
      cognoms: row.cognoms || row.Apellidos || '',
      idalu: String(row.idalu || row.ID || ''),
      curs: row.curs || row.Curso || ''
    })).filter(s => s.nom && s.idalu);

    const assignacio = await prisma.assignment.findUnique({
      where: { id_assignment: parseInt(idAssignment as string) },
      include: { center: true }
    });

    if (!assignacio) {
      return res.status(404).json({ error: 'Assignment not found.' });
    }

    const results = [];
    for (const s of studentsToCreate) {
      // Upsert student (they might already exist if they are in multiple workshops or from previous years)
      const alumne = await prisma.student.upsert({
        where: { idalu: s.idalu },
        update: {
          nom: s.nom,
          cognoms: s.cognoms,
          curs: s.curs
        },
        create: {
          ...s,
          id_center_origin: assignacio.id_center
        }
      });

      // Create inscription
      const inscripcio = await prisma.enrollment.upsert({
        where: {
          // We don't have a unique key for inscripcio, so we manually check
          id_enrollment: -1 // dummy
        },
        update: {},
        create: {
          id_assignment: assignacio.id_assignment,
          id_student: alumne.id_student
        }
      }).catch(async () => {
        // Manual check for existing
        const existing = await prisma.enrollment.findFirst({
          where: { id_assignment: assignacio.id_assignment, id_student: alumne.id_student }
        });
        if (!existing) {
          return prisma.enrollment.create({
            data: { id_assignment: assignacio.id_assignment, id_student: alumne.id_student }
          });
        }
        return existing;
      });

      results.push(inscripcio);
    }

    // Update checklist
    await prisma.assignmentChecklist.updateMany({
      where: {
        id_assignment: assignacio.id_assignment,
        pas_nom: { contains: 'Registro Nominal' }
      },
      data: {
        completat: true,
        data_completat: new Date()
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
