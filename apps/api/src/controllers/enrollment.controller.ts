import { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import * as xlsx from 'xlsx';
import { ROLES } from '@iter/shared';

/**
 * Upload Excel and import students to an assignment
 */
export const enrollStudentsViaExcel = async (req: Request, res: Response) => {
  const { idAssignacio } = req.params;
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

    const assignacio = await prisma.assignacio.findUnique({
      where: { id_assignacio: parseInt(idAssignacio as string) },
      include: { centre: true }
    });

    if (!assignacio) {
      return res.status(404).json({ error: 'Assignment not found.' });
    }

    const results = [];
    for (const s of studentsToCreate) {
      // Upsert student (they might already exist if they are in multiple workshops or from previous years)
      const alumne = await prisma.alumne.upsert({
        where: { idalu: s.idalu },
        update: {
          nom: s.nom,
          cognoms: s.cognoms,
          curs: s.curs
        },
        create: {
          ...s,
          id_centre_procedencia: assignacio.id_centre
        }
      });

      // Create inscription
      const inscripcio = await prisma.inscripcio.upsert({
        where: {
          // We don't have a unique key for inscripcio, so we manually check
          id_inscripcio: -1 // dummy
        },
        update: {},
        create: {
          id_assignacio: assignacio.id_assignacio,
          id_alumne: alumne.id_alumne
        }
      }).catch(async () => {
        // Manual check for existing
        const existing = await prisma.inscripcio.findFirst({
          where: { id_assignacio: assignacio.id_assignacio, id_alumne: alumne.id_alumne }
        });
        if (!existing) {
          return prisma.inscripcio.create({
            data: { id_assignacio: assignacio.id_assignacio, id_alumne: alumne.id_alumne }
          });
        }
        return existing;
      });

      results.push(inscripcio);
    }

    // Update checklist
    await prisma.checklistAssignacio.updateMany({
      where: {
        id_assignacio: assignacio.id_assignacio,
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
