import getApi from "./api";

export interface Phase {
  id_phase: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  active: boolean;
  order: number;
}

const phaseService = {
  getAll: async (): Promise<Phase[]> => {
    const api = getApi();
    try {
      const response = await api.get("/fases");
      // The API returns data in the 'data' field of the response body
      const rawData = response.data.data || [];
      return rawData.map((f: any) => ({
        id_phase: f.id_fase,
        name: f.nom,
        description: f.descripcio,
        startDate: f.data_inici,
        endDate: f.data_fi,
        active: f.activa,
        order: f.ordre
      }));
    } catch (error) {
      console.error("Error in phaseService.getAll:", error);
      throw error;
    }
  }
};

export default phaseService;
