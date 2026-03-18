import { PHASES } from '@iter/shared';
import prisma from './prisma.js';

/**
 * Checks if a phase is active and the current date is within the phase's start and end dates.
 * @param phaseName The unique name of the phase to check.
 * @returns Object containing whether the phase is active and optionally the phase data.
 */
export async function isPhaseActive(phaseName: string) {
  const now = new Date();
  const phase = await prisma.fase.findUnique({
    where: { nom: phaseName }
  });

  if (!phase) {
    return { isActive: false, error: `Fase '${phaseName}' no encontrada.` };
  }

  const isWithinDates = now >= phase.data_inici && now <= phase.data_fi;
  const isActive = phase.activa && isWithinDates;

  return {
    isActive,
    isWithinDates,
    phaseActiveFlag: phase.activa,
    phase
  };
}

/**
 * Common phase names constants (matching seed data)
 */
export { PHASES };
