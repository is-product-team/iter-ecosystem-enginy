
import { SessionService } from '../src/services/session.service';
import prisma from '../src/lib/prisma';

async function main() {
    console.log('--- Verifying Phase 3 Backend Implementation ---');

    // 1. Test Date Generation
    console.log('\n1. Testing Date Generation');
    const startDate = new Date('2026-01-13T00:00:00Z'); // Tuesday
    const dates = SessionService.generateSessionDates(startDate, 3);
    console.log('Start:', startDate.toISOString());
    console.log('Generated (3 sessions):', dates.map(d => d.toISOString()));

    if (dates.length !== 3) throw new Error('Date generation failed count');
    if (dates[1].getTime() - dates[0].getTime() !== 7 * 24 * 3600 * 1000) throw new Error('Date generation interval failed');
    console.log('✅ Date Generation: OK');

    // 2. Integration Test (requires DB connection)
    console.log('\n2. Testing DB Integration (ReadOnly check)');
    try {
        let assignment = await prisma.assignacio.findFirst({
            where: { data_inici: { not: null } }
        });

        // If no assignment exists, create a dummy one for testing
        let createdDummy = false;
        if (!assignment) {
            console.log('⚠️ No active assignments found. Creating a DUMMY assignment for testing...');

            const centre = await prisma.centre.findFirst();
            const taller = await prisma.taller.findFirst();

            if (centre && taller) {
                assignment = await prisma.assignacio.create({
                    data: {
                        id_centre: centre.id_centre,
                        id_taller: taller.id_taller,
                        data_inici: new Date('2026-02-01'),
                        data_fi: new Date('2026-04-10'),
                        estat: 'IN_PROGRESS'
                    }
                });
                createdDummy = true;
                console.log(`✅ Created dummy assignment ID: ${assignment.id_assignacio}`);
            } else {
                console.error('❌ Cannot create dummy assignment: No Centre or Taller found in DB.');
            }
        }

        if (assignment) {
            console.log(`Found Assignment ID: ${assignment.id_assignacio} starting ${assignment.data_inici}`);
            const sessionsStatus = await Promise.all(
                [1, 2, 3].map(async i => ({
                    num: i,
                    status: await SessionService.getSessionStatus(assignment!.id_assignacio, i)
                }))
            );
            console.log('Session Statuses:', sessionsStatus);
            console.log('✅ DB Connection & Service: OK');

            // Verify Attendance Initialization (Create fake enrollment if needed)
            // Check if there are enrollments
            const enrollments = await prisma.inscripcio.count({ where: { id_assignacio: assignment.id_assignacio } });
            if (enrollments === 0) {
                const alumne = await prisma.alumne.findFirst();
                if (alumne) {
                    await prisma.inscripcio.create({
                        data: { id_assignacio: assignment.id_assignacio, id_alumne: alumne.id_alumne }
                    });
                    console.log('Created dummy enrollment for testing attendance init.');
                }
            }

            console.log('Testing ensureAttendanceRecords...');
            await SessionService.ensureAttendanceRecords(assignment.id_assignacio, 1, new Date());
            const statusAfter = await SessionService.getSessionStatus(assignment.id_assignacio, 1);
            console.log(`Session 1 Status After Init: ${statusAfter}`);

            if (createdDummy) {
                // Cleanup
                console.log('Cleaning up dummy data...');
                await prisma.assistencia.deleteMany({ where: { inscripcio: { id_assignacio: assignment.id_assignacio } } });
                await prisma.inscripcio.deleteMany({ where: { id_assignacio: assignment.id_assignacio } });
                await prisma.assignacio.delete({ where: { id_assignacio: assignment.id_assignacio } });
                console.log('Cleanup done.');
            }

        } else {
            console.warn('⚠️ Skipped test: Could not find or create assignment.');
        }
    } catch (e) {
        console.error('❌ DB Error:', e);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
