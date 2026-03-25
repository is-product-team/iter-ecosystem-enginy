
// check_dates.ts
import prisma from '../lib/prisma.js';

async function main() {
  const email = 'marta@test.com';
  console.log(`Checking assignments for user: ${email}`);

  // 1. Get user and professor ID
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) { console.log('User not found'); return; }

  const teacher = await prisma.teacher.findFirst({ where: { id_user: user.id_user } });
  if (!teacher) { console.log('Teacher not found'); return; }

  console.log(`Teacher ID: ${teacher.id_teacher}`);

  // 2. Get assignments where this teacher is involved
  const assignments = await prisma.assignment.findMany({
    where: {
      teachers: {
        some: { id_user: teacher.id_user }
      }
    },
    include: { workshop: true }
  });

  console.log('Assignments found:', assignments.length);
  assignments.forEach((a: any) => {
    console.log(`ID: ${a.id_assignment}`);
    console.log(`Workshop: ${a.workshop.titol}`);
    console.log(`Start: ${a.data_inici}`);
    console.log(`End:   ${a.data_fi}`);
    console.log('---');
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
