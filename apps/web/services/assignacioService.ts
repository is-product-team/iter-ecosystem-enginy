import getApi from "./api";

export interface Assignacio {
  id_assignacio: number;
  id_peticio: number | null;
  id_centre: number;
  id_taller: number;
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
  getByCentre: async (idCentre: number): Promise<Assignacio[]> => {
    const api = getApi();
    try {
      const response = await api.get<Assignacio[]>(`/assignments/centre/${idCentre}`);
      return response.data;
    } catch (error) {
      console.error("Error en assignacioService.getByCentre:", error);
      throw error;
    }
  },

  /**
   * Crea una asignación a partir de una petición.
   */
  createFromPeticio: async (idPeticio: number): Promise<Assignacio> => {
    const api = getApi();
    try {
      const response = await api.post<Assignacio>("/assignments", { idPeticio });
      return response.data;
    } catch (error) {
      console.error("Error en assignacioService.createFromPeticio:", error);
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
  getAll: async (): Promise<Assignacio[]> => {
    const api = getApi();
    try {
      const response = await api.get<Assignacio[]>("/assignments");
      return response.data;
    } catch (error) {
      console.error("Error en assignacioService.getAll:", error);
      throw error;
    }
  },

  /**
   * Envía una notificación de error en un documento.
   */
  sendDocumentNotification: async (idAssignacio: number, documentName: string, comment: string, greeting: string): Promise<any> => {
    const api = getApi();
    try {
      const response = await api.post(`/assignments/${idAssignacio}/document-notification`, { documentName, comment, greeting });
      return response.data;
    } catch (error) {
      console.error("Error en assignacioService.sendDocumentNotification:", error);
      throw error;
    }
  },

  /**
   * Valida un documento específico de una inscripción.
   */
  validateDocument: async (idInscripcio: number, field: string, valid: boolean): Promise<any> => {
    const api = getApi();
    try {
      const response = await api.patch(`/assignments/inscripcions/${idInscripcio}/validate`, { field, valid });
      return response.data;
    } catch (error) {
      console.error("Error en assignacioService.validateDocument:", error);
      throw error;
    }
  }
};

export default assignacioService;
