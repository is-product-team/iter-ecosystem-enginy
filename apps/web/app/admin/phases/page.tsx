"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import getApi from "@/services/api";
import { THEME } from "@iter/shared";
import Loading from "@/components/Loading";
import { toast } from "sonner";

interface Fase {
  id_fase: number;
  nom: string;
  descripcio: string;
  data_inici: string;
  data_fi: string;
  activa: boolean;
  ordre: number;
}

export default function PhaseManagementPage() {
  const { user, loading: authLoading } = useAuth();
  const [fases, setFases] = useState<Fase[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);

  const fetchFases = async () => {
    try {
      const api = getApi();
      const response = await api.get("/fases");
      setFases(response.data.data);
    } catch (error) {
      console.error("Error fetching phases:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.rol.nom_rol === 'ADMIN') {
      fetchFases();
    }
  }, [user]);

  const togglePhase = async (id: number, currentActiva: boolean) => {
    setUpdating(id);
    try {
      const api = getApi();
      await api.put(`/fases/${id}`, { activa: !currentActiva });
      await fetchFases();
      toast.success("Fase actualitzada correctament.");
    } catch (error) {
      toast.error("Error al actualitzar la fase.");
    } finally {
      setUpdating(null);
    }
  };

  const updatePhaseDate = async (id: number, field: 'data_inici' | 'data_fi', value: string) => {
    try {
      const api = getApi();
      await api.put(`/fases/${id}`, { [field]: value });
      setFases(prev => prev.map(f => f.id_fase === id ? { ...f, [field]: value } : f));
      toast.success("Data actualitzada.");
    } catch (error) {
      toast.error("Error al actualitzar la data.");
    }
  };

  if (authLoading || !user || user.rol.nom_rol !== 'ADMIN') return null;

  return (
    <DashboardLayout
      title="Gestió de Fases Iter"
      subtitle="Full de ruta i control d'estats del programa actual"
    >
      <div className="w-full space-y-8">
        {/* Institutional Notice */}
        <div className="bg-background-surface border border-consorci-darkBlue/20 p-6 rounded-none">
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-consorci-darkBlue flex items-center justify-center text-white shrink-0">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-black text-consorci-darkBlue dark:text-consorci-lightBlue uppercase text-[10px] tracking-widest mb-1">Panell de Control Temporal</h3>
              <p className="text-sm text-text-secondary font-medium leading-relaxed">
                Cada fase habilita funcionalitats específiques per als coordinadors de centre.
                Pots activar una fase per forçar la transició de l'aplicació i provar els fluxos de treball.
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <Loading message="Sincronitzant fases..." />
        ) : (
          <div className="grid gap-6">
            {fases.sort((a, b) => a.ordre - b.ordre).map((fase) => (
              <div
                key={fase.id_fase}
                className={`border bg-background-surface ${fase.activa
                    ? 'border-l-8 border-consorci-darkBlue border-t-border-subtle border-r-border-subtle border-b-border-subtle'
                    : 'border-l-8 border-border-subtle border-t-border-subtle border-r-border-subtle border-b-border-subtle opacity-70'
                  }`}
              >
                <div className="p-8 flex flex-col md:flex-row justify-between gap-8">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 border border-border-subtle flex items-center justify-center bg-background-subtle text-xs font-black text-text-muted">
                        {fase.ordre}
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-consorci-darkBlue dark:text-consorci-lightBlue uppercase tracking-tight">{fase.nom}</h3>
                        {fase.activa ? (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-consorci-darkBlue text-white text-[9px] font-black uppercase tracking-widest">
                            Fase Activa
                          </span>
                        ) : (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-background-subtle text-text-muted text-[9px] font-black uppercase tracking-widest">
                            No Activa
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-text-secondary font-medium mb-8 max-w-2xl leading-relaxed">
                      {fase.descripcio}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 bg-background-subtle border border-border-subtle">
                      <div>
                        <label className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-2 flex items-center gap-2">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          Data obertura
                        </label>
                        <input
                          type="date"
                          value={fase.data_inici.split('T')[0]}
                          onChange={(e) => updatePhaseDate(fase.id_fase, 'data_inici', e.target.value)}
                          className="w-full bg-background-surface border border-border-subtle text-xs font-bold text-text-primary px-4 py-3 focus:outline-none focus:border-consorci-darkBlue rounded-none shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-2 flex items-center gap-2">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          Data tancament
                        </label>
                        <input
                          type="date"
                          value={fase.data_fi.split('T')[0]}
                          onChange={(e) => updatePhaseDate(fase.id_fase, 'data_fi', e.target.value)}
                          className="w-full bg-background-surface border border-border-subtle text-xs font-bold text-text-primary px-4 py-3 focus:outline-none focus:border-consorci-darkBlue rounded-none shadow-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="md:w-56 flex flex-col justify-center border-l border-border-subtle pl-8">
                    <button
                      onClick={() => togglePhase(fase.id_fase, fase.activa)}
                      disabled={updating === fase.id_fase}
                      className={`w-full py-5 font-black text-[10px] uppercase tracking-widest transition-all ${fase.activa
                          ? 'bg-background-subtle text-text-muted border border-border-subtle cursor-not-allowed'
                          : 'bg-consorci-darkBlue text-white hover:bg-consorci-actionBlue hover:shadow-lg active:translate-y-0.5'
                        }`}
                    >
                      {updating === fase.id_fase
                        ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-3 h-3 border-2 border-white/20 border-t-white animate-spin rounded-full"></div>
                            Processant
                          </div>
                        )
                        : (fase.activa ? 'Fase Activada' : 'Activar aquesta Fase')
                      }
                    </button>
                    {!fase.activa && (
                      <p className="mt-3 text-[9px] text-text-muted font-bold uppercase text-center tracking-tighter">
                        L'activació és immediata
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
