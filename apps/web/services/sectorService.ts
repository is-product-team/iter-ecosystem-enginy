import getApi from "./api";

export interface Sector {
  sectorId: number;
  name: string;
}

const sectorService = {
  /**
   * Gets all sectors from the backend.
   */
  getAll: async (): Promise<Sector[]> => {
    const api = getApi();
    try {
      const response = await api.get<Sector[]>("/sectors");
      return response.data;
    } catch (error) {
      console.error("Error in sectorService.getAll:", error);
      throw error;
    }
  },
};

export default sectorService;
