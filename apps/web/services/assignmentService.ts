import getApi from "./api";

export interface Enrollment {
  id_enrollment: number;
  id_assignment: number;
  id_student: number;
  student: {
    id_student: number;
    fullName: string;
    lastName: string;
    grade: string;
    idalu: string;
    photoUrl?: string | null;
  };
  pedagogicalAgreementUrl?: string | null;
  validated_pedagogical_agreement: boolean;
  mobilityAuthorizationUrl?: string | null;
  validated_mobility_authorization: boolean;
  imageRightsUrl?: string | null;
  validated_image_rights: boolean;
  teacher_evaluation?: boolean;
}

export interface Assignment {
  id_assignment: number;
  id_request: number | null;
  id_center: number;
  id_workshop: number;
  startDate: string | null;
  endDate: string | null;
  status: string;
  workshop?: { title: string; modality: string; maxSeats: number };
  center?: { name: string };
  request?: { approxStudents: number };
  teacher1?: { id_user: number; name: string };
  teacher2?: { id_user: number; name: string };
  enrollments?: Enrollment[];
  checklist?: unknown[];
}

interface BackendStudent {
  id_student: number;
  fullName: string;
  lastName: string;
  grade: string;
  idalu: string;
  photoUrl?: string | null;
}

interface BackendEnrollment {
  id_enrollment: number;
  id_assignment: number;
  id_student: number;
  student: BackendStudent;
  docs_status?: {
    acord_pedagogic?: string;
    validat_acord_pedagogic?: boolean;
    autoritzacio_mobilitat?: string;
    validat_autoritzacio_mobilitat?: boolean;
    drets_imatge?: string;
    validat_drets_imatge?: boolean;
  };
  evaluations?: unknown[];
}

interface BackendAssignment {
  id_assignment: number;
  id_request: number | null;
  id_center: number;
  id_workshop: number;
  startDate: string | null;
  endDate: string | null;
  status: string;
  workshop?: { title: string; modality: string; maxPlaces: number };
  center?: { name: string };
  request?: { approxStudents: number };
  teacher1?: { id_user: number; name: string };
  teacher2?: { id_user: number; name: string };
  enrollments?: BackendEnrollment[];
  checklist?: unknown[];
}

const assignmentService = {
  /**
   * Gets all assignments for a center.
   */
  getByCenter: async (idCenter: number): Promise<Assignment[]> => {
    const api = getApi();
    try {
      const response = await api.get<BackendAssignment[]>(`/assignments/centre/${idCenter}`);
      return response.data.map((a: BackendAssignment) => ({
        id_assignment: a.id_assignment,
        id_request: a.id_request,
        id_center: a.id_center,
        id_workshop: a.id_workshop,
        startDate: a.startDate,
        endDate: a.endDate,
        status: a.status,
        workshop: a.workshop ? { 
          title: a.workshop.title,
          modality: a.workshop.modality,
          maxSeats: a.workshop.maxPlaces
        } : undefined,
        center: a.center ? { name: a.center.name } : undefined,
        request: a.request ? { approxStudents: a.request.approxStudents } : undefined,
        teacher1: a.teacher1 ? { id_user: a.teacher1.id_user, name: a.teacher1.name } : undefined,
        teacher2: a.teacher2 ? { id_user: a.teacher2.id_user, name: a.teacher2.name } : undefined,
        enrollments: a.enrollments?.map((i: BackendEnrollment) => ({
          id_enrollment: i.id_enrollment,
          id_assignment: i.id_assignment,
          id_student: i.id_student,
          student: {
            id_student: i.student.id_student,
            fullName: i.student.fullName,
            lastName: i.student.lastName,
            grade: i.student.grade,
            idalu: i.student.idalu,
            photoUrl: i.student.photoUrl,
          },
          pedagogicalAgreementUrl: i.docs_status?.acord_pedagogic,
          validated_pedagogical_agreement: i.docs_status?.validat_acord_pedagogic ?? false,
          mobilityAuthorizationUrl: i.docs_status?.autoritzacio_mobilitat,
          validated_mobility_authorization: i.docs_status?.validat_autoritzacio_mobilitat ?? false,
          imageRightsUrl: i.docs_status?.drets_imatge,
          validated_image_rights: i.docs_status?.validat_drets_imatge ?? false,
          teacher_evaluation: (i.evaluations?.length ?? 0) > 0,
        })),
        checklist: a.checklist,
      }));
    } catch (error) {
      console.error(error);
      const errorMessage = (error as { response?: { data?: { error?: string } } }).response?.data?.error || "Error al carregar l'assignació";
      throw new Error(errorMessage);
    }
  },

  /**
   * Creates an assignment from a request.
   */
  createFromRequest: async (idRequest: number): Promise<Assignment> => {
    const api = getApi();
    try {
      const response = await api.post<BackendAssignment>("/assignments", { idRequest });
      const a = response.data;
      return {
        id_assignment: a.id_assignment,
        id_request: a.id_request,
        id_center: a.id_center,
        id_workshop: a.id_workshop,
        startDate: a.startDate,
        endDate: a.endDate,
        status: a.status,
        workshop: a.workshop ? { 
          title: a.workshop.title,
          modality: a.workshop.modality,
          maxSeats: a.workshop.maxPlaces
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
  updateChecklistItem: async (idItem: number, completed: boolean, evidenceUrl?: string): Promise<unknown> => {
    const api = getApi();
    try {
      const response = await api.patch<{ data: unknown }>(`/assignments/checklist/${idItem}`, { completat: completed, url_evidencia: evidenceUrl });
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
        id_assignment: a.id_assignment,
        id_request: a.id_request,
        id_center: a.id_center,
        id_workshop: a.id_workshop,
        startDate: a.startDate,
        endDate: a.endDate,
        status: a.status,
        workshop: a.workshop ? { 
          title: a.workshop.title,
          modality: a.workshop.modality,
          maxSeats: a.workshop.maxPlaces
        } : undefined,
        center: a.center ? { name: a.center.name } : undefined,
        request: a.request ? { approxStudents: a.request.approxStudents } : undefined,
        teacher1: a.teacher1 ? { id_user: a.teacher1.id_user, name: a.teacher1.name } : undefined,
        teacher2: a.teacher2 ? { id_user: a.teacher2.id_user, name: a.teacher2.name } : undefined,
        enrollments: a.enrollments?.map((i: BackendEnrollment) => ({
          id_enrollment: i.id_enrollment,
          id_assignment: i.id_assignment,
          id_student: i.id_student,
          student: {
            id_student: i.student.id_student,
            fullName: i.student.fullName,
            lastName: i.student.lastName,
            grade: i.student.grade,
            idalu: i.student.idalu,
            photoUrl: i.student.photoUrl,
          },
          pedagogicalAgreementUrl: i.docs_status?.acord_pedagogic,
          validated_pedagogical_agreement: i.docs_status?.validat_acord_pedagogic ?? false,
          mobilityAuthorizationUrl: i.docs_status?.autoritzacio_mobilitat,
          validated_mobility_authorization: i.docs_status?.validat_autoritzacio_mobilitat ?? false,
          imageRightsUrl: i.docs_status?.drets_imatge,
          validated_image_rights: i.docs_status?.validat_drets_imatge ?? false,
          teacher_evaluation: (i.evaluations?.length ?? 0) > 0,
        })),
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
  getById: async (id: number): Promise<Assignment> => {
    const api = getApi();
    try {
      const response = await api.get<BackendAssignment>(`/assignments/${id}`);
      const a = response.data;
      return {
        id_assignment: a.id_assignment,
        id_request: a.id_request,
        id_center: a.id_center,
        id_workshop: a.id_workshop,
        startDate: a.startDate,
        endDate: a.endDate,
        status: a.status,
        workshop: a.workshop ? { 
          title: a.workshop.title,
          modality: a.workshop.modality,
          maxSeats: a.workshop.maxPlaces
        } : undefined,
        center: a.center ? { name: a.center.name } : undefined,
        request: a.request ? { approxStudents: a.request.approxStudents } : undefined,
        teacher1: a.teacher1 ? { id_user: a.teacher1.id_user, name: a.teacher1.name } : undefined,
        teacher2: a.teacher2 ? { id_user: a.teacher2.id_user, name: a.teacher2.name } : undefined,
        enrollments: a.enrollments?.map((i: BackendEnrollment) => ({
          id_enrollment: i.id_enrollment,
          id_assignment: i.id_assignment,
          id_student: i.id_student,
          student: {
            id_student: i.student.id_student,
            fullName: i.student.fullName,
            lastName: i.student.lastName,
            grade: i.student.grade,
            idalu: i.student.idalu,
            photoUrl: i.student.photoUrl,
          },
          pedagogicalAgreementUrl: i.docs_status?.acord_pedagogic,
          validated_pedagogical_agreement: i.docs_status?.validat_acord_pedagogic ?? false,
          mobilityAuthorizationUrl: i.docs_status?.autoritzacio_mobilitat,
          validated_mobility_authorization: i.docs_status?.validat_autoritzacio_mobilitat ?? false,
          imageRightsUrl: i.docs_status?.drets_imatge,
          validated_image_rights: i.docs_status?.validat_drets_imatge ?? false,
          teacher_evaluation: (i.evaluations?.length ?? 0) > 0,
        })),
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
  updateEnrollments: async (id: number, studentIds: number[]): Promise<Assignment> => {
    const api = getApi();
    try {
      await api.post(`/assignments/${id}/inscripcions`, { ids_alumnes: studentIds });
      return assignmentService.getById(id);
    } catch (error) {
      console.error(error);
      const errorMessage = (error as { response?: { data?: { error?: string } } }).response?.data?.error || "Error al carregar les assignacions";
      throw new Error(errorMessage);
    }
  },

  /**
   * Confirms registration and generates sessions.
   */
  confirmRegistration: async (id: number): Promise<void> => {
    const api = getApi();
    try {
      await api.post(`/assignments/${id}/confirm-registration`);
    } catch (error) {
      console.error("Error in assignmentService.confirmRegistration:", error);
      throw error;
    }
  },

  /**
   * Sends an error notification for a document.
   */
  sendDocumentNotification: async (idAssignment: number, documentName: string, comment: string, greeting: string): Promise<unknown> => {
    const api = getApi();
    try {
      const response = await api.post<{ data: unknown }>(`/assignments/${idAssignment}/document-notification`, { documentName, comment, greeting });
      return response.data;
    } catch (error) {
      console.error("Error in assignmentService.sendDocumentNotification:", error);
      throw error;
    }
  },

  /**
   * Validates a specific document within an enrollment.
   */
  validateDocument: async (idEnrollment: number, field: string, valid: boolean): Promise<unknown> => {
    const api = getApi();
    try {
      const response = await api.patch<{ data: unknown }>(`/assignments/inscripcions/${idEnrollment}/validate`, { field, valid });
      return response.data;
    } catch (error) {
      console.error("Error in assignmentService.validateDocument:", error);
      throw error;
    }
  }
};

export default assignmentService;
