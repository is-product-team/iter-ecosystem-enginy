"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { ROLES } from "@iter/shared";
import DashboardLayout from "@/components/DashboardLayout";
import Calendar, { CalendarEvent } from "@/components/ui/Calendar";
import getApi from "@/services/api";
import Loading from "@/components/Loading";
import { format } from "date-fns";

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
  const [activeFase, setActiveFase] = useState<Phase | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);

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
        title: `Phase: ${f.name}`,
        date: f.startDate,
        endDate: f.endDate,
        type: 'milestone',
        description: f.description,
        colorClass: getPhaseColor(f.name)
      }));

      setEvents([...eventsRes.data, ...phaseEvents]);
      setActiveFase(phasesData.find((f: Phase) => f.isActive));
    } catch (error) {
      console.error("Error fetching calendar data:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  if (authLoading) return <Loading fullScreen message="Syncing your calendar..." />;

  return (
    <DashboardLayout
      title="Iter Calendar"
      subtitle="Visualize all milestones, workshops, and deadlines in a dynamic calendar."
    >
      <div className="w-full relative">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full animate-pulse ${activeFase ? 'bg-consorci-pinkRed' : 'bg-gray-300'}`}></div>
            <div className="text-[11px] font-black text-text-primary uppercase tracking-widest">
              {activeFase ? `Current Phase: ${activeFase.name}` : "Loading phases..."}
            </div>
          </div>
          <button
            onClick={() => setIsLegendOpen(true)}
            className="px-6 py-2.5 bg-background-surface border-2 border-border-subtle text-text-primary text-[10px] font-black uppercase tracking-[0.2em] hover:border-consorci-darkBlue hover:bg-consorci-darkBlue hover:text-white transition-all flex items-center gap-2 shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Color Legend
          </button>
        </div>

        <div className="shadow-2xl">
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-consorci-darkBlue/40 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-background-surface border-4 border-consorci-darkBlue w-full max-w-sm p-10 shadow-[0_0_50px_rgba(0,0,0,0.3)] relative">
              <button
                onClick={() => setIsLegendOpen(false)}
                className="absolute top-6 right-6 text-text-muted hover:text-consorci-darkBlue transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <h3 className="text-xl font-black text-text-primary uppercase tracking-tighter border-b-4 border-consorci-darkBlue pb-4 mb-8">
                Color Legend
              </h3>

              <div className="space-y-6">
                <div className="flex items-center gap-4 group cursor-default">
                  <div className="w-6 h-6 bg-consorci-lightBlue shadow-inner"></div>
                  <div>
                    <span className="block text-[11px] font-black text-text-primary uppercase tracking-widest group-hover:text-consorci-lightBlue transition-colors">Assignment</span>
                    <span className="text-[10px] text-text-muted font-bold">Workshop reservation at the center.</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 group cursor-default">
                  <div className="w-6 h-6 bg-consorci-yellow shadow-inner"></div>
                  <div>
                    <span className="block text-[11px] font-black text-text-primary uppercase tracking-widest group-hover:text-consorci-yellow transition-colors">Workshop Session</span>
                    <span className="text-[10px] text-text-muted font-bold">Meeting with students.</span>
                  </div>
                </div>

                <div className="pt-6 border-t-2 border-border-subtle">
                  <span className="block text-[9px] font-black text-text-muted uppercase tracking-[0.3em] mb-6">Program Phases</span>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-consorci-darkBlue"></div>
                      <span className="text-[9px] font-black text-text-secondary uppercase tracking-tighter">Registration</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-consorci-actionBlue"></div>
                      <span className="text-[9px] font-black text-text-secondary uppercase tracking-tighter">Planning</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-consorci-pinkRed"></div>
                      <span className="text-[9px] font-black text-text-secondary uppercase tracking-tighter">Execution</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-consorci-beige"></div>
                      <span className="text-[9px] font-black text-text-secondary uppercase tracking-tighter">Evaluation</span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsLegendOpen(false)}
                className="w-full mt-10 py-4 bg-consorci-darkBlue text-white text-[11px] font-black uppercase tracking-[0.2em] hover:bg-consorci-actionBlue transition-all shadow-lg active:scale-95"
              >
                Okay
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
