"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import getApi from "@/services/api";
import { THEME } from "@iter/shared";
import Loading from "@/components/Loading";
import { toast } from "sonner";

interface Phase {
  phaseId: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  order: number;
}

export default function PhaseManagementPage() {
  const { user, loading: authLoading } = useAuth();
  const [phases, setPhases] = useState<Phase[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);

  const fetchPhases = async () => {
    try {
      const api = getApi();
      const response = await api.get("/phases");
      setPhases(response.data.data);
    } catch (error) {
      console.error("Error fetching phases:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role.name === 'ADMIN') {
      fetchPhases();
    }
  }, [user]);

  const togglePhase = async (id: number, currentActive: boolean) => {
    setUpdating(id);
    try {
      const api = getApi();
      await api.put(`/phases/${id}`, { isActive: !currentActive });
      await fetchPhases();
      toast.success("Phase updated successfully.");
    } catch (error) {
      toast.error("Error updating the phase.");
    } finally {
      setUpdating(null);
    }
  };

  const updatePhaseDate = async (id: number, field: 'startDate' | 'endDate', value: string) => {
    try {
      const api = getApi();
      await api.put(`/phases/${id}`, { [field]: value });
      setPhases(prev => prev.map(f => f.phaseId === id ? { ...f, [field]: value } : f));
      toast.success("Date updated.");
    } catch (error) {
      toast.error("Error updating the date.");
    }
  };

  if (authLoading || !user || user.role.name !== 'ADMIN') return null;

  return (
    <DashboardLayout
      title="Iter Phase Management"
      subtitle="Roadmap and status control of the current program"
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
              <h3 className="font-black text-consorci-darkBlue dark:text-consorci-lightBlue uppercase text-[10px] tracking-widest mb-1">Temporal Control Panel</h3>
              <p className="text-sm text-text-secondary font-medium leading-relaxed">
                Each phase enables specific functionalities for center coordinators.
                You can activate a phase to force the application and test workflows.
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <Loading message="Syncing phases..." />
        ) : (
          <div className="grid gap-6">
            {phases.sort((a, b) => a.order - b.order).map((phase) => (
              <div
                key={phase.phaseId}
                className={`border bg-background-surface ${phase.isActive
                    ? 'border-l-8 border-consorci-darkBlue border-t-border-subtle border-r-border-subtle border-b-border-subtle'
                    : 'border-l-8 border-border-subtle border-t-border-subtle border-r-border-subtle border-b-border-subtle opacity-70'
                  }`}
              >
                <div className="p-8 flex flex-col md:flex-row justify-between gap-8">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 border border-border-subtle flex items-center justify-center bg-background-subtle text-xs font-black text-text-muted">
                        {phase.order}
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-consorci-darkBlue dark:text-consorci-lightBlue uppercase tracking-tight">{phase.name}</h3>
                        {phase.isActive ? (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-consorci-darkBlue text-white text-[9px] font-black uppercase tracking-widest">
                            Phase Active
                          </span>
                        ) : (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-background-subtle text-text-muted text-[9px] font-black uppercase tracking-widest">
                            Not Active
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-text-secondary font-medium mb-8 max-w-2xl leading-relaxed">
                      {phase.description}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 bg-background-subtle border border-border-subtle">
                      <div>
                        <label className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-2 flex items-center gap-2">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          Opening Date
                        </label>
                        <input
                          type="date"
                          value={phase.startDate.split('T')[0]}
                          onChange={(e) => updatePhaseDate(phase.phaseId, 'startDate', e.target.value)}
                          className="w-full bg-background-surface border border-border-subtle text-xs font-bold text-text-primary px-4 py-3 focus:outline-none focus:border-consorci-darkBlue rounded-none shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-2 flex items-center gap-2">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          Closing Date
                        </label>
                        <input
                          type="date"
                          value={phase.endDate.split('T')[0]}
                          onChange={(e) => updatePhaseDate(phase.phaseId, 'endDate', e.target.value)}
                          className="w-full bg-background-surface border border-border-subtle text-xs font-bold text-text-primary px-4 py-3 focus:outline-none focus:border-consorci-darkBlue rounded-none shadow-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="md:w-56 flex flex-col justify-center border-l border-border-subtle pl-8">
                    <button
                      onClick={() => togglePhase(phase.phaseId, phase.isActive)}
                      disabled={updating === phase.phaseId}
                      className={`w-full py-5 font-black text-[10px] uppercase tracking-widest transition-all ${phase.isActive
                          ? 'bg-background-subtle text-text-muted border border-border-subtle cursor-not-allowed'
                          : 'bg-consorci-darkBlue text-white hover:bg-consorci-actionBlue hover:shadow-lg active:translate-y-0.5'
                        }`}
                    >
                      {updating === phase.phaseId
                        ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-3 h-3 border-2 border-white/20 border-t-white animate-spin rounded-full"></div>
                            Processing
                          </div>
                        )
                        : (phase.isActive ? 'Phase Activated' : 'Activate this Phase')
                      }
                    </button>
                      {!phase.isActive && (
                        <p className="mt-3 text-[9px] text-text-muted font-bold uppercase text-center tracking-tighter">
                          Activation is immediate
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
