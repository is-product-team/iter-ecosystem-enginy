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
      const response = await api.get("/phases");
      // The API returns data in the 'data' field of the response body
      const rawData = response.data.data || [];
      return rawData.map((f: any) => ({
        id_phase: f.id_phase,
        name: f.name,
        description: f.description,
        startDate: f.startDate,
        endDate: f.endDate,
        active: f.isActive,
        order: f.order
      }));
    } catch (error) {
      console.error("Error in phaseService.getAll:", error);
      throw error;
    }
  }
};

export default phaseService;
