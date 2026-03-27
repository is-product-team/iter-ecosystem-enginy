import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

async function test() {
    const prisma = new PrismaClient();
    try {
        console.log('--- Testing DB Connection ---');
        await prisma.$queryRaw`SELECT 1`;
        console.log('DB Connection: OK');

        console.log('--- Testing User Retrieval ---');
        const user = await prisma.user.findUnique({
            where: { email: 'admin@admin.com' },
            include: { role: true, center: true }
        });

        if (user) {
            console.log('User found:', {
                id: user.userId,
                email: user.email,
                role: user.role?.roleName,
                center: user.center ? user.center.name : 'None'
            });

            console.log('--- Testing Password Comparison ---');
            const valid = await bcrypt.compare('Iter@1234', user.password_hash);
            console.log('Password valid:', valid);
        } else {
            console.log('User NOT found: admin@admin.com');
        }

    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

test();
