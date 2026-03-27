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
      status: { in: [RequestStatus.APPROVED, RequestStatus.PENDING] },
      assignment: null
    },
    include: {
      workshop: true,
      center: true
    },
    orderBy: {
      createdAt: 'asc' // Strict FIFO: First come, first served
    }
  });

  stats.totalPetitions = petitions.length;
  stats.totalStudents = petitions.reduce((acc: number, p: any) => acc + (p.studentsAprox || 0), 0);

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

  for (const workshopId in tallerGroups) {
    const tallerPetitions = tallerGroups[workshopId];
    const workshop = (tallerPetitions[0] as any).workshop;

    // 1. Calculate strictly occupied capacity from existing assignments
    const existingAssignments = await prisma.assignment.findMany({
      where: { id_workshop: parseInt(workshopId) },
      include: { request: true }
    });

    const occupiedPlazas = (existingAssignments as any[]).reduce((sum: number, a: any) => {
      return sum + (a.request?.studentsAprox || 0);
    }, 0);

    let currentCapacity = workshop.maxPlaces - occupiedPlazas;

    console.log(`📊 Workshop ID ${workshopId} (${workshop.title}): Plazas Totales: ${workshop.maxPlaces}, Ocupadas: ${occupiedPlazas}, Disponibles: ${currentCapacity}`);

    if (currentCapacity <= 0) {
      console.log(`🚫 Workshop ${workshopId} está lleno. Saltando ${tallerPetitions.length} peticiones.`);
      stats.workshopsFull++;
      continue;
    }
    for (const petition of tallerPetitions) {
      const neededPlazas = petition.studentsAprox || 0;

      if (currentCapacity >= neededPlazas) {
        // 1. If petition is Pendent, approve it automatically
        if (petition.status === RequestStatus.PENDING) {
          console.log(`✅ TetrisService: Auto-approving petition ${petition.id_request} for center ID ${petition.id_center}`);
          await prisma.request.update({
            where: { id_request: petition.id_request },
            data: { status: RequestStatus.APPROVED }
          });
        }

        // 2. Create Assignment
        const assignacio = await prisma.assignment.create({
          data: {
            id_request: petition.id_request,
            id_center: petition.id_center,
            id_workshop: petition.id_workshop,
            status: ASSIGNMENT_STATUSES.PUBLISHED,
            checklist: {
              create: [
                { stepName: 'Designar Professors Referents', isCompleted: false },
                { stepName: 'Pujar Registre Nominal (Excel)', isCompleted: false },
                { stepName: 'Gestionar Acord Pedagògic', isCompleted: petition.modality !== 'C' },
                { stepName: 'Autoritzacions d\'Imatge i Desplaçament', isCompleted: false }
              ]
            }
          }
        });

        // 3. Send Notification
        await createNotificationInterna({
          id_center: petition.id_center,
          title: 'Sol·licitud Assignada Automàticament',
          message: `La teva sol·licitud per al taller "${workshop.title}" ha estat acceptada i assignada via procés automàtic.`,
          type: 'PETICIO',
          importancia: 'INFO'
        });

        createdAssignments.push(assignacio);
        currentCapacity -= neededPlazas;
        stats.assignedPetitions++;
        stats.assignedStudents += neededPlazas;
      } else {
        console.log(`⚠️ TetrisService: Skipping petition ${petition.id_request} due to insufficient capacity in workshop ${workshopId} (Needed: ${neededPlazas}, Available: ${currentCapacity})`);
      }
    }

    if (currentCapacity === 0) {
      stats.workshopsFull++;
    }
  }

  return { stats, createdAssignments };
}
