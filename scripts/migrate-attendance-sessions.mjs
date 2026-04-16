import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Starting Attendance -> Session migration...');

    const attendanceRecords = await prisma.attendance.findMany({
        where: { sessionId: null },
        include: {
            enrollment: {
                select: { assignmentId: true }
            }
        }
    });

    console.log(`Found ${attendanceRecords.length} records to migrate.`);

    let migratedCount = 0;
    let errorCount = 0;

    for (const record of attendanceRecords) {
        const assignmentId = record.enrollment.assignmentId;
        
        // Find session by assignment, number and date
        const session = await prisma.session.findFirst({
            where: {
                assignmentId: assignmentId,
                // In some cases we might only have sessionNumber or date, 
                // but usually both define the unique session for that assignment
                sessionDate: record.sessionDate
            }
        });

        if (session) {
            await prisma.attendance.update({
                where: { attendanceId: record.attendanceId },
                data: { sessionId: session.sessionId }
            });
            migratedCount++;
        } else {
            console.warn(`⚠️ No session found for Attendance ${record.attendanceId} (Assignment: ${assignmentId}, Date: ${record.sessionDate.toISOString().split('T')[0]})`);
            errorCount++;
        }
    }

    console.log(`\n✅ Migration complete!`);
    console.log(`- Successfully migrated: ${migratedCount}`);
    console.log(`- Errors/Not found: ${errorCount}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
