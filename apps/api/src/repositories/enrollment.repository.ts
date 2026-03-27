import { Enrollment, Prisma, Attendance } from '@prisma/client';
import { BaseRepository } from './base.repository.js';

export class EnrollmentRepository extends BaseRepository<Enrollment, Prisma.EnrollmentCreateInput, Prisma.EnrollmentUpdateInput> {
  constructor() {
    super('enrollment', 'id_enrollment');
  }

  override async findById(id: number): Promise<Enrollment | null> {
    return this.prisma.enrollment.findUnique({
      where: { id_enrollment: id },
      include: {
        student: true,
        assignment: { include: { workshop: true, center: true } },
        attendance: { orderBy: { sessionNumber: 'asc' } }
      }
    });
  }

  async findByAssignment(assignmentId: number): Promise<Enrollment[]> {
    return this.prisma.enrollment.findMany({
      where: { id_assignment: assignmentId },
      include: {
        student: true,
        attendance: true
      },
      orderBy: { student: { surnames: 'asc' } }
    });
  }

  // Lógica específica para asistencia
  async registerAttendance(enrollmentId: number, data: Omit<Prisma.AttendanceCreateInput, 'enrollment'>): Promise<Attendance> {
    return this.prisma.attendance.create({
      data: {
        ...data,
        enrollment: { connect: { id_enrollment: enrollmentId } }
      }
    });
  }

  async updateAttendance(attendanceId: number, data: Prisma.AttendanceUpdateInput): Promise<Attendance> {
    return this.prisma.attendance.update({
      where: { id_attendance: attendanceId },
      data
    });
  }
}

export const enrollmentRepository = new EnrollmentRepository();
