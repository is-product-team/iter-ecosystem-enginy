const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    const users = await prisma.usuari.findMany({ include: { rol: true } });
    console.log(JSON.stringify(users.map(u => ({ id: u.userId, email: u.email, role: u.rol.nom_rol }))));
}
main().catch(err => {
    console.error(err);
    process.exit(1);
}).finally(() => prisma.$disconnect());
