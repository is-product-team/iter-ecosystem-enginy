"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { ROLES } from "@iter/shared";
import DashboardLayout from "@/components/DashboardLayout";
import Calendar, { CalendarEvent } from "@/components/ui/Calendar";
import getApi from "@/services/api";
import Loading from "@/components/Loading";
import { format } from "date-fns";
import { useTranslations } from "next-intl";

interface Phase {
  phaseId: number;
  name: string;
  startDate: string;
  endDate: string;
  description: string;
  isActive: boolean;
}

export default function CalendarPage() {
  const { user, loading: authLoading } = useAuth();
  const [activePhase, setActivePhase] = useState<Phase | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const t = useTranslations('Calendar');
  const tc = useTranslations('Common');

  // Overlay states
  const [isLegendOpen, setIsLegendOpen] = useState(false);

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

      const phaseEvents = phasesData.map((f: Phase) => ({
        id: `phase-${f.phaseId}`,
        title: `${tc('phase')}: ${f.name}`,
        date: f.startDate,
        endDate: f.endDate,
        type: 'milestone',
        description: f.description,
        colorClass: getPhaseColor(f.name)
      }));

      setEvents([...eventsRes.data, ...phaseEvents]);
      setActivePhase(phasesData.find((f: Phase) => f.isActive));
    } catch (error) {
      console.error("Error fetching calendar data:", error);
    } finally {
      setLoading(false);
    }
  }, [user, tc]);

  if (authLoading) return <Loading fullScreen message={t('loading_auth')} />;

  return (
    <DashboardLayout
      title={t('title')}
      subtitle={t('subtitle')}
    >
      <div className="w-full relative">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 ${activePhase ? 'bg-consorci-darkBlue' : 'bg-border-subtle'}`}></div>
            <div className="text-[13px] font-medium text-text-primary">
              {activePhase ? t('active_fase', { nom: activePhase.name }) : t('sync_phases')}
            </div>
          </div>
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

        <div className="border border-border-subtle bg-background-surface">
          <Calendar
            events={events}
            isLoading={loading}
            onRangeChange={fetchCalendarData}
            onEventClick={(e) => {
              // Si tiene assignmentId, navegar al detalle
              if (e.metadata?.assignmentId) {
                const baseUrl = user?.role.name === ROLES.ADMIN ? '/admin/assignments' : '/center/assignments';
                window.location.href = `${baseUrl}/${e.metadata.assignmentId}`;
              }
            }}
          />
        </div>

        {isLegendOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-background-surface border border-border-subtle w-full max-w-sm p-10 relative">
              <button
                onClick={() => setIsLegendOpen(false)}
                className="absolute top-8 right-8 text-text-muted hover:text-text-primary transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <h3 className="text-xl font-medium text-text-primary tracking-tight border-b border-border-subtle pb-6 mb-8">
                {t('legend_title')}
              </h3>

              <div className="space-y-6">
                <div className="flex items-center gap-5 group cursor-default">
                  <div className="w-5 h-5 bg-consorci-lightBlue"></div>
                  <div>
                    <span className="block text-[13px] font-medium text-text-primary transition-colors">{t('assignment_label')}</span>
                    <span className="text-[12px] text-text-muted font-medium opacity-70">{t('assignment_desc')}</span>
                  </div>
                </div>

                <div className="flex items-center gap-5 group cursor-default">
                  <div className="w-5 h-5 bg-consorci-yellow"></div>
                  <div>
                    <span className="block text-[13px] font-medium text-text-primary transition-colors">{t('session_label')}</span>
                    <span className="text-[12px] text-text-muted font-medium opacity-70">{t('session_desc')}</span>
                  </div>
                </div>

                <div className="pt-8 border-t border-border-subtle">
                  <span className="block text-[10px] font-medium text-text-muted uppercase tracking-wider mb-6 opacity-60">{t('phases_label')}</span>
                  <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                    <div className="flex items-center gap-3">
                      <div className="w-3.5 h-3.5 bg-consorci-darkBlue"></div>
                      <span className="text-[11px] font-medium text-text-primary">{t('phase_solicitud')}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3.5 h-3.5 bg-consorci-actionBlue"></div>
                      <span className="text-[11px] font-medium text-text-primary">{t('phase_planificacion')}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3.5 h-3.5 bg-consorci-pinkRed"></div>
                      <span className="text-[11px] font-medium text-text-primary">{t('phase_ejecucion')}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3.5 h-3.5 bg-consorci-beige"></div>
                      <span className="text-[11px] font-medium text-text-primary">{t('phase_evaluacion')}</span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsLegendOpen(false)}
                className="w-full mt-10 py-4 bg-consorci-darkBlue text-white text-[13px] font-medium transition-all hover:bg-black active:scale-95"
              >
                {t('legend_ok')}
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
