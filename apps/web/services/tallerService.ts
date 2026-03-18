import getApi from "./api";

export interface Taller {
  _id: string;
  titol: string;
  sector: string;
  id_sector?: number;
  modalitat: string;
  trimestre: string;
  icona?: string;
  detalls_tecnics?: {
    descripcio: string;
    durada_hores: number;
    places_maximes: number;
    ubicacio_defecte: string;
  };
  referents_assignats?: string[];
  dies_execucio: { dayOfWeek: number; startTime: string; endTime: string }[];
}

const tallerService = {
  /**
   * Obtiene todos los talleres desde el backend.
   */
  getAll: async (): Promise<Taller[]> => {
    const api = getApi();
    try {
      const response = await api.get<{ data: any[], meta: any }>("/workshops?limit=0");
      const tallersData = response.data.data;

      return tallersData.map((t: any) => ({
        _id: t.id_workshop.toString(),
        titol: t.titol,
        sector: t.sector?.nom || "General",
        id_sector: t.id_sector,
        modalitat: t.modalitat,
        trimestre: "1r",
        icona: t.icona || "🧩",
        detalls_tecnics: {
          descripcio: t.descripcio || "",
          durada_hores: t.durada_h || 0,
          places_maximes: t.places_maximes || 0,
          ubicacio_defecte: "Ca n'Olivella",
        },
        referents_assignats: [],
        dies_execucio: t.dies_execucio || [],
      }));
    } catch (error) {
      console.error("Error en tallerService.getAll:", error);
      throw error;
    }
  },

  create: async (tallerData: Omit<Taller, '_id'>): Promise<Taller> => {
    const api = getApi();
    try {
      const payload = {
        titol: tallerData.titol,
        descripcio: tallerData.detalls_tecnics?.descripcio,
        durada_h: tallerData.detalls_tecnics?.durada_hores,
        places_maximes: tallerData.detalls_tecnics?.places_maximes,
        modalitat: tallerData.modalitat,
        icona: tallerData.icona,
        id_sector: tallerData.id_sector || 1,
        dies_execucio: tallerData.dies_execucio,
      };

      const response = await api.post("/workshops", payload);
      const t = response.data;

      return {
        _id: t.id_workshop.toString(),
        titol: t.titol,
        sector: t.sector?.nom || "General",
        id_sector: t.id_sector,
        modalitat: t.modalitat,
        icona: t.icona || "🧩",
        trimestre: "1r",
        detalls_tecnics: {
          descripcio: t.descripcio || "",
          durada_hores: t.durada_h || 0,
          places_maximes: t.places_maximes || 0,
          ubicacio_defecte: "Ca n'Olivella",
        },
        referents_assignats: [],
        dies_execucio: t.dies_execucio || [],
      };
    } catch (error: any) {
      console.error("Error en tallerService.create:", error);
      const errorMessage = error.response?.data?.message || "No se pudo crear el taller";
      throw new Error(errorMessage);
    }
  },

  update: async (id: string, tallerData: Partial<Taller>): Promise<Taller> => {
    const api = getApi();
    try {
      const payload: any = {};
      if (tallerData.titol) payload.titol = tallerData.titol;
      if (tallerData.modalitat) payload.modalitat = tallerData.modalitat;
      if (tallerData.id_sector) payload.id_sector = tallerData.id_sector;
      if (tallerData.icona) payload.icona = tallerData.icona;
      if (tallerData.dies_execucio) payload.dies_execucio = tallerData.dies_execucio;
      if (tallerData.detalls_tecnics) {
        if (tallerData.detalls_tecnics.descripcio) payload.descripcio = tallerData.detalls_tecnics.descripcio;
        if (tallerData.detalls_tecnics.durada_hores) payload.durada_h = tallerData.detalls_tecnics.durada_hores;
        if (tallerData.detalls_tecnics.places_maximes) payload.places_maximes = tallerData.detalls_tecnics.places_maximes;
      }

      const response = await api.put(`/workshops/${id}`, payload);
      const t = response.data;

      return {
        _id: t.id_workshop.toString(),
        titol: t.titol,
        sector: t.sector?.nom || "General",
        id_sector: t.id_sector,
        modalitat: t.modalitat,
        trimestre: "1r",
        icona: t.icona || "🧩",
        detalls_tecnics: {
          descripcio: t.descripcio || "",
          durada_hores: t.durada_h || 0,
          places_maximes: t.places_maximes || 0,
          ubicacio_defecte: "Ca n'Olivella",
        },
        referents_assignats: [],
        dies_execucio: t.dies_execucio || [],
      };
    } catch (error: any) {
      console.error("Error en tallerService.update:", error);
      const errorMessage = error.response?.data?.message || "No se pudo actualizar el taller";
      throw new Error(errorMessage);
    }
  },

  /**
   * Elimina un taller existente.
   */
  delete: async (id: string): Promise<void> => {
    const api = getApi();
    try {
      await api.delete(`/workshops/${id}`);
    } catch (error: any) {
      console.error("Error en tallerService.delete:", error);
      const errorMessage = error.response?.data?.message || "No se pudo eliminar el taller";
      throw new Error(errorMessage);
    }
  },
};

export default tallerService;