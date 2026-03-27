import getApi from "./api";

export interface Workshop {
  _id: string;
  title: string;
  sector: string;
  id_sector?: number;
  modality: string;
  term: string;
  icon?: string;
  technicalDetails?: {
    description: string;
    durationHours: number;
    maxPlaces: number;
    defaultLocation: string;
  };
  assignedReferents?: string[];
  executionDays: { dayOfWeek: number; startTime: string; endTime: string }[];
  image?: string;
}

interface BackendWorkshop {
  id_workshop: number;
  title: string;
  modality: string;
  icon?: string;
  description?: string;
  durationHours?: number;
  maxPlaces?: number;
  executionDays?: { dayOfWeek: number; startTime: string; endTime: string }[];
  sector?: { name: string };
  id_sector?: number;
}

const workshopService = {
  /**
   * Gets all workshops from the backend.
   */
  getAll: async (): Promise<Workshop[]> => {
    const api = getApi();
    try {
      const response = await api.get<{ data: BackendWorkshop[], meta: unknown }>("/workshops?limit=0");
      const workshopsData = response.data.data;

      return workshopsData.map((t: BackendWorkshop) => ({
        _id: t.id_workshop.toString(),
        title: t.title,
        sector: t.sector?.name || "General",
        id_sector: t.id_sector,
        modality: t.modality,
        term: "1st",
        icon: t.icon || "🧩",
        technicalDetails: {
          description: t.description || "",
          durationHours: t.durationHours || 0,
          maxPlaces: t.maxPlaces || 0,
          defaultLocation: "Ca n'Olivella",
        },
        assignedReferents: [],
        executionDays: t.executionDays || [],
        image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=800&auto=format&fit=crop",
      }));
    } catch (error) {
      console.error("Error in workshopService.getAll:", error);
      throw error;
    }
  },

  create: async (workshopData: Omit<Workshop, '_id'>): Promise<Workshop> => {
    const api = getApi();
    try {
      const payload = {
        title: workshopData.title,
        description: workshopData.technicalDetails?.description,
        durationHours: workshopData.technicalDetails?.durationHours,
        maxPlaces: workshopData.technicalDetails?.maxPlaces,
        modality: workshopData.modality,
        icon: workshopData.icon,
        id_sector: workshopData.id_sector || 1,
        executionDays: workshopData.executionDays,
      };

      const response = await api.post("/workshops", payload);
      const t = response.data;

      return {
        _id: t.id_workshop.toString(),
        title: t.title,
        sector: t.sector?.name || "General",
        id_sector: t.id_sector,
        modality: t.modality,
        icon: t.icon || "🧩",
        term: "1st",
        technicalDetails: {
          description: t.description || "",
          durationHours: t.durationHours || 0,
          maxPlaces: t.maxPlaces || 0,
          defaultLocation: "Ca n'Olivella",
        },
        assignedReferents: [],
        executionDays: t.executionDays || [],
      };
    } catch (error) {
      console.error("Error in workshopService.create:", error);
      const errorMessage = (error as { response?: { data?: { error?: string } } }).response?.data?.error || "Could not create workshop";
      throw new Error(errorMessage);
    }
  },

  update: async (id: string, workshopData: Partial<Workshop>): Promise<Workshop> => {
    const api = getApi();
    try {
      const payload: Record<string, unknown> = {};
      if (workshopData.title) payload.title = workshopData.title;
      if (workshopData.modality) payload.modality = workshopData.modality;
      if (workshopData.id_sector) payload.id_sector = workshopData.id_sector;
      if (workshopData.icon) payload.icon = workshopData.icon;
      if (workshopData.executionDays) payload.executionDays = workshopData.executionDays;
      if (workshopData.technicalDetails) {
        if (workshopData.technicalDetails.description) payload.description = workshopData.technicalDetails.description;
        if (workshopData.technicalDetails.durationHours) payload.durationHours = workshopData.technicalDetails.durationHours;
        if (workshopData.technicalDetails.maxPlaces) payload.maxPlaces = workshopData.technicalDetails.maxPlaces;
      }

      const response = await api.put(`/workshops/${id}`, payload);
      const t = response.data;

      return {
        _id: t.id_workshop.toString(),
        title: t.title,
        sector: t.sector?.name || "General",
        id_sector: t.id_sector,
        modality: t.modality,
        term: "1st",
        icon: t.icon || "🧩",
        technicalDetails: {
          description: t.description || "",
          durationHours: t.durationHours || 0,
          maxPlaces: t.maxPlaces || 0,
          defaultLocation: "Ca n'Olivella",
        },
        assignedReferents: [],
        executionDays: t.executionDays || [],
      };
    } catch (error) {
      console.error("Error in workshopService.update:", error);
      const errorMessage = (error as { response?: { data?: { error?: string } } }).response?.data?.error || "Could not update workshop";
      throw new Error(errorMessage);
    }
  },

  /**
   * Deletes an existing workshop.
   */
  delete: async (id: string): Promise<void> => {
    const api = getApi();
    try {
      await api.delete(`/workshops/${id}`);
    } catch (error) {
      console.error("Error in workshopService.getAll:", error);
      const errorMessage = (error as { response?: { data?: { error?: string } } }).response?.data?.error || "Could not fetch workshops";
      throw new Error(errorMessage);
    }
  },
};

export default workshopService;