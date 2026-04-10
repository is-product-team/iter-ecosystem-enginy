
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const phases = await prisma.phase.findMany();
  console.log(JSON.stringify(phases, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
