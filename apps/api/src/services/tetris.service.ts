import prisma from '../lib/prisma.js';
import { RequestStatus } from '@prisma/client';
import { ASSIGNMENT_STATUSES, REQUEST_STATUSES } from '@iter/shared';
import { createNotificationInterna } from '../controllers/notificacio.controller.js';

export interface TetrisStats {
  totalPetitions: number;
  assignedPetitions: number;
  totalStudents: number;
  assignedStudents: number;
  workshopsFull: number;
}

/**
 * Tetris Assignment Logic
 * 1. Get all 'Aprovada' petitions.
 * 2. Group them by taller.
 * 3. For each taller, attempt to fit the petitions.
 * 4. Priority: Modalidad C diversity (max 4 per center).
 */
export async function runTetris() {
  const stats: TetrisStats = {
    totalPetitions: 0,
    assignedPetitions: 0,
    totalStudents: 0,
    assignedStudents: 0,
    workshopsFull: 0
  };

  // 1. Get all approved (or pending) petitions that don't have an assignment yet
  const petitions = await prisma.request.findMany({
    where: {
      estat: { in: [REQUEST_STATUSES.APPROVED as any, REQUEST_STATUSES.PENDING as any] },
      assignment: null
    },
    include: {
      workshop: true,
      center: true
    },
    orderBy: {
      data_request: 'asc' // Strict FIFO: First come, first served
    }
  });

  stats.totalPetitions = petitions.length;
  stats.totalStudents = petitions.reduce((acc: number, p: any) => acc + (p.alumnes_aprox || 0), 0);

  if (petitions.length === 0) {
    console.log('ℹ️ TetrisService: No approved petitions found waiting for assignment.');
  } else {
    console.log(`🚀 TetrisService: Starting assignment for ${petitions.length} petitions...`);
  }

  // Group by Workshop
  const tallerGroups: Record<number, typeof petitions> = {};
  for (const p of petitions) {
    if (!tallerGroups[p.id_workshop]) {
      tallerGroups[p.id_workshop] = [];
    }
    tallerGroups[p.id_workshop].push(p);
  }

  const createdAssignments = [];

  for (const tallerId in tallerGroups) {
    const tallerPetitions = tallerGroups[tallerId];
    const taller = (tallerPetitions[0] as any).taller;

    // 1. Calculate strictly occupied capacity from existing assignments
    const existingAssignments = await prisma.assignment.findMany({
      where: { id_workshop: parseInt(tallerId) },
      include: { request: true }
    });

    const occupiedPlazas = (existingAssignments as any[]).reduce((sum: number, a: any) => {
      return sum + (a.peticio?.alumnes_aprox || 0);
    }, 0);

    let currentCapacity = taller.places_maximes - occupiedPlazas;

    console.log(`📊 Workshop ID ${tallerId} (${taller.titol}): Plazas Totales: ${taller.places_maximes}, Ocupadas: ${occupiedPlazas}, Disponibles: ${currentCapacity}`);

    if (currentCapacity <= 0) {
      console.log(`🚫 Workshop ${tallerId} está lleno. Saltando ${tallerPetitions.length} peticiones.`);
      stats.workshopsFull++;
      continue;
    }
    for (const petition of tallerPetitions) {
      const neededPlazas = petition.alumnes_aprox || 0;

      if (currentCapacity >= neededPlazas) {
        // 1. If petition is Pendent, approve it automatically
        if (petition.estat === REQUEST_STATUSES.PENDING) {
          console.log(`✅ TetrisService: Auto-approving petition ${petition.id_request} for center ID ${petition.id_center}`);
          await prisma.request.update({
            where: { id_request: petition.id_request },
            data: { estat: REQUEST_STATUSES.APPROVED as any }
          });
        }

        // 2. Create Assignment
        const assignacio = await prisma.assignment.create({
          data: {
            id_request: petition.id_request,
            id_center: petition.id_center,
            id_workshop: petition.id_workshop,
            estat: ASSIGNMENT_STATUSES.PUBLISHED,
            checklist: {
              create: [
                { pas_nom: 'Designar Professors Referents', completat: false },
                { pas_nom: 'Pujar Registre Nominal (Excel)', completat: false },
                { pas_nom: 'Gestionar Acord Pedagògic', completat: petition.modalitat !== 'C' },
                { pas_nom: 'Autoritzacions d\'Imatge i Desplaçament', completat: false }
              ]
            }
          }
        });

        // 3. Send Notification
        await createNotificationInterna({
          id_center: petition.id_center,
          titol: 'Sol·licitud Assignada Automàticament',
          missatge: `La teva sol·licitud per al taller "${taller.titol}" ha estat acceptada i assignada via procés automàtic.`,
          tipus: 'PETICIO',
          importancia: 'INFO'
        });

        createdAssignments.push(assignacio);
        currentCapacity -= neededPlazas;
        stats.assignedPetitions++;
        stats.assignedStudents += neededPlazas;
      } else {
        console.log(`⚠️ TetrisService: Skipping petition ${petition.id_request} due to insufficient capacity in taller ${tallerId} (Needed: ${neededPlazas}, Available: ${currentCapacity})`);
      }
    }

    if (currentCapacity === 0) {
      stats.workshopsFull++;
    }
  }

  return { stats, createdAssignments };
}
