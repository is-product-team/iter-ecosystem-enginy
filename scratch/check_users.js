import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const email = 'marticastanorodriguez@gmail.com';
  const users = await prisma.user.findMany({
    where: { email },
    include: { role: true }
  });

  console.log(`Found ${users.length} users with email ${email}:`);
  users.forEach(u => {
    console.log(`- ID: ${u.userId}, Name: ${u.fullName}, Role: ${u.role.roleName}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
