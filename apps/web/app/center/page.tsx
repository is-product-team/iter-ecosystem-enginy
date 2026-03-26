'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { PHASES, ROLES } from '@iter/shared';
import DashboardLayout from '@/components/DashboardLayout';


import phaseService, { Phase } from '@/services/phaseService';

export default function CenterDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [phases, setPhases] = useState<Phase[]>([]);
  const [loadingPhases, setLoadingPhases] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && (!user || user.rol.nom_rol !== ROLES.COORDINATOR)) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchPhases = async () => {
      try {
        const data = await phaseService.getAll();
        setPhases(data);
      } catch (error) {
        console.error("Error fetching phases:", error);
      } finally {
        setLoadingPhases(false);
      }
    };

    if (user && user.rol.nom_rol === ROLES.COORDINATOR) {
      fetchPhases();
    }
  }, [user]);

  const isPhaseActive = (phaseName: string) => {
    const phase = phases.find(f => f.name === phaseName);
    return phase ? phase.active : false;
  };

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen justify-center items-center bg-background-page">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-consorci-darkBlue mx-auto"></div>
      </div>
    );
  }

  return (
    <DashboardLayout
      title={`Center Dashboard: ${user.center?.nom || 'Educational'}`}
      subtitle="Iter workshop management process."
    >
      {/* Institutional Section Timeline */}
      <section className="bg-background-surface border-2 border-border-subtle p-12 mb-12 relative overflow-hidden">

        <h3 className="header-label">
          Iter 25-26 Program Status
        </h3>

        <div className="relative pt-4">
          {/* Connector line */}
          <div className="absolute top-10 left-0 w-full h-[2px] bg-gray-100 hidden md:block z-0"></div>

          <div className="flex flex-col md:flex-row justify-between items-start gap-y-12 gap-x-8">
            {loadingPhases ? (
              <div className="w-full py-8 text-center uppercase text-[10px] font-bold tracking-widest text-[#00426B]">Loading calendar...</div>
            ) : (
              phases.map((phase) => (
                <div key={phase.id_phase} className="relative flex flex-col items-center text-center flex-1 group">
                  {/* Square with number */}
                  <div
                    className={`w-12 h-12 flex items-center justify-center mb-6 z-10 border-2 transition-all ${phase.active
                      ? 'bg-consorci-darkBlue text-white border-consorci-darkBlue'
                      : 'bg-background-surface text-text-muted border-border-subtle'
                      }`}
                  >
                    <span className="text-base font-bold">
                      {phase.order}
                    </span>
                  </div>

                  {/* Name and Date */}
                  <h4 className={`font-black text-[10px] uppercase tracking-[0.1em] mb-4 min-h-[3em] flex items-center justify-center ${phase.active ? 'text-consorci-darkBlue' : 'text-text-muted'}`}>
                    {phase.name}
                  </h4>

                  <div className={`text-[10px] font-bold px-4 py-2 border-2 ${phase.active ? 'bg-consorci-darkBlue text-white border-consorci-darkBlue' : 'bg-background-surface text-text-muted border-border-subtle'}`}>
                    {new Date(phase.startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }).toUpperCase()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Direct Access - edubcn Style Cards */}
      <div className="flex justify-center w-full pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full">
          {[
            {
              title: "Student Management",
              text: "Add students from your center",
              icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
              path: "/center/students",
              active: isPhaseActive(PHASES.PLANNING) || isPhaseActive(PHASES.APPLICATION),
              phase: "General"
            },
            {
              title: "Teacher Management",
              text: "Add teachers from your center",
              icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
              path: "/center/teachers",
              active: true,
              phase: "General"
            },
            {
              title: "Request Workshops",
              text: "Request the workshops you want with the necessary places.",
              icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
              path: "/center/requests",
              active: isPhaseActive(PHASES.APPLICATION),
              phase: "Phase 1"
            },
            {
              title: "Assignments",
              text: "Assign students with the necessary documentation to previously requested workshops.",
              icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01",
              path: "/center/assignments",
              active: isPhaseActive(PHASES.PLANNING),
              phase: "Phase 2"
            },
            {
              title: "Session Management",
              text: "Add your teachers to the assigned workshops",
              icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
              path: "/center/sessions",
              active: isPhaseActive(PHASES.EXECUTION),
              phase: "Phase 3"
            },
          ].map((item, idx) => (
            <div
              key={idx}
              onClick={() => item.active && router.push(item.path)}
              className={`group bg-background-surface p-8 md:p-10 border transition-all duration-300 relative overflow-hidden ${item.active
                  ? 'border-border-subtle cursor-pointer hover:border-consorci-actionBlue hover:shadow-xl'
                  : 'border-border-subtle opacity-60 cursor-not-allowed'
                }`}
            >
              <div className={`absolute top-0 right-0 w-16 h-16 bg-background-subtle -mr-8 -mt-8 rotate-45 transition-colors duration-300 ${item.active ? 'group-hover:bg-consorci-actionBlue' : ''
                }`}></div>

              <div className={`w-16 h-16 flex items-center justify-center mb-8 border border-border-subtle transition-all duration-300 ${item.active
                  ? 'bg-background-subtle text-consorci-darkBlue group-hover:bg-consorci-darkBlue group-hover:text-white'
                  : 'bg-background-subtle text-text-muted'
                }`}>
                <div className={item.active ? 'group-hover:text-white' : ''}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                </div>
              </div>

              <h3 className={`text-xl font-medium mb-3 uppercase tracking-tight ${item.active ? 'text-consorci-darkBlue' : 'text-text-muted'
                }`}>
                {item.title}
              </h3>

              <p className="text-xs text-text-muted font-medium leading-relaxed uppercase tracking-wider">
                {item.text}
              </p>

              <div className="mt-8 flex items-center">
                <div className={`flex items-center font-bold text-[10px] uppercase tracking-[0.2em] transition-transform ${item.active ? 'text-consorci-actionBlue group-hover:translate-x-2' : 'text-text-muted'
                  }`}>
                  {item.active ? item.phase : "Module closed"}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
