import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/index.js';
import prisma from '../src/lib/prisma.js';

describe.skipIf(!process.env.DATABASE_URL)('Phase Lifecycle Sanity Test', () => {
  let adminCookie: string;
  let coordinatorCookie: string;
  let testWorkshopId: number;
  let testCenterId: number;
  let testRequestId: number;
  let testAssignmentId: number;
  let testStudentId: number;
  let testStudent2Id: number;
  let testTeacher1Id: number;
  let testTeacher2Id: number;

  beforeAll(async () => {
    const isDockerUrl = process.env.DATABASE_URL?.includes('@db:');
    if (!process.env.DATABASE_URL || isDockerUrl) {
      console.warn('⏩ Skipping Phase Lifecycle Sanity Test: DATABASE_URL not set or points to internal Docker host.');
      return;
    }
    // 1. Get seed data or create test baseline
    const admin = await prisma.user.findFirst({ where: { email: 'admin@admin.com' } });
    const coordinator = await prisma.user.findFirst({ where: { email: 'coordinacion@brossa.cat' } });
    const workshop = await prisma.workshop.findFirst();
    const center = await prisma.center.findFirst({ where: { centerCode: '08014231' } });
    const teachers = await prisma.user.findMany({ where: { role: { roleName: 'TEACHER' } }, take: 2 });

    if (!admin || !coordinator || !workshop || !center || teachers.length < 2) {
      throw new Error('Seed data missing for sanity test');
    }

    testWorkshopId = workshop.workshopId;
    testCenterId = center.centerId;
    testTeacher1Id = teachers[0].userId;
    testTeacher2Id = teachers[1].userId;

    // 1b. Cleanup existing assignments for this center/workshop to avoid conflicts
    const existingAssignments = await prisma.assignment.findMany({
        where: { centerId: testCenterId, workshopId: testWorkshopId }
    });

    for (const assig of existingAssignments) {
        await prisma.attendance.deleteMany({ where: { enrollment: { assignmentId: assig.assignmentId } } });
        await prisma.evaluation.deleteMany({ where: { enrollment: { assignmentId: assig.assignmentId } } });
        await prisma.certificate.deleteMany({ where: { assignmentId: assig.assignmentId } });
        await prisma.enrollment.deleteMany({ where: { assignmentId: assig.assignmentId } });
        await prisma.sessionTeacher.deleteMany({ where: { session: { assignmentId: assig.assignmentId } } });
        await prisma.session.deleteMany({ where: { assignmentId: assig.assignmentId } });
    }
    await prisma.assignment.deleteMany({ where: { centerId: testCenterId, workshopId: testWorkshopId } });

    // 1c. Cleanup existing requests
    await prisma.request.deleteMany({
      where: {
        centerId: testCenterId,
        workshopId: testWorkshopId
      }
    });

    // 2. Login as Admin
    const adminLogin = await request(app)
      .post('/auth/login')
      .send({ email: 'admin@admin.com', password: 'Iter@1234' });
    adminCookie = adminLogin.headers['set-cookie']?.[0] || '';

    // 3. Login as Coordinator
    const coordLogin = await request(app)
      .post('/auth/login')
      .send({ email: 'coordinacion@brossa.cat', password: 'Iter@1234' });
    coordinatorCookie = coordLogin.headers['set-cookie']?.[0] || '';

    // 4. Create two test students in the center
    const student1 = await prisma.student.create({
      data: {
        idalu: 'TEST1' + Date.now(),
        fullName: 'Sanity 1',
        lastName: 'Qualifies',
        email: 'sanity1' + Date.now() + '@test.com',
        originCenterId: testCenterId
      }
    });
    testStudentId = student1.studentId;

    const student2 = await prisma.student.create({
      data: {
        idalu: 'TEST2' + Date.now(),
        fullName: 'Sanity 2',
        lastName: 'Fails',
        email: 'sanity2' + Date.now() + '@test.com',
        originCenterId: testCenterId
      }
    });
    testStudent2Id = student2.studentId;
  });

  afterAll(async () => {
    // Cleanup
    try {
        const studentIds = [testStudentId, testStudent2Id].filter(id => !!id);
        if (studentIds.length > 0) {
          await prisma.evaluation.deleteMany({ where: { enrollment: { studentId: { in: studentIds } } } });
          await prisma.certificate.deleteMany({ where: { studentId: { in: studentIds } } });
          await prisma.attendance.deleteMany({ where: { enrollment: { studentId: { in: studentIds } } } });
          await prisma.enrollment.deleteMany({ where: { studentId: { in: studentIds } } });
          await prisma.student.deleteMany({ where: { studentId: { in: studentIds } } });
        }
        if (testAssignmentId) {
            await prisma.sessionTeacher.deleteMany({ where: { session: { assignmentId: testAssignmentId } } });
            await prisma.session.deleteMany({ where: { assignmentId: testAssignmentId } });
            await prisma.assignment.deleteMany({ where: { assignmentId: testAssignmentId } });
        }
        if (testRequestId) await prisma.request.deleteMany({ where: { requestId: testRequestId } });
    } catch (e) {
        console.warn('Cleanup error in Sanity Test (ignoring):', e);
    }
  });

  it('Phase 1: Should create a Request as Coordinator and approve it as Admin', async () => {
    // Create Request
    const reqBody = {
      workshopId: testWorkshopId,
      studentsAprox: 10,
      comments: 'Sanity Test Request',
      prof1Id: testTeacher1Id,
      prof2Id: testTeacher2Id,
      modality: 'A'
    };

    const resReq = await request(app)
      .post('/requests')
      .set('Cookie', [coordinatorCookie])
      .send(reqBody);

    expect(resReq.status).toBe(200);
    testRequestId = resReq.body.requestId;
    expect(resReq.body.status).toBe('PENDING');

    // Approve Request
    const resApprove = await request(app)
      .patch(`/requests/${testRequestId}/status`)
      .set('Cookie', [adminCookie])
      .send({ status: 'APPROVED' });

    expect(resApprove.status).toBe(200);
    expect(resApprove.body.status).toBe('APPROVED');
  });

  it('Phase 2: Should create an Assignment and enroll students', async () => {
    // Create Assignment
    const resAssig = await prisma.assignment.create({
      data: {
        requestId: testRequestId,
        centerId: testCenterId,
        workshopId: testWorkshopId,
        status: 'PUBLISHED',
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });
    testAssignmentId = resAssig.assignmentId;

    // Enroll Students
    const resEnroll = await request(app)
      .post(`/assignments/${testAssignmentId}/enrollments`)
      .set('Cookie', [coordinatorCookie])
      .send({ studentIds: [testStudentId, testStudent2Id] });

    expect(resEnroll.status).toBe(200);
    expect(resEnroll.body.details.total).toBe(2);
  });

  it('Phase 3: Should validate documents, start workshop and register attendance (including Justified Absence)', async () => {
    // 1. Manually validate document for both
    const enrollments = await prisma.enrollment.findMany({ where: { assignmentId: testAssignmentId } });
    expect(enrollments.length).toBe(2);

    for (const enrollment of enrollments) {
        await request(app)
            .patch(`/assignments/enrollments/${enrollment.enrollmentId}/validate`)
            .set('Cookie', [adminCookie])
            .send({ field: 'isPedagogicalAgreementValidated', valid: true });
        
        await request(app)
            .patch(`/assignments/enrollments/${enrollment.enrollmentId}/validate`)
            .set('Cookie', [adminCookie])
            .send({ field: 'isMobilityAuthorizationValidated', valid: true });

        await request(app)
            .patch(`/assignments/enrollments/${enrollment.enrollmentId}/validate`)
            .set('Cookie', [adminCookie])
            .send({ field: 'isImageRightsValidated', valid: true });
    }

    // 2. Confirm legal registration (starts Phase 3)
    const resConfirm = await request(app)
      .post(`/assignments/${testAssignmentId}/confirm-registration`)
      .set('Cookie', [coordinatorCookie]);

    expect(resConfirm.status).toBe(200);

    // 3. Register Attendance (Task 4.1)
    const sessions = await prisma.session.findMany({ where: { assignmentId: testAssignmentId } });
    expect(sessions.length).toBeGreaterThan(0);

    const enrollment1 = enrollments.find(e => e.studentId === testStudentId)!;
    const enrollment2 = enrollments.find(e => e.studentId === testStudent2Id)!;

    for (let i = 1; i <= sessions.length; i++) {
        // Student 1: 50% Present, 50% Justified Absence -> Should qualify (100% total)
        const status1 = i % 2 === 0 ? 'PRESENT' : 'JUSTIFIED_ABSENCE';
        // Student 2: 10% Present, rest Absent -> Should NOT qualify
        const status2 = i === 1 ? 'PRESENT' : 'ABSENT';

        await request(app)
            .post(`/assignments/${testAssignmentId}/sessions/${i}/attendance`)
            .set('Cookie', [adminCookie])
            .send([
                { enrollmentId: enrollment1.enrollmentId, status: status1 },
                { enrollmentId: enrollment2.enrollmentId, status: status2 }
            ]);
    }
  });

  it('Phase 4: Should close the assignment and verify targeted certificate generation', async () => {
    // 1. Add teacher evaluation (Prerequisite for Phase 4)
    const enrollments = await prisma.enrollment.findMany({ where: { assignmentId: testAssignmentId } });
    
    for (const enrollment of enrollments) {
        await prisma.evaluation.create({
          data: {
            assignmentId: testAssignmentId,
            enrollmentId: enrollment.enrollmentId,
            observations: 'Good',
            type: 'TEACHER_COMPETENCES'
          }
        });
    }

    const resClose = await request(app)
      .post(`/assignments/${testAssignmentId}/close`)
      .set('Cookie', [adminCookie]);

    expect(resClose.status).toBe(200);
    expect(resClose.body.success).toBe(true);
    
    // Verify assignment status is COMPLETED
    const assignment = await prisma.assignment.findUnique({ where: { assignmentId: testAssignmentId } });
    expect(assignment?.status).toBe('COMPLETED');

    // Verify Certificate 1 was generated (qualified with justified absences)
    const cert1 = await prisma.certificate.findFirst({
        where: { studentId: testStudentId, assignmentId: testAssignmentId }
    });
    expect(cert1).toBeDefined();

    // Verify Certificate 2 was NOT generated (low attendance)
    const cert2 = await prisma.certificate.findFirst({
        where: { studentId: testStudent2Id, assignmentId: testAssignmentId }
    });
    expect(cert2).toBeNull();
  });
});
