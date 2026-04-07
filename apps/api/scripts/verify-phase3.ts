
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
            where: { startDate: { not: null } }
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
                        centerId: center.centerId,
                        workshopId: workshop.workshopId,
                        startDate: new Date('2026-02-01'),
                        endDate: new Date('2026-04-10'),
                        status: 'IN_PROGRESS'
                    }
                });
                createdDummy = true;
                console.log(`✅ Created dummy assignment ID: ${assignment.assignmentId}`);
            } else {
                console.error('❌ Cannot create dummy assignment: No Center or Workshop found in DB.');
            }
        }

        if (assignment) {
            const aId = assignment.assignmentId;
            console.log(`Found Assignment ID: ${aId} starting ${assignment.startDate}`);
            const sessionsStatus = await Promise.all(
                [1, 2, 3].map(async i => ({
                    num: i,
                    status: await SessionService.getSessionStatus(aId, i)
                }))
            );
            console.log('Session Statuses:', sessionsStatus);
            console.log('✅ DB Connection & Service: OK');

            // Verify Attendance Initialization (Create fake enrollment if needed)
            const enrollmentCount = await prisma.enrollment.count({ 
                where: { assignmentId: aId } 
            });
            
            if (enrollmentCount === 0) {
                const student = await prisma.student.findFirst();
                if (student) {
                    await prisma.enrollment.create({
                        data: { 
                            assignmentId: aId, 
                            studentId: student.studentId 
                        }
                    });
                    console.log('Created dummy enrollment for testing attendance init.');
                }
            }

            console.log('Testing ensureAttendanceRecords...');
            await SessionService.ensureAttendanceRecords(aId, 1, new Date());
            const statusAfter = await SessionService.getSessionStatus(aId, 1);
            console.log(`Session 1 Status After Init: ${statusAfter}`);

            if (createdDummy) {
                // Cleanup
                console.log('Cleaning up dummy data...');
                await prisma.attendance.deleteMany({ 
                    where: { enrollment: { assignmentId: aId } } 
                });
                await prisma.enrollment.deleteMany({ 
                    where: { assignmentId: aId } 
                });
                await prisma.assignment.delete({ 
                    where: { assignmentId: aId } 
                });
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
