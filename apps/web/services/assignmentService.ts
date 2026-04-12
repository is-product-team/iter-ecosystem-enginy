import getApi from "./api";

export interface Enrollment {
  enrollmentId: number;
  assignmentId: number;
  studentId: number;
  student: {
    studentId: number;
    fullName: string;
    lastName: string;
    grade: string;
    idalu: string;
    photoUrl?: string | null;
  };
  pedagogicalAgreementUrl?: string | null;
  isPedagogicalAgreementValidated: boolean;
  mobilityAuthorizationUrl?: string | null;
  isMobilityAuthorizationValidated: boolean;
  imageRightsUrl?: string | null;
  isImageRightsValidated: boolean;
  hasTeacherEvaluation?: boolean;
  evaluations?: any[];
  attendance?: any[];
}

export interface Assignment {
  assignmentId: number;
  requestId: number | null;
  centerId: number;
  workshopId: number;
  startDate: string | null;
  endDate: string | null;
  status: string;
  workshop?: { title: string; modality: string; maxPlaces: number };
  center?: { name: string };
  request?: { studentsAprox: number };
  teacher1?: { userId: number; name: string };
  teacher2?: { userId: number; name: string };
  enrollments?: Enrollment[];
  sessions?: any[];
  checklist?: unknown[];
}

interface BackendStudent {
  studentId: number;
  fullName: string;
  lastName: string;
  grade: string;
  idalu: string;
  photoUrl?: string | null;
}

interface BackendEnrollment {
  enrollmentId: number;
  assignmentId: number;
  studentId: number;
  student: BackendStudent;
  docsStatus?: {
    pedagogicalAgreement?: string;
    isPedagogicalAgreementValidated?: boolean;
    mobilityAuthorization?: string;
    isMobilityAuthorizationValidated?: boolean;
    imageRights?: string;
    isImageRightsValidated?: boolean;
  };
  evaluations?: any[];
  attendance?: any[];
}

interface BackendAssignment {
  assignmentId: number;
  requestId: number | null;
  centerId: number;
  workshopId: number;
  startDate: string | null;
  endDate: string | null;
  status: string;
  workshop?: { title: string; modality: string; maxPlaces: number };
  center?: { name: string };
  request?: { studentsAprox: number };
  teacher1?: { userId: number; name: string };
  teacher2?: { userId: number; name: string };
  enrollments?: BackendEnrollment[];
  sessions?: any[];
  checklist?: unknown[];
}

const assignmentService = {
  /**
   * Gets all assignments for a center.
   */
  getByCenter: async (centerId: number): Promise<Assignment[]> => {
    const api = getApi();
    try {
      const response = await api.get<BackendAssignment[]>(`/assignments/center/${centerId}`);
      return response.data.map((a: BackendAssignment) => ({
        assignmentId: a.assignmentId,
        requestId: a.requestId,
        centerId: a.centerId,
        workshopId: a.workshopId,
        startDate: a.startDate,
        endDate: a.endDate,
        status: a.status,
        workshop: a.workshop ? { 
          title: a.workshop.title,
          modality: a.workshop.modality,
          maxPlaces: a.workshop.maxPlaces
        } : undefined,
        center: a.center ? { name: a.center.name } : undefined,
        request: a.request ? { studentsAprox: a.request.studentsAprox } : undefined,
        teacher1: a.teacher1 ? { userId: a.teacher1.userId, name: a.teacher1.name } : undefined,
        teacher2: a.teacher2 ? { userId: a.teacher2.userId, name: a.teacher2.name } : undefined,
        enrollments: a.enrollments?.map((i: BackendEnrollment) => ({
          enrollmentId: i.enrollmentId,
          assignmentId: i.assignmentId,
          studentId: i.studentId,
          student: {
            studentId: i.student.studentId,
            fullName: i.student.fullName,
            lastName: i.student.lastName,
            grade: i.student.grade,
            idalu: i.student.idalu,
            photoUrl: i.student.photoUrl,
          },
          pedagogicalAgreementUrl: (i as any).pedagogicalAgreementUrl,
          isPedagogicalAgreementValidated: (i as any).isPedagogicalAgreementValidated ?? false,
          mobilityAuthorizationUrl: (i as any).mobilityAuthorizationUrl,
          isMobilityAuthorizationValidated: (i as any).isMobilityAuthorizationValidated ?? false,
          imageRightsUrl: (i as any).imageRightsUrl,
          isImageRightsValidated: (i as any).isImageRightsValidated ?? false,
          hasTeacherEvaluation: (i.evaluations?.length ?? 0) > 0,
          evaluations: i.evaluations,
          attendance: i.attendance
        })),
        sessions: a.sessions,
        checklist: a.checklist,
      }));
    } catch (error: any) {
      console.error("[assignmentService] Error in getByCenter:", {
        centerId,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      const errorMessage = error.response?.data?.error || "Error loading assignment";
      throw new Error(errorMessage);
    }
  },

  /**
   * Creates an assignment from a request.
   */
  createFromRequest: async (requestId: number): Promise<Assignment> => {
    const api = getApi();
    try {
      const response = await api.post<BackendAssignment>("/assignments", { requestId });
      const a = response.data;
      return {
        assignmentId: a.assignmentId,
        requestId: a.requestId,
        centerId: a.centerId,
        workshopId: a.workshopId,
        startDate: a.startDate,
        endDate: a.endDate,
        status: a.status,
        workshop: a.workshop ? { 
          title: a.workshop.title,
          modality: a.workshop.modality,
          maxPlaces: a.workshop.maxPlaces
        } : undefined,
        center: a.center ? { name: a.center.name } : undefined,
        checklist: a.checklist,
      };
    } catch (error) {
      console.error("Error in assignmentService.createFromRequest:", error);
      throw error;
    }
  },

  /**
   * Updates a checklist item.
   */
  updateChecklistItem: async (checklistId: number, isCompleted: boolean, evidenceUrl?: string): Promise<unknown> => {
    const api = getApi();
    try {
      const response = await api.patch<{ data: unknown }>(`/assignments/checklist/${checklistId}`, { isCompleted, evidenceUrl });
      return response.data;
    } catch (error) {
      console.error("Error in assignmentService.updateChecklistItem:", error);
      throw error;
    }
  },

  /**
   * Runs the Tetris algorithm for bulk assignment.
   */
  runTetris: async (): Promise<{ assignmentsCreated: number }> => {
    const api = getApi();
    try {
      const response = await api.post<{ assignmentsCreated: number }>("/assignments/tetris");
      return response.data;
    } catch (error) {
      console.error("Error in assignmentService.runTetris:", error);
      throw error;
    }
  },

  /**
   * Gets all assignments (Admin only).
   */
  getAll: async (): Promise<Assignment[]> => {
    const api = getApi();
    try {
      const response = await api.get<BackendAssignment[]>("/assignments");
      return response.data.map((a: BackendAssignment) => ({
        assignmentId: a.assignmentId,
        requestId: a.requestId,
        centerId: a.centerId,
        workshopId: a.workshopId,
        startDate: a.startDate,
        endDate: a.endDate,
        status: a.status,
        workshop: a.workshop ? { 
          title: a.workshop.title,
          modality: a.workshop.modality,
          maxPlaces: a.workshop.maxPlaces
        } : undefined,
        center: a.center ? { name: a.center.name } : undefined,
        request: a.request ? { studentsAprox: a.request.studentsAprox } : undefined,
        teacher1: a.teacher1 ? { userId: a.teacher1.userId, name: a.teacher1.name } : undefined,
        teacher2: a.teacher2 ? { userId: a.teacher2.userId, name: a.teacher2.name } : undefined,
        enrollments: a.enrollments?.map((i: BackendEnrollment) => ({
          enrollmentId: i.enrollmentId,
          assignmentId: i.assignmentId,
          studentId: i.studentId,
          student: {
            studentId: i.student.studentId,
            fullName: i.student.fullName,
            lastName: i.student.lastName,
            grade: i.student.grade,
            idalu: i.student.idalu,
          imageUrl: i.photoUrl,
          },
          pedagogicalAgreementUrl: (i as any).pedagogicalAgreementUrl,
          isPedagogicalAgreementValidated: (i as any).isPedagogicalAgreementValidated ?? false,
          mobilityAuthorizationUrl: (i as any).mobilityAuthorizationUrl,
          isMobilityAuthorizationValidated: (i as any).isMobilityAuthorizationValidated ?? false,
          imageRightsUrl: (i as any).imageRightsUrl,
          isImageRightsValidated: (i as any).isImageRightsValidated ?? false,
          hasTeacherEvaluation: (i.evaluations?.length ?? 0) > 0,
          evaluations: i.evaluations,
          attendance: i.attendance
        })),
        sessions: a.sessions,
        checklist: a.checklist,
      }));
    } catch (error) {
      console.error("Error in assignmentService.getAll:", error);
      throw error;
    }
  },

  /**
   * Gets a specific assignment by ID.
   */
  getById: async (assignmentId: number): Promise<Assignment> => {
    const api = getApi();
    try {
      const response = await api.get<BackendAssignment>(`/assignments/${assignmentId}`);
      const a = response.data;
      return {
        assignmentId: a.assignmentId,
        requestId: a.requestId,
        centerId: a.centerId,
        workshopId: a.workshopId,
        startDate: a.startDate,
        endDate: a.endDate,
        status: a.status,
        workshop: a.workshop ? { 
          title: a.workshop.title,
          modality: a.workshop.modality,
          maxPlaces: a.workshop.maxPlaces
        } : undefined,
        center: a.center ? { name: a.center.name } : undefined,
        request: a.request ? { studentsAprox: a.request.studentsAprox } : undefined,
        teacher1: a.teacher1 ? { userId: a.teacher1.userId, name: a.teacher1.name } : undefined,
        teacher2: a.teacher2 ? { userId: a.teacher2.userId, name: a.teacher2.name } : undefined,
        enrollments: a.enrollments?.map((i: BackendEnrollment) => ({
          enrollmentId: i.enrollmentId,
          assignmentId: i.assignmentId,
          studentId: i.studentId,
          student: {
            studentId: i.student.studentId,
            fullName: i.student.fullName,
            lastName: i.student.lastName,
            grade: i.student.grade,
            idalu: i.student.idalu,
          imageUrl: i.photoUrl,
          },
          pedagogicalAgreementUrl: (i as any).pedagogicalAgreementUrl,
          isPedagogicalAgreementValidated: (i as any).isPedagogicalAgreementValidated ?? false,
          mobilityAuthorizationUrl: (i as any).mobilityAuthorizationUrl,
          isMobilityAuthorizationValidated: (i as any).isMobilityAuthorizationValidated ?? false,
          imageRightsUrl: (i as any).imageRightsUrl,
          isImageRightsValidated: (i as any).isImageRightsValidated ?? false,
          hasTeacherEvaluation: (i.evaluations?.length ?? 0) > 0,
          evaluations: i.evaluations,
          attendance: i.attendance
        })),
        sessions: a.sessions,
        checklist: a.checklist,
      };
    } catch (error) {
      console.error("Error in assignmentService.getById:", error);
      throw error;
    }
  },

  /**
   * Updates enrollments for an assignment.
   */
  updateEnrollments: async (assignmentId: number, studentIds: number[]): Promise<Assignment> => {
    const api = getApi();
    try {
      await api.post(`/assignments/${assignmentId}/enrollments`, { studentIds });
      return assignmentService.getById(assignmentId);
    } catch (error) {
      console.error(error);
      const errorMessage = (error as { response?: { data?: { error?: string } } }).response?.data?.error || "Error loading assignments";
      throw new Error(errorMessage);
    }
  },

  /**
   * Confirms registration and generates sessions.
   */
  confirmRegistration: async (assignmentId: number): Promise<void> => {
    const api = getApi();
    try {
      await api.post(`/assignments/${assignmentId}/confirm-registration`);
    } catch (error) {
      console.error("Error in assignmentService.confirmRegistration:", error);
      throw error;
    }
  },

  /**
   * Sends an error notification for a document.
   */
  sendDocumentNotification: async (assignmentId: number, documentName: string, comment: string, greeting: string): Promise<unknown> => {
    const api = getApi();
    try {
      const response = await api.post<{ data: unknown }>(`/assignments/${assignmentId}/document-notification`, { documentName, comment, greeting });
      return response.data;
    } catch (error) {
      console.error("Error in assignmentService.sendDocumentNotification:", error);
      throw error;
    }
  },

  /**
   * Validates a specific document within an enrollment.
   */
  validateDocument: async (enrollmentId: number, field: string, valid: boolean): Promise<unknown> => {
    const api = getApi();
    try {
      const response = await api.patch<{ data: unknown }>(`/assignments/enrollments/${enrollmentId}/validate`, { field, valid });
      return response.data;
    } catch (error) {
      console.error("Error in assignmentService.validateDocument:", error);
      throw error;
    }
  }
};

export default assignmentService;
