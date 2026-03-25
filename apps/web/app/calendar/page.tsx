"use client";

import { useState, useEffect } from "react";
import { ROLES } from '@iter/shared';
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import Calendar, { CalendarEvent } from "../../components/ui/Calendar";
import getApi from "@/services/api";
import Loading from "@/components/Loading";

interface Phase {
  id_fase: number;
  nom: string;
  data_inici: string;
  data_fi: string;
  descripcio: string;
  activa: boolean;
}

interface Request {
  id_center: number;
  // Add other properties of Request if known
}

export default function CalendarPage() {
  const { user, loading: authLoading } = useAuth();
  const [activeFase, setActiveFase] = useState<Phase | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);

  // Overlay states
  const [isLegendOpen, setIsLegendOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const api = getApi();
        // The following lines were part of the instruction but seem out of place in this useEffect context.
        // If they are meant to be added, their placement and purpose need clarification.
        // const res = await api.get('/requests');
        // const filtered = res.data.filter((r: Request) => r.id_center === user.id_center);

        const [eventsRes, phasesRes] = await Promise.all([
          api.get("/calendar"),
          api.get("/fases")
        ]);

        const phasesData = phasesRes.data.data;
        const getPhaseColor = (nom: string) => {
          const n = nom.toLowerCase();
          if (n.includes("sol·licitud") || n.includes("inscripció")) return "bg-consorci-darkBlue text-white";
          if (n.includes("planificació") || n.includes("assignació")) return "bg-consorci-actionBlue text-white";
          if (n.includes("execució") || n.includes("seguiment")) return "bg-consorci-pinkRed text-white";
          if (n.includes("tancament") || n.includes("avaluació")) return "bg-consorci-beige text-[#00426B]";
          return "bg-consorci-darkBlue text-white";
        };

        const phaseEvents = phasesData.map((f: Phase) => ({
          id: `fase-${f.id_fase}`,
          title: `Fase: ${f.nom}`,
          date: f.data_inici,
          endDate: f.data_fi,
          type: 'milestone',
          description: f.descripcio,
          colorClass: getPhaseColor(f.nom)
        }));

        setEvents([...eventsRes.data, ...phaseEvents]);
        setActiveFase(phasesData.find((f: Phase) => f.activa));
      } catch (error) {
        console.error("Error fetching calendar data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  if (authLoading) return <Loading fullScreen message="Sincronitzant el teu calendari..." />;

  return (
    <DashboardLayout
      title="Calendari Iter"
      subtitle="Visualitza totes les fites, tallers i terminis en un calendari dinàmic."
    >
      <div className="w-full relative">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full animate-pulse ${activeFase ? 'bg-consorci-pinkRed' : 'bg-gray-300'}`}></div>
            <div className="text-[11px] font-black text-text-primary uppercase tracking-widest">
              {activeFase ? `Fase Actual: ${activeFase.nom}` : "Carregant fases..."}
            </div>
          </div>
          <button
            onClick={() => setIsLegendOpen(true)}
            className="px-6 py-2.5 bg-background-surface border-2 border-border-subtle text-text-primary text-[10px] font-black uppercase tracking-[0.2em] hover:border-consorci-darkBlue hover:bg-consorci-darkBlue hover:text-white transition-all flex items-center gap-2 shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Llegenda de Colors
          </button>
        </div>

        <div className="shadow-2xl">
          <Calendar
            events={events}
            isLoading={loading}
            onRangeChange={fetchCalendarData}
            onEventClick={(e) => {
              // Si tiene id_assignment, navegar al detalle
              if (e.metadata?.id_assignment) {
                const baseUrl = user?.role === 'ADMIN' ? '/admin/assignacions' : '/centro/assignacions';
                window.location.href = `${baseUrl}/${e.metadata.id_assignment}`;
              }
            }}
          />
        </div>

        {/* Legend Overlay (Same as before but with better styling) */}
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
                Llegenda de Colors
              </h3>

              <div className="space-y-6">
                <div className="flex items-center gap-4 group cursor-default">
                  <div className="w-6 h-6 bg-consorci-lightBlue shadow-inner"></div>
                  <div>
                    <span className="block text-[11px] font-black text-text-primary uppercase tracking-widest group-hover:text-consorci-lightBlue transition-colors">Assignació</span>
                    <span className="text-[10px] text-text-muted font-bold">Reserva de taller al centre.</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 group cursor-default">
                  <div className="w-6 h-6 bg-consorci-yellow shadow-inner"></div>
                  <div>
                    <span className="block text-xs font-black text-text-primary uppercase tracking-tight">Sessió de Taller</span>
                    <span className="text-[10px] text-text-muted font-medium">Dia i hora concrets de l&apos;activitat.</span>
                  </div>
                </div>

                <div className="pt-6 border-t-2 border-border-subtle">
                  <span className="block text-[9px] font-black text-text-muted uppercase tracking-[0.3em] mb-6">Fases del Programa</span>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-consorci-darkBlue"></div>
                      <span className="text-[9px] font-black text-text-secondary uppercase tracking-tighter">Inscripció</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-consorci-actionBlue"></div>
                      <span className="text-[9px] font-black text-text-secondary uppercase tracking-tighter">Planificació</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-consorci-pinkRed"></div>
                      <span className="text-[9px] font-black text-text-secondary uppercase tracking-tighter">Execució</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-consorci-beige"></div>
                      <span className="text-[9px] font-black text-text-secondary uppercase tracking-tighter">Avaluaicó</span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsLegendOpen(false)}
                className="w-full mt-10 py-4 bg-consorci-darkBlue text-white text-[11px] font-black uppercase tracking-[0.2em] hover:bg-consorci-actionBlue transition-all shadow-lg active:scale-95"
              >
                D'acord
              </button>
            </div>
          </div>
        )}

        {/* Event Details Overlay */}
        {selectedEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-consorci-darkBlue/20 backdrop-blur-sm animate-in fade-in zoom-in duration-300">
            <div className="bg-background-surface border border-consorci-darkBlue w-full max-w-md p-8 shadow-2xl relative">
              <button
                onClick={() => setSelectedEvent(null)}
                className="absolute top-4 right-4 text-text-muted hover:text-consorci-darkBlue transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="mb-6">
                <div className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Detalls de l&apos;esdeveniment</div>
                <h3 className="text-xl font-black text-text-primary leading-tight uppercase tracking-tight">{selectedEvent.title}</h3>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-text-secondary">
                  <svg className="w-4 h-4 text-consorci-darkBlue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs font-bold">
                    {new Date(selectedEvent.date).toLocaleDateString('ca-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>

                {selectedEvent.metadata?.hora && (
                  <div className="flex items-center gap-3 text-text-secondary">
                    <svg className="w-4 h-4 text-consorci-darkBlue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-xs font-bold">{selectedEvent.metadata.hora}</span>
                  </div>
                )}

                {selectedEvent.metadata?.centre && (
                  <div className="flex items-center gap-3 text-text-secondary">
                    <svg className="w-4 h-4 text-consorci-darkBlue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span className="text-xs font-bold">{selectedEvent.metadata.centre}</span>
                  </div>
                )}

                {selectedEvent.description && (
                  <div className="p-4 bg-background-subtle border-l-4 border-consorci-darkBlue">
                    <p className="text-xs text-text-secondary font-medium leading-relaxed italic">
                      &quot;{selectedEvent.description}&quot;
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="flex-1 py-3 border border-border-subtle text-text-muted text-[10px] font-black uppercase tracking-widest hover:bg-background-subtle transition-colors"
                >
                  Tancar
                </button>
                {selectedEvent.metadata?.id_assignacio && (
                  <button
                    onClick={() => {
                      const baseUrl = user?.rol.nom_rol === ROLES.ADMIN ? '/admin/assignacions' : '/centro/assignacions';
                      window.location.href = `${baseUrl}/${selectedEvent.metadata?.id_assignacio}`;
                    }}
                    className="flex-1 py-3 bg-consorci-darkBlue text-white text-[10px] font-black uppercase tracking-widest hover:bg-consorci-actionBlue transition-colors"
                  >
                    Veure Detalls
                  </button>
                )}
                {!selectedEvent.metadata?.id_assignacio && (
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="flex-1 py-3 bg-consorci-darkBlue text-white text-[10px] font-black uppercase tracking-widest hover:bg-consorci-actionBlue transition-colors"
                  >
                    D&apos;acord
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
