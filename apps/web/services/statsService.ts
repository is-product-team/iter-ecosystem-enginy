import getApi from "./api";

export interface StatusStat {
  estat: string;
  total: number;
  last_update: string;
}

export interface PopularStat {
  _id: string; // Títol del taller
  total_solicitudes: number;
  alumnes_totals: number;
}

export interface ActivityLog {
  id_log: number;
  tipus_accio: string;
  id_user?: number;
  data_hora: string;
  descripcio: string;
  usuari?: {
    nom: string;
    email: string;
  };
}

const statsService = {
  getByStatus: async (): Promise<StatusStat[]> => {
    const api = getApi();
    const response = await api.get<StatusStat[]>("/stats/status");
    return response.data;
  },
  getPopular: async (): Promise<PopularStat[]> => {
    const api = getApi();
    const response = await api.get<PopularStat[]>("/stats/popular");
    return response.data;
  },
  getActivity: async (): Promise<ActivityLog[]> => {
    const api = getApi();
    const response = await api.get<ActivityLog[]>("/stats/activity");
    return response.data;
  },
  cleanupLogs: async (): Promise<{ success: boolean; deletedCount: number; message: string }> => {
    const api = getApi();
    const response = await api.delete<{ success: boolean; deletedCount: number; message: string }>("/stats/logs/cleanup");
    return response.data;
  }
};

export default statsService;
