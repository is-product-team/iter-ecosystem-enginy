import getApi from "./api";

export interface Request {
  requestId: number;
  centerId: number;
  workshopId: number;
  studentsAprox: number | null;
  comments: string | null;
  createdAt: string;
  status: string;
  modality?: string;
  teacher1Id?: number;
  teacher2Id?: number;
  studentIds?: number[];
  workshop?: {
    title: string;
    sector: string;
    modality: string;
  };
  center?: {
    name: string;
  };
  teacher1?: { name: string };
  teacher2?: { name: string };
  assignment?: {
    teachers: { fullName: string }[];
  };
}

interface BackendRequest {
  requestId: number;
  centerId: number;
  workshopId: number;
  studentsAprox: number | null;
  comments: string | null;
  createdAt: string;
  status: string;
  modality: string;
  prof1Id?: number;
  prof2Id?: number;
  studentIds?: number[];
  workshop?: {
    title: string;
    sector?: { name: string };
    modality: string;
  };
  center?: {
    name: string;
  };
  teacher1?: { name: string };
  teacher2?: { name: string };
  assignment?: {
    teachers: {
      user: { fullName: string };
    }[];
  };
}

const requestService = {
  /**
   * Gets all requests.
   */
  getAll: async (): Promise<Request[]> => {
    const api = getApi();
    try {
      const response = await api.get<{ data: BackendRequest[], meta: unknown }>("/requests?limit=0");
      return response.data.data.map((r: BackendRequest) => ({
        requestId: r.requestId,
        centerId: r.centerId,
        workshopId: r.workshopId,
        studentsAprox: r.studentsAprox,
        comments: r.comments,
        createdAt: r.createdAt,
        status: r.status,
        modality: r.modality,
        teacher1Id: r.prof1Id,
        teacher2Id: r.prof2Id,
        studentIds: r.studentIds,
        workshop: r.workshop ? {
          title: r.workshop.title,
          sector: r.workshop.sector?.name || "General",
          modality: r.workshop.modality,
        } : undefined,
        center: r.center ? {
          name: r.center.name,
        } : undefined,
        teacher1: r.teacher1 ? { name: r.teacher1.name } : undefined,
        teacher2: r.teacher2 ? { name: r.teacher2.name } : undefined,
        assignment: r.assignment ? {
          teachers: r.assignment.teachers.map(t => ({ fullName: t.user.fullName }))
        } : undefined,
      }));
    } catch (error) {
      console.error("Error in requestService.getAll:", error);
      throw error;
    }
  },

  /**
   * Creates a new request.
   */
  create: async (data: {
    workshopId: number;
    studentsAprox: number;
    comments?: string;
    teacher1Id?: number;
    teacher2Id?: number;
    modality?: string;
  }): Promise<Request> => {
    const api = getApi();
    try {
      const payload = {
        workshopId: data.workshopId,
        studentsAprox: data.studentsAprox,
        comments: data.comments,
        prof1Id: data.teacher1Id,
        prof2Id: data.teacher2Id,
        modality: data.modality,
      };
      const response = await api.post<BackendRequest>("/requests", payload);
      const r = response.data;
      return {
        requestId: r.requestId,
        centerId: r.centerId,
        workshopId: r.workshopId,
        studentsAprox: r.studentsAprox,
        comments: r.comments,
        createdAt: r.createdAt,
        status: r.status,
        modality: r.modality,
        teacher1Id: r.prof1Id,
        teacher2Id: r.prof2Id,
        studentIds: r.studentIds,
      };
    } catch (error) {
      console.error("Error in requestService.create:", error);
      const errorMessage = (error as { response?: { data?: { error?: string } } }).response?.data?.error || "Failed to create request";
      throw new Error(errorMessage);
    }
  },

  /**
   * Updates an existing request.
   */
  update: async (requestId: number, data: {
    studentsAprox?: number;
    comments?: string;
    teacher1Id?: number;
    teacher2Id?: number;
  }): Promise<Request> => {
    const api = getApi();
    try {
      const payload = {
        studentsAprox: data.studentsAprox,
        comments: data.comments,
        prof1Id: data.teacher1Id,
        prof2Id: data.teacher2Id,
      };
      const response = await api.put<BackendRequest>(`/requests/${requestId}`, payload);
      const r = response.data;
      return {
        requestId: r.requestId,
        centerId: r.centerId,
        workshopId: r.workshopId,
        studentsAprox: r.studentsAprox,
        comments: r.comments,
        createdAt: r.createdAt,
        status: r.status,
        modality: r.modality,
        teacher1Id: r.prof1Id,
        teacher2Id: r.prof2Id,
        studentIds: r.studentIds,
      };
    } catch (error) {
      console.error("Error in requestService.update:", error);
      const errorMessage = (error as { response?: { data?: { error?: string } } }).response?.data?.error || "Could not update the request";
      throw new Error(errorMessage);
    }
  },

  /**
   * Updates the status of a request.
   */
  updateStatus: async (requestId: number, status: string): Promise<Request> => {
    const api = getApi();
    try {
      const response = await api.patch<BackendRequest>(`/requests/${requestId}/status`, { status });
      const r = response.data;
      return {
        requestId: r.requestId,
        centerId: r.centerId,
        workshopId: r.workshopId,
        studentsAprox: r.studentsAprox,
        comments: r.comments,
        createdAt: r.createdAt,
        status: r.status,
        modality: r.modality,
        teacher1Id: r.prof1Id,
        teacher2Id: r.prof2Id,
        studentIds: r.studentIds,
      };
    } catch (error) {
      console.error("Error in requestService.updateStatus:", error);
      throw error;
    }
  }
};

export default requestService;
