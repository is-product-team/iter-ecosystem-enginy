const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    // Standardized to use prisma.user
    const users = await prisma.user.findMany({ include: { role: true } });
    console.log(JSON.stringify(users.map(u => ({ id: u.userId, email: u.email, role: u.role.roleName }))));
}
main().catch(err => {
    console.error(err);
    process.exit(1);
}).finally(() => prisma.$disconnect());
