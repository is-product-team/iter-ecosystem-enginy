import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const comps = await prisma.competence.findMany();
  console.log('Total competencies:', comps.length);
  console.log(JSON.stringify(comps, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
