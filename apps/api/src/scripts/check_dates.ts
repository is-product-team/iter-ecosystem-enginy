
// @ts-nocheck
import prisma from '../lib/prisma.js';

async function main() {
  const email = 'marta@test.com';
  console.log(`Checking assignments for user: ${email}`);

  // 1. Get user and professor ID
  const user = await prisma.usuari.findUnique({ where: { email } });
  if (!user) { console.log('User not found'); return; }

  const professor = await prisma.professor.findFirst({ where: { nom: user.nom_complet } });
  if (!professor) { console.log('Professor not found'); return; }

  console.log(`Professor ID: ${professor.id_professor}`);

  // 2. Get assignments
  const assignments = await prisma.assignacio.findMany({
    where: {
      OR: [
        { prof1_id: professor.id_professor },
        { prof2_id: professor.id_professor }
      ]
    },
    include: { taller: true }
  });

  console.log('Assignments found:', assignments.length);
  assignments.forEach(a => {
    console.log(`ID: ${a.id_assignacio}`);
    console.log(`Taller: ${a.taller.titol}`);
    console.log(`Start: ${a.data_inici}`);
    console.log(`End:   ${a.data_fi}`);
    console.log('---');
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
