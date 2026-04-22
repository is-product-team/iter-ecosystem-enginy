"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import { ROLES } from "@iter/shared";
import DashboardLayout from "@/components/DashboardLayout";
import getApi from "@/services/api";
import Loading from "@/components/Loading";
import { toast } from "sonner";
import { Calendar, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import Button from "@/components/ui/Button";

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
  const { socket } = useSocket();
  const t = useTranslations('Admin.Phases');
  const tc = useTranslations('Common');
  const tp = useTranslations('ProgramPhases');
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

  // Real-time updates for phases
  useEffect(() => {
    if (socket) {
      const handlePhaseChange = (data: any) => {
        console.log('📡 [WEB] Phase change event received:', data);
        fetchPhases();
        
        // Show a discrete toast if the user isn't the one who triggered it
        // (Though in this case fetchPhases is enough)
      };

      socket.on('phase_changed', handlePhaseChange);
      return () => {
        socket.off('phase_changed', handlePhaseChange);
      };
    }
  }, [socket]);

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

  if (authLoading || !user || user.role.name !== 'ADMIN') {
    return <Loading fullScreen message={tc('authenticating')} />;
  }

  return (
    <DashboardLayout
      title={t('roadmap_title')}
      subtitle={t('roadmap_subtitle')}
    >
      <div className="w-full pb-20 space-y-8">
        {/* Institutional Notice */}
        <div className="bg-background-surface border border-border-subtle p-6 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-12 h-12 bg-background-subtle flex items-center justify-center border border-border-subtle shrink-0">
            <Clock className="w-5 h-5 text-consorci-darkBlue dark:text-text-primary" strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <h3 className="text-[11px] font-medium text-text-muted mb-1 uppercase tracking-wider">{t('institutional_notice_title')}</h3>
            <p className="text-[14px] text-text-primary font-medium leading-relaxed max-w-3xl">
              {t('institutional_notice_desc')}
            </p>
          </div>
        </div>

        {loading ? (
          <Loading message={t('loading_roadmap')} />
        ) : (
          <div className="space-y-4">
            {phases.sort((a, b) => a.order - b.order).map((phase) => (
              <div
                key={phase.phaseId}
                className={`group bg-background-surface border transition-all duration-300 ${
                  phase.isActive 
                    ? 'border-consorci-darkBlue ring-1 ring-consorci-darkBlue/5' 
                    : 'border-border-subtle opacity-80'
                }`}
              >
                <div className="p-6 flex flex-col lg:flex-row justify-between gap-8">
                  <div className="flex-1 space-y-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 flex items-center justify-center text-[13px] font-medium border transition-colors ${
                          phase.isActive 
                            ? 'bg-consorci-darkBlue text-white border-consorci-darkBlue' 
                            : 'bg-background-subtle text-text-muted border-border-subtle'
                        }`}>
                          {phase.order}
                        </div>
                        <div>
                          <h3 className="text-[16px] font-semibold text-text-primary tracking-tight">
                            {tp.has(`${phase.name}.name`) ? tp(`${phase.name}.name`) : phase.name}
                          </h3>
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

                    <p className="text-[13px] text-text-secondary font-medium leading-relaxed max-w-2xl">
                      {tp.has(`${phase.name}.description`) ? tp(`${phase.name}.description`) : phase.description}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
                      <div className="space-y-3">
                        <label className="flex items-center gap-2 text-[11px] font-medium text-text-muted uppercase tracking-widest">
                          <Calendar className="w-3.5 h-3.5" strokeWidth={1.5} />
                          {t('opening_date')}
                        </label>
                        <input
                          type="date"
                          value={phase.startDate ? phase.startDate.split('T')[0] : ''}
                          onChange={(e) => updatePhaseDate(phase.phaseId, 'startDate', e.target.value)}
                          className="w-full bg-background-subtle border border-border-subtle text-[13px] font-medium text-text-primary px-4 py-2.5 focus:outline-none focus:border-consorci-darkBlue transition-all"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="flex items-center gap-2 text-[11px] font-medium text-text-muted uppercase tracking-widest">
                          <Calendar className="w-3.5 h-3.5" strokeWidth={1.5} />
                          {t('closing_date')}
                        </label>
                        <input
                          type="date"
                          value={phase.endDate ? phase.endDate.split('T')[0] : ''}
                          onChange={(e) => updatePhaseDate(phase.phaseId, 'endDate', e.target.value)}
                          className="w-full bg-background-subtle border border-border-subtle text-[13px] font-medium text-text-primary px-4 py-2.5 focus:outline-none focus:border-consorci-darkBlue transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="lg:w-64 flex flex-col justify-center lg:border-l border-border-subtle lg:pl-10">
                    <Button
                      variant={phase.isActive ? 'outline' : 'primary'}
                      size="sm"
                      onClick={() => togglePhase(phase.phaseId, phase.isActive)}
                      disabled={phase.isActive}
                      loading={updating === phase.phaseId}
                      className="w-full uppercase tracking-widest px-0"
                    >
                      {phase.isActive ? t('active') : t('activate_phase')}
                    </Button>
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
