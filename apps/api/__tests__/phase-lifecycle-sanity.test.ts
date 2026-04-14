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

    // 1b. Cleanup existing requests for this center/workshop to avoid 400 'already exists'
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

    // 4. Create a test student in the center
    const student = await prisma.student.create({
      data: {
        idalu: 'TEST' + Date.now(),
        fullName: 'Sanity',
        lastName: 'Test Student',
        email: 'sanity' + Date.now() + '@test.com',
        originCenterId: testCenterId
      }
    });
    testStudentId = student.studentId;
  });

  afterAll(async () => {
    // Cleanup
    if (testStudentId) {
      await prisma.evaluation.deleteMany({ where: { enrollment: { studentId: testStudentId } } });
      await prisma.enrollment.deleteMany({ where: { studentId: testStudentId } });
      await prisma.student.delete({ where: { studentId: testStudentId } });
    }
    if (testAssignmentId) await prisma.assignment.deleteMany({ where: { assignmentId: testAssignmentId } });
    if (testRequestId) await prisma.request.deleteMany({ where: { requestId: testRequestId } });
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

    if (resReq.status !== 200) {
      console.error('Phase 1 Request Error:', resReq.body);
    }
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

  it('Phase 2: Should create an Assignment and enroll a student', async () => {
    // Create Assignment (Simulate Admin creating it)
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

    // Enroll Student
    const resEnroll = await request(app)
      .post(`/assignments/${testAssignmentId}/enrollments`)
      .set('Cookie', [coordinatorCookie])
      .send({ studentIds: [testStudentId] });

    if (resEnroll.status !== 200) {
      console.error('Phase 2 Enrollment Error:', resEnroll.body);
    }
    expect(resEnroll.status).toBe(200);
    expect(resEnroll.body.details.total).toBe(1);
  });

  it('Phase 3: Should validate documents and confirm registration (generating sessions)', async () => {
    // 1. Manually validate document (Simulation)
    const enrollment = await prisma.enrollment.findFirst({ where: { assignmentId: testAssignmentId } });
    expect(enrollment).toBeDefined();

    const resVal = await request(app)
      .patch(`/assignments/enrollments/${enrollment?.enrollmentId}/validate`)
      .set('Cookie', [adminCookie])
      .send({ field: 'isPedagogicalAgreementValidated', valid: true });

    if (resVal.status !== 200) {
      console.error('Phase 3 Validation Error:', resVal.body);
    }
    expect(resVal.status).toBe(200);

    // 2. Confirm legal registration (starts Phase 3)
    const resConfirm = await request(app)
      .post(`/assignments/${testAssignmentId}/confirm-registration`)
      .set('Cookie', [coordinatorCookie]);

    if (resConfirm.status !== 200) {
      console.error('Phase 3 Confirmation Error:', resConfirm.body);
    }
    expect(resConfirm.status).toBe(200);

    // 3. Verify sessions were generated
    const sessions = await prisma.session.findMany({ where: { assignmentId: testAssignmentId } });
    expect(sessions.length).toBeGreaterThan(0);
  });

  it('Phase 4: Should close the assignment and verify certificate readiness', async () => {
    // 1. Add teacher evaluation (Prerequisite for Phase 4)
    const enrollment = await prisma.enrollment.findFirst({ where: { assignmentId: testAssignmentId } });
    
    await prisma.evaluation.create({
      data: {
        assignmentId: testAssignmentId,
        enrollmentId: enrollment?.enrollmentId,
        observations: 'Excellent',
        type: 'TEACHER_COMPETENCES'
      }
    });

    const resClose = await request(app)
      .post(`/assignments/${testAssignmentId}/close`)
      .set('Cookie', [adminCookie]);

    if (resClose.status !== 200) {
      console.error('Phase 4 Closure Error:', resClose.body);
    }
    expect(resClose.status).toBe(200);
    expect(resClose.body.success).toBe(true);
    
    // Verify assignment status is COMPLETED
    const assignment = await prisma.assignment.findUnique({ where: { assignmentId: testAssignmentId } });
    expect(assignment?.status).toBe('COMPLETED');
  });
});
