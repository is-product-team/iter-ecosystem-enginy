import { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import { isPhaseActive, PHASES } from '../lib/phaseUtils.js';

/**
 * Registra o actualiza la asistencia de un alumno en una sesión.
 */
export const registerAssistencia = async (req: Request, res: Response) => {
  const { assistencia, id_assignacio } = req.body;

  try {
    if (!Array.isArray(assistencia) || !id_assignacio) {
        return res.status(400).json({ error: 'Format de dades incorrecte. S\'espera array d\'assistencia i id_assignacio.' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Determines session number (defaults to 1 if not strictly scheduled)
    const sessionMatch = await prisma.sessio.findFirst({
        where: { 
            id_assignacio: parseInt(id_assignacio),
            data_sessio: today
        }
    });
    const sessionNum = sessionMatch ? sessionMatch.id_sessio : 1;

    // Helper to map mobile status (UPPERCASE) to Prisma Enum (PascalCase)
    const mapStatus = (status: string) => {
        switch (status) {
            case 'PRESENT': return 'Present';
            case 'ABSENT': return 'Absencia'; // Maps to "Absencia" or "Absencia_Justificada" if needed
            case 'RETARD': return 'Retard';
            default: return 'Present'; // Fallback
        }
    };

    const results = await Promise.all(assistencia.map(async (item: any) => {
        // Resolve student ID
        const idAlumneInt = parseInt(item.id_alumne);
        
        // Find Enrollment (Inscripcio)
        const validInscripcio = await prisma.inscripcio.findFirst({
             where: {
                 id_assignacio: parseInt(id_assignacio),
                 id_alumne: idAlumneInt
             }
        });

        if (!validInscripcio) return null;

        const prismaStatus = mapStatus(item.estat);

        // Check for existing attendance today
        const existing = await prisma.assistencia.findFirst({
            where: {
                id_inscripcio: validInscripcio.id_inscripcio,
                data_sessio: today
            }
        });

        if (existing) {
            return prisma.assistencia.update({
                where: { id_assistencia: existing.id_assistencia },
                data: {
                    estat: prismaStatus as any, // Cast to any to avoid strict typing issues with generated enums if imports missing
                    observacions: item.observacions
                }
            });
        } else {
            return prisma.assistencia.create({
                data: {
                    id_inscripcio: validInscripcio.id_inscripcio,
                    numero_sessio: sessionNum,
                    data_sessio: today,
                    estat: prismaStatus as any, 
                    observacions: item.observacions
                }
            });
        }
    }));

    res.json({ success: true, processed: results.filter(r => r !== null).length });
  } catch (error) {
    console.error("Error en registerAssistencia:", error);
    res.status(500).json({ error: 'Error al registrar l\'assistència.' });
  }
};

/**
 * Obtiene la asistencia de una asignación completa.
 */
export const getAssistenciaByAssignacio = async (req: Request, res: Response) => {
  const { idAssignacio } = req.params;

  try {
    const assistencies = await prisma.assistencia.findMany({
      where: {
        inscripcio: {
          id_assignacio: parseInt(idAssignacio as string)
        }
      },
      include: {
        inscripcio: {
          include: {
            alumne: true
          }
        }
      }
    });

    res.json(assistencies);
  } catch (error) {
    console.error("Error en assistencia.controller.getAssistenciaByAssignacio:", error);
    res.status(500).json({ error: 'Error al carregar l\'assistència.' });
  }
};
