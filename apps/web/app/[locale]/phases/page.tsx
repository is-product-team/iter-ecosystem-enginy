"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import getApi from "@/services/api";
import Loading from "@/components/Loading";
import { toast } from "sonner";
import { Calendar, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { ROLES } from "@iter/shared";

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
  const t = useTranslations('Admin.Phases');
  const tc = useTranslations('Common');
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
    if (user && user.role.name === ROLES.ADMIN) {
      fetchPhases();
    }
  }, [user]);

  const togglePhase = async (id: number, currentActive: boolean) => {
    if (currentActive) return; // Already active
    setUpdating(id);
    try {
      const api = getApi();
      await api.put(`/phases/${id}`, { isActive: !currentActive });
      await fetchPhases();
      toast.success(t('success_activate'));
    } catch (error) {
      toast.error(t('error_activate'));
    } finally {
      setUpdating(null);
    }
  };

  const updatePhaseDate = async (id: number, field: 'startDate' | 'endDate', value: string) => {
    try {
      const api = getApi();
      await api.put(`/phases/${id}`, { [field]: value });
      setPhases(prev => prev.map(f => f.phaseId === id ? { ...f, [field]: value } : f));
      toast.success(t('success_date'));
    } catch (error) {
      toast.error(t('error_date'));
    }
  };

  if (authLoading || !user || user.role.name !== ROLES.ADMIN) {
    return <Loading fullScreen message={tc('authenticating')} />;
  }

  return (
    <DashboardLayout
      title={t('roadmap_title')}
      subtitle={t('roadmap_subtitle')}
    >
      <div className="w-full pb-20 space-y-12">
        {/* Institutional Notice */}
        <div className="bg-background-surface border border-border-subtle p-10 flex flex-col md:flex-row items-start md:items-center gap-8">
          <div className="w-14 h-14 bg-background-subtle flex items-center justify-center border border-border-subtle shrink-0">
            <Clock className="w-6 h-6 text-consorci-darkBlue dark:text-text-primary" strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <h3 className="text-[13px] font-medium text-text-muted mb-2 uppercase tracking-wider">{t('institutional_notice_title')}</h3>
            <p className="text-[15px] text-text-primary font-medium leading-relaxed max-w-3xl">
              {t('institutional_notice_desc')}
            </p>
          </div>
        </div>

        {loading ? (
          <Loading message={t('loading_roadmap')} />
        ) : (
          <div className="space-y-8">
            {phases.sort((a, b) => a.order - b.order).map((phase) => (
              <div
                key={phase.phaseId}
                className={`group bg-background-surface border transition-all duration-300 ${
                  phase.isActive 
                    ? 'border-consorci-darkBlue ring-1 ring-consorci-darkBlue/5' 
                    : 'border-border-subtle opacity-80'
                }`}
              >
                <div className="p-10 flex flex-col lg:flex-row justify-between gap-12">
                  <div className="flex-1 space-y-8">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-6">
                        <div className={`w-12 h-12 flex items-center justify-center text-[15px] font-medium border transition-colors ${
                          phase.isActive 
                            ? 'bg-consorci-darkBlue text-white border-consorci-darkBlue' 
                            : 'bg-background-subtle text-text-muted border-border-subtle'
                        }`}>
                          {phase.order}
                        </div>
                        <div>
                          <h3 className="text-[20px] font-medium text-text-primary tracking-tight">{phase.name}</h3>
                          <div className="flex items-center gap-3 mt-2">
                            {phase.isActive ? (
                              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-consorci-darkBlue/5 border border-consorci-darkBlue/20 text-consorci-darkBlue text-[11px] font-medium uppercase tracking-wider">
                                <CheckCircle2 className="w-3 h-3" />
                                {t('currently_active')}
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-background-subtle border border-border-subtle text-text-muted text-[11px] font-medium uppercase tracking-wider">
                                <AlertCircle className="w-3 h-3" />
                                {t('inactive')}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="text-[14px] text-text-secondary font-medium leading-relaxed max-w-2xl">
                      {phase.description}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
                      <div className="space-y-3">
                        <label className="flex items-center gap-2 text-[11px] font-medium text-text-muted uppercase tracking-widest">
                          <Calendar className="w-3.5 h-3.5" strokeWidth={1.5} />
                          {t('opening_date')}
                        </label>
                        <input
                          type="date"
                          value={phase.startDate.split('T')[0]}
                          onChange={(e) => updatePhaseDate(phase.phaseId, 'startDate', e.target.value)}
                          className="w-full bg-background-subtle border border-border-subtle text-[13px] font-medium text-text-primary px-5 py-3.5 focus:outline-none focus:border-consorci-darkBlue transition-all"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="flex items-center gap-2 text-[11px] font-medium text-text-muted uppercase tracking-widest">
                          <Calendar className="w-3.5 h-3.5" strokeWidth={1.5} />
                          {t('closing_date')}
                        </label>
                        <input
                          type="date"
                          value={phase.endDate.split('T')[0]}
                          onChange={(e) => updatePhaseDate(phase.phaseId, 'endDate', e.target.value)}
                          className="w-full bg-background-subtle border border-border-subtle text-[13px] font-medium text-text-primary px-5 py-3.5 focus:outline-none focus:border-consorci-darkBlue transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="lg:w-72 flex flex-col justify-center lg:border-l border-border-subtle lg:pl-12">
                    <button
                      onClick={() => togglePhase(phase.phaseId, phase.isActive)}
                      disabled={updating === phase.phaseId || phase.isActive}
                      className={`w-full py-5 text-[12px] font-medium uppercase tracking-widest transition-all ${
                        phase.isActive
                          ? 'bg-background-subtle text-text-muted border border-border-subtle cursor-default'
                          : 'bg-consorci-darkBlue text-white hover:bg-black active:scale-[0.98]'
                      }`}
                    >
                      {updating === phase.phaseId
                        ? (
                          <div className="flex items-center justify-center gap-3">
                            <Loading size="mini" white />
                            {t('processing')}
                          </div>
                        )
                        : (phase.isActive ? t('active') : t('activate_phase'))
                      }
                    </button>
                    {!phase.isActive && (
                      <p className="mt-4 text-[10px] text-text-muted font-medium text-center italic opacity-60">
                        {t('activation_hint')}
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
