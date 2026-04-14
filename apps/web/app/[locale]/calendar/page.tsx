"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ROLES } from "@iter/shared";
import DashboardLayout from "@/components/DashboardLayout";
import Calendar, { CalendarEvent } from "@/components/ui/Calendar";
import getApi from "@/services/api";
import Loading from "@/components/Loading";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import SyncCalendarModal from "@/components/calendar/SyncCalendarModal";
import { Share2 } from "lucide-react";

interface Phase {
  phaseId: number;
  name: string;
  startDate: string;
  endDate: string;
  description: string;
  isActive: boolean;
}

export default function CalendarPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [activePhase, setActivePhase] = useState<Phase | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const t = useTranslations('Calendar');
  const tc = useTranslations('Common');
  const tp = useTranslations('ProgramPhases');
  const tSync = useTranslations('Sync');

  // Overlay states
  const [isLegendOpen, setIsLegendOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  const fetchCalendarData = useCallback(async (start: Date, end: Date) => {
    if (!user) return;
    setLoading(true);
    try {
      const api = getApi();
      const startStr = format(start, 'yyyy-MM-dd');
      const endStr = format(end, 'yyyy-MM-dd');

      const [eventsRes, phasesRes] = await Promise.all([
        api.get(`/calendar?start=${startStr}&end=${endStr}`),
        api.get("/phases")
      ]);

      const phasesData = phasesRes.data.data;
      const getPhaseColor = (name: string) => {
        const n = name.toLowerCase();
        if (n.includes("sol·licitud") || n.includes("inscripció") || n.includes("application") || n.includes("registration")) return "calendar-event-card event-phase-inscription";
        if (n.includes("planificació") || n.includes("assignació") || n.includes("planning") || n.includes("assignment")) return "calendar-event-card event-phase-planning";
        if (n.includes("execució") || n.includes("seguiment") || n.includes("execution") || n.includes("monitoring")) return "calendar-event-card event-phase-execution";
        if (n.includes("tancament") || n.includes("avaluació") || n.includes("closure") || n.includes("evaluation")) return "calendar-event-card event-phase-evaluation";
        return "calendar-event-card event-milestone";
      };

      const getLocalizedPhaseName = (name: string) => {
        const n = name.toLowerCase();
        if (n.includes("sol·licitud") || n.includes("inscripció") || n.includes("application") || n.includes("registration")) return tp('Application.name');
        if (n.includes("planificació") || n.includes("assignació") || n.includes("planning") || n.includes("assignment")) return tp('Planning.name');
        if (n.includes("execució") || n.includes("seguiment") || n.includes("execution") || n.includes("monitoring")) return tp('Execution.name');
        if (n.includes("tancament") || n.includes("avaluació") || n.includes("closure") || n.includes("evaluation")) return tp('Closure.name');
        return name;
      };

      const phaseEvents = phasesData.map((f: Phase) => ({
        id: `phase-${f.phaseId}`,
        title: `${tc('phase')}: ${getLocalizedPhaseName(f.name)}`,
        date: f.startDate,
        endDate: f.endDate,
        type: 'milestone',
        description: f.description,
        colorClass: getPhaseColor(f.name)
      }));

      setEvents([...eventsRes.data, ...phaseEvents]);
      const currentActive = phasesData.find((f: Phase) => f.isActive);
      if (currentActive) {
        setActivePhase({
          ...currentActive,
          name: getLocalizedPhaseName(currentActive.name)
        });
      }
    } catch (error) {
      console.error("Error fetching calendar data:", error);
    } finally {
      setLoading(false);
    }
  }, [user, tc, tp]);

  if (authLoading) return <Loading fullScreen message={t('loading_auth')} />;

  return (
    <DashboardLayout
      title={t('title')}
      subtitle={t('subtitle')}
    >
      <div className="w-full relative">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="text-[13px] font-medium text-text-primary">
              {activePhase ? t('active_fase', { nom: activePhase.name }) : t('sync_phases')}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSyncModalOpen(true)}
              className="px-6 py-2.5 bg-consorci-darkBlue text-white text-[13px] font-medium transition-all hover:bg-black active:scale-[0.98] flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              {tSync('title')}
            </button>
            <button
              onClick={() => setIsLegendOpen(true)}
              className="px-6 py-2.5 bg-background-surface border border-border-subtle text-text-primary text-[13px] font-medium transition-all hover:bg-background-subtle active:scale-[0.98] flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t('view_legend')}
            </button>
          </div>
        </div>

        <div className="border border-border-subtle bg-background-surface">
          <Calendar
            events={events}
            isLoading={loading}
            onRangeChange={fetchCalendarData}
            onEventClick={(e) => {
              // Si tiene assignmentId, navegar al detalle
              if (e.metadata?.assignmentId) {
                const baseUrl = user?.role.name === ROLES.ADMIN ? '/admin/assignments' : '/center/assignments';
                router.push(`${baseUrl}/${e.metadata.assignmentId}`);
              }
            }}
          />
        </div>

        {isLegendOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-background-surface/90 backdrop-blur-2xl border border-white/20 shadow-2xl w-full max-w-md p-12 relative rounded-3xl animate-in zoom-in-95 duration-300">
              <button
                onClick={() => setIsLegendOpen(false)}
                className="absolute top-10 right-10 text-text-muted hover:text-text-primary transition-all p-2 hover:bg-background-subtle rounded-full"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <h3 className="text-2xl font-semibold text-text-primary tracking-tight mb-10">
                {t('legend_title')}
              </h3>

              <div className="space-y-10">
                <div className="space-y-6">
                  <span className="block text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] opacity-60">{tc('activities')}</span>
                  
                  <div className="flex items-start gap-5 group cursor-default">
                    <div>
                      <span className="block text-[14px] font-semibold text-text-primary">{t('assignment_label')}</span>
                      <span className="text-[12px] text-text-muted font-medium opacity-70">{t('assignment_desc')}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-5 group cursor-default">
                    <div>
                      <span className="block text-[14px] font-semibold text-text-primary">{t('session_label')}</span>
                      <span className="text-[12px] text-text-muted font-medium opacity-70">{t('session_desc')}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-10 border-t border-border-subtle/30">
                  <span className="block text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mb-6 opacity-60">{t('phases_label')}</span>
                  <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                    <div className="flex items-center gap-3">
                      <span className="text-[12px] font-semibold text-text-primary opacity-80">{t('phase_solicitud')}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[12px] font-semibold text-text-primary opacity-80">{t('phase_planificacion')}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[12px] font-semibold text-text-primary opacity-80">{t('phase_ejecucion')}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[12px] font-semibold text-text-primary opacity-80">{t('phase_evaluacion')}</span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsLegendOpen(false)}
                className="w-full mt-12 py-4.5 bg-consorci-darkBlue text-white text-[14px] font-semibold rounded-2xl transition-all hover:bg-black hover:shadow-lg active:scale-[0.98]"
              >
                {t('legend_ok')}
              </button>
            </div>
          </div>
        )}

        <SyncCalendarModal 
          isOpen={isSyncModalOpen}
          onClose={() => setIsSyncModalOpen(false)}
        />
      </div>
    </DashboardLayout>
  );
}
