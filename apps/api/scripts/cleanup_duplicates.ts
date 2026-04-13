import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanup() {
  console.log('🧹 Starting duplicates cleanup...');

  // 1. Get all workshops grouped by title and modality
  const workshops = await prisma.workshop.findMany({
    orderBy: { workshopId: 'asc' },
  });

  const groups: Record<string, any[]> = {};
  workshops.forEach(w => {
    const key = `${w.title}-${w.modality}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(w);
  });

  for (const key in groups) {
    const group = groups[key];
    if (group.length > 1) {
      console.log(`🔍 Found ${group.length} instances of "${key}"`);
      
      // Select master: the one with the most requests/assignments, or the first one
      let master = group[0];
      let maxConnections = 0;

      for (const w of group) {
        const reqCount = await prisma.request.count({ where: { workshopId: w.workshopId } });
        const assCount = await prisma.assignment.count({ where: { workshopId: w.workshopId } });
        const total = reqCount + assCount;
        
        if (total > maxConnections) {
          maxConnections = total;
          master = w;
        }
      }

      console.log(`⭐️ Master selected: ID ${master.workshopId} (Connections: ${maxConnections})`);

      const duplicates = group.filter(w => w.workshopId !== master.workshopId);

      for (const duplicate of duplicates) {
        console.log(`  - Moving data from ID ${duplicate.workshopId} to ID ${master.workshopId}`);
        
        // Update Requests
        await prisma.request.updateMany({
          where: { workshopId: duplicate.workshopId },
          data: { workshopId: master.workshopId }
        });

        // Update Assignments
        await prisma.assignment.updateMany({
          where: { workshopId: duplicate.workshopId },
          data: { workshopId: master.workshopId }
        });

        // Delete duplicate
        await prisma.workshop.delete({
          where: { workshopId: duplicate.workshopId }
        });
        
        console.log(`  ✅ Deleted duplicate ID ${duplicate.workshopId}`);
      }
    }
  }

  console.log('✨ Cleanup finished.');
}

cleanup()
  .catch(e => {
    console.error('❌ Error during cleanup:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
