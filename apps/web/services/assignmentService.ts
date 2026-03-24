import getApi from "./api";

export interface Enrollment {
  id_enrollment: number;
  id_assignment: number;
  id_student: number;
  student: {
    id_student: number;
    name: string;
    surnames: string;
    course: string;
    idalu: string;
    url_foto?: string | null;
  };
  url_pedagogical_agreement?: string | null;
  validated_pedagogical_agreement: boolean;
  url_mobility_authorization?: string | null;
  validated_mobility_authorization: boolean;
  url_image_rights?: string | null;
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
  checklist?: any[];
}

const assignmentService = {
  /**
   * Gets all assignments for a center.
   */
  getByCenter: async (idCenter: number): Promise<Assignment[]> => {
    const api = getApi();
    try {
      const response = await api.get<any[]>(`/assignments/centre/${idCenter}`);
      return response.data.map((a: any) => ({
        id_assignment: a.id_assignment,
        id_request: a.id_request,
        id_center: a.id_center,
        id_workshop: a.id_workshop,
        startDate: a.data_inici,
        endDate: a.data_fi,
        status: a.estat,
        workshop: a.taller ? { 
          title: a.taller.titol,
          modality: a.taller.modalitat,
          maxSeats: a.taller.places_maximes
        } : undefined,
        center: a.centre ? { name: a.centre.nom } : undefined,
        request: a.peticio ? { approxStudents: a.peticio.alumnes_aprox } : undefined,
        teacher1: a.prof1 ? { id_user: a.prof1.id_user, name: a.prof1.nom } : undefined,
        teacher2: a.prof2 ? { id_user: a.prof2.id_user, name: a.prof2.nom } : undefined,
        enrollments: a.enrollments?.map((i: any) => ({
          id_enrollment: i.id_enrollment,
          id_assignment: i.id_assignment,
          id_student: i.id_student,
          student: {
            id_student: i.student.id_student,
            name: i.student.nom,
            surnames: i.student.cognoms,
            course: i.student.curs,
            idalu: i.student.idalu,
            url_foto: i.student.url_foto,
          },
          url_pedagogical_agreement: i.docs_status?.acord_pedagogic,
          validated_pedagogical_agreement: i.docs_status?.validat_acord_pedagogic,
          url_mobility_authorization: i.docs_status?.autoritzacio_mobilitat,
          validated_mobility_authorization: i.docs_status?.validat_autoritzacio_mobilitat,
          url_image_rights: i.docs_status?.drets_imatge,
          validated_image_rights: i.docs_status?.validat_drets_imatge,
          teacher_evaluation: i.evaluations?.length > 0,
        })),
        checklist: a.checklist,
      }));
    } catch (error) {
      console.error("Error in assignmentService.getByCenter:", error);
      throw error;
    }
  },

  /**
   * Creates an assignment from a request.
   */
  createFromRequest: async (idRequest: number): Promise<Assignment> => {
    const api = getApi();
    try {
      const response = await api.post<any>("/assignments", { idRequest });
      const a = response.data;
      return {
        id_assignment: a.id_assignment,
        id_request: a.id_request,
        id_center: a.id_center,
        id_workshop: a.id_workshop,
        startDate: a.data_inici,
        endDate: a.data_fi,
        status: a.estat,
        workshop: a.taller ? { 
          title: a.taller.titol,
          modality: a.taller.modalitat,
          maxSeats: a.taller.places_maximes
        } : undefined,
        center: a.centre ? { name: a.centre.nom } : undefined,
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
  updateChecklistItem: async (idItem: number, completed: boolean, evidenceUrl?: string): Promise<any> => {
    const api = getApi();
    try {
      const response = await api.patch(`/assignments/checklist/${idItem}`, { completat: completed, url_evidencia: evidenceUrl });
      return response.data;
    } catch (error) {
      console.error("Error in assignmentService.updateChecklistItem:", error);
      throw error;
    }
  },

  /**
   * Runs the Tetris algorithm for bulk assignment.
   */
  runTetris: async (): Promise<any> => {
    const api = getApi();
    try {
      const response = await api.post("/assignments/tetris");
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
      const response = await api.get<any[]>("/assignments");
      return response.data.map((a: any) => ({
        id_assignment: a.id_assignment,
        id_request: a.id_request,
        id_center: a.id_center,
        id_workshop: a.id_workshop,
        startDate: a.data_inici,
        endDate: a.data_fi,
        status: a.estat,
        workshop: a.taller ? { 
          title: a.taller.titol,
          modality: a.taller.modalitat,
          maxSeats: a.taller.places_maximes
        } : undefined,
        center: a.centre ? { name: a.centre.nom } : undefined,
        request: a.peticio ? { approxStudents: a.peticio.alumnes_aprox } : undefined,
        teacher1: a.prof1 ? { id_user: a.prof1.id_user, name: a.prof1.nom } : undefined,
        teacher2: a.prof2 ? { id_user: a.prof2.id_user, name: a.prof2.nom } : undefined,
        enrollments: a.enrollments?.map((i: any) => ({
          id_enrollment: i.id_enrollment,
          id_assignment: i.id_assignment,
          id_student: i.id_student,
          student: {
            id_student: i.student.id_student,
            name: i.student.nom,
            surnames: i.student.cognoms,
            course: i.student.curs,
            idalu: i.student.idalu,
            url_foto: i.student.url_foto,
          },
          url_pedagogical_agreement: i.docs_status?.acord_pedagogic,
          validated_pedagogical_agreement: i.docs_status?.validat_acord_pedagogic,
          url_mobility_authorization: i.docs_status?.autoritzacio_mobilitat,
          validated_mobility_authorization: i.docs_status?.validat_autoritzacio_mobilitat,
          url_image_rights: i.docs_status?.drets_imatge,
          validated_image_rights: i.docs_status?.validat_drets_imatge,
          teacher_evaluation: i.evaluations?.length > 0,
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
      const response = await api.get<any>(`/assignments/${id}`);
      const a = response.data;
      return {
        id_assignment: a.id_assignment,
        id_request: a.id_request,
        id_center: a.id_center,
        id_workshop: a.id_workshop,
        startDate: a.data_inici,
        endDate: a.data_fi,
        status: a.estat,
        workshop: a.taller ? { 
          title: a.taller.titol,
          modality: a.taller.modalitat,
          maxSeats: a.taller.places_maximes
        } : undefined,
        center: a.centre ? { name: a.centre.nom } : undefined,
        request: a.peticio ? { approxStudents: a.peticio.alumnes_aprox } : undefined,
        teacher1: a.prof1 ? { id_user: a.prof1.id_user, name: a.prof1.nom } : undefined,
        teacher2: a.prof2 ? { id_user: a.prof2.id_user, name: a.prof2.nom } : undefined,
        enrollments: a.enrollments?.map((i: any) => ({
          id_enrollment: i.id_enrollment,
          id_assignment: i.id_assignment,
          id_student: i.id_student,
          student: {
            id_student: i.student.id_student,
            name: i.student.nom,
            surnames: i.student.cognoms,
            course: i.student.curs,
            idalu: i.student.idalu,
            url_foto: i.student.url_foto,
          },
          url_pedagogical_agreement: i.docs_status?.acord_pedagogic,
          validated_pedagogical_agreement: i.docs_status?.validat_acord_pedagogic,
          url_mobility_authorization: i.docs_status?.autoritzacio_mobilitat,
          validated_mobility_authorization: i.docs_status?.validat_autoritzacio_mobilitat,
          url_image_rights: i.docs_status?.drets_imatge,
          validated_image_rights: i.validat_drets_imatge,
          teacher_evaluation: i.evaluations?.length > 0,
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
      console.error("Error in assignmentService.updateEnrollments:", error);
      throw error;
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
  sendDocumentNotification: async (idAssignment: number, documentName: string, comment: string, greeting: string): Promise<any> => {
    const api = getApi();
    try {
      const response = await api.post(`/assignments/${idAssignment}/document-notification`, { documentName, comment, greeting });
      return response.data;
    } catch (error) {
      console.error("Error in assignmentService.sendDocumentNotification:", error);
      throw error;
    }
  },

  /**
   * Validates a specific document within an enrollment.
   */
  validateDocument: async (idEnrollment: number, field: string, valid: boolean): Promise<any> => {
    const api = getApi();
    try {
      const response = await api.patch(`/assignments/inscripcions/${idEnrollment}/validate`, { field, valid });
      return response.data;
    } catch (error) {
      console.error("Error in assignmentService.validateDocument:", error);
      throw error;
    }
  }
};

export default assignmentService;
