import getApi from "./api";

export interface Assignment {
  id_assignment: number;
  id_request: number | null;
  id_center: number;
  id_workshop: number;
  data_inici: string | null;
  data_fi: string | null;
  estat: string;
  taller?: { titol: string };
  centre?: { nom: string };
  checklist?: any[];
}

const assignacioService = {
  /**
   * Obtiene las asignaciones de un centro.
   */
  getByCenter: async (idCenter: number): Promise<Assignment[]> => {
    const api = getApi();
    try {
      const response = await api.get<Assignment[]>(`/assignments/centre/${idCenter}`);
      return response.data;
    } catch (error) {
      console.error("Error en assignacioService.getByCenter:", error);
      throw error;
    }
  },

  /**
   * Crea una asignación a partir de una petición.
   */
  createFromRequest: async (idRequest: number): Promise<Assignment> => {
    const api = getApi();
    try {
      const response = await api.post<Assignment>("/assignments", { idRequest });
      return response.data;
    } catch (error) {
      console.error("Error en assignacioService.createFromRequest:", error);
      throw error;
    }
  },

  /**
   * Actualiza un ítem del checklist.
   */
  updateChecklistItem: async (idItem: number, completat: boolean, url_evidencia?: string): Promise<any> => {
    const api = getApi();
    try {
      const response = await api.patch(`/assignments/checklist/${idItem}`, { completat, url_evidencia });
      return response.data;
    } catch (error) {
      console.error("Error en assignacioService.updateChecklistItem:", error);
      throw error;
    }
  },

  /**
   * Ejecuta el algoritmo Tetris de asignación masiva.
   */
  runTetris: async (): Promise<any> => {
    const api = getApi();
    try {
      const response = await api.post("/assignments/tetris");
      return response.data;
    } catch (error) {
      console.error("Error en assignacioService.runTetris:", error);
      throw error;
    }
  },

  /**
   * Obtiene todas las asignaciones (Admin solo).
   */
  getAll: async (): Promise<Assignment[]> => {
    const api = getApi();
    try {
      const response = await api.get<Assignment[]>("/assignments");
      return response.data;
    } catch (error) {
      console.error("Error en assignacioService.getAll:", error);
      throw error;
    }
  },

  /**
   * Envía una notificación de error en un documento.
   */
  sendDocumentNotification: async (idAssignment: number, documentName: string, comment: string, greeting: string): Promise<any> => {
    const api = getApi();
    try {
      const response = await api.post(`/assignments/${idAssignment}/document-notification`, { documentName, comment, greeting });
      return response.data;
    } catch (error) {
      console.error("Error en assignacioService.sendDocumentNotification:", error);
      throw error;
    }
  },

  /**
   * Valida un documento específico de una inscripción.
   */
  validateDocument: async (idEnrollment: number, field: string, valid: boolean): Promise<any> => {
    const api = getApi();
    try {
      const response = await api.patch(`/assignments/inscripcions/${idEnrollment}/validate`, { field, valid });
      return response.data;
    } catch (error) {
      console.error("Error en assignacioService.validateDocument:", error);
      throw error;
    }
  }
};

export default assignacioService;
