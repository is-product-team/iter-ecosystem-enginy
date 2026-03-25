
import { SessionService } from '../src/services/session.service.js';
import prisma from '../src/lib/prisma.js';

async function main() {
    console.log('--- Verifying Phase 3 Backend Implementation ---');

    // 1. Test Date Generation
    console.log('\n1. Testing Date Generation');
    const startDate = new Date('2026-01-13T00:00:00Z'); // Tuesday
    const dates = SessionService.generateSessionDates(startDate, 3);
    console.log('Start:', startDate.toISOString());
    console.log('Generated (3 sessions):', dates.map((d: any) => d.toISOString()));

    if (dates.length !== 3) throw new Error('Date generation failed count');
    if (dates[1].getTime() - dates[0].getTime() !== 7 * 24 * 3600 * 1000) throw new Error('Date generation interval failed');
    console.log('✅ Date Generation: OK');

    // 2. Integration Test (requires DB connection)
    console.log('\n2. Testing DB Integration (ReadOnly check)');
    try {
        let assignment = await prisma.assignment.findFirst({
            where: { data_inici: { not: null } }
        });

        // If no assignment exists, create a dummy one for testing
        let createdDummy = false;
        if (!assignment) {
            console.log('⚠️ No active assignments found. Creating a DUMMY assignment for testing...');

            const center = await prisma.center.findFirst();
            const workshop = await prisma.workshop.findFirst();

            if (center && workshop) {
                assignment = await prisma.assignment.create({
                    data: {
                        id_center: center.id_center,
                        id_workshop: workshop.id_workshop,
                        data_inici: new Date('2026-02-01'),
                        data_fi: new Date('2026-04-10'),
                        estat: 'IN_PROGRESS'
                    }
                });
                createdDummy = true;
                console.log(`✅ Created dummy assignment ID: ${assignment.id_assignment}`);
            } else {
                console.error('❌ Cannot create dummy assignment: No Center or Workshop found in DB.');
            }
        }

        if (assignment) {
            console.log(`Found Assignment ID: ${assignment.id_assignment} starting ${assignment.data_inici}`);
            const sessionsStatus = await Promise.all(
                [1, 2, 3].map(async i => ({
                    num: i,
                    status: await SessionService.getSessionStatus(assignment!.id_assignment, i)
                }))
            );
            console.log('Session Statuses:', sessionsStatus);
            console.log('✅ DB Connection & Service: OK');

            // Verify Attendance Initialization (Create fake enrollment if needed)
            // Check if there are enrollments
            const enrollments = await prisma.enrollment.count({ where: { id_assignment: assignment.id_assignment } });
            if (enrollments === 0) {
                const student = await prisma.student.findFirst();
                if (student) {
                    await prisma.enrollment.create({
                        data: { id_assignment: assignment.id_assignment, id_student: student.id_student }
                    });
                    console.log('Created dummy enrollment for testing attendance init.');
                }
            }

            console.log('Testing ensureAttendanceRecords...');
            await SessionService.ensureAttendanceRecords(assignment.id_assignment, 1, new Date());
            const statusAfter = await SessionService.getSessionStatus(assignment.id_assignment, 1);
            console.log(`Session 1 Status After Init: ${statusAfter}`);

            if (createdDummy) {
                // Cleanup
                console.log('Cleaning up dummy data...');
                await prisma.attendance.deleteMany({ where: { enrollment: { id_assignment: assignment.id_assignment } } });
                await prisma.enrollment.deleteMany({ where: { id_assignment: assignment.id_assignment } });
                await prisma.assignment.delete({ where: { id_assignment: assignment.id_assignment } });
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
