'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { THEME, PHASES } from '@iter/shared';
import DashboardLayout from '@/components/DashboardLayout';
import getApi from '@/services/api';

interface Fase {
  id_phase: number;
  nom: string;
  descripcio: string;
  data_inici: string;
  data_fi: string;
  activa: boolean;
  ordre: number;
}

export default function CentroDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [fases, setFases] = useState<Fase[]>([]);
  const [loadingFases, setLoadingFases] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && (!user || user.rol.nom_rol !== 'COORDINADOR')) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchFases = async () => {
      try {
        const api = getApi();
        const response = await api.get("/fases");
        setFases(response.data.data);
      } catch (error) {
        console.error("Error fetching phases:", error);
      } finally {
        setLoadingFases(false);
      }
    };

    if (user && user.rol.nom_rol === 'COORDINADOR') {
      fetchFases();
    }
  }, [user]);

  const isPhaseActive = (nomFase: string) => {
    const fase = fases.find(f => f.nom === nomFase);
    return fase ? fase.activa : false;
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
      title={`Panell de Centre: ${user.centre?.nom || 'Educatiu'}`}
      subtitle="Procés de gestió de tallers d'Iter."
    >
      {/* Timeline Secció Institucional */}
      <section className="bg-background-surface border-2 border-border-subtle p-12 mb-12 relative overflow-hidden">
        
        <h3 className="header-label">
          Estat del Programa Iter 25-26
        </h3>

        <div className="relative pt-4">
          {/* Connector line */}
          <div className="absolute top-10 left-0 w-full h-[2px] bg-gray-100 hidden md:block z-0"></div>

          <div className="flex flex-col md:flex-row justify-between items-start gap-y-12 gap-x-8">
            {loadingFases ? (
              <div className="w-full py-8 text-center uppercase text-[10px] font-bold tracking-widest text-[#00426B]">Carregant calendari...</div>
            ) : (
              fases.map((fase) => (
                <div key={fase.id_phase} className="relative flex flex-col items-center text-center flex-1 group">
                  {/* Square with number */}
                  <div
                    className={`w-12 h-12 flex items-center justify-center mb-6 z-10 border-2 transition-all ${fase.activa
                      ? 'bg-consorci-darkBlue text-white border-consorci-darkBlue'
                      : 'bg-background-surface text-text-muted border-border-subtle'
                      }`}
                  >
                    <span className="text-base font-bold">
                      {fase.ordre}
                    </span>
                  </div>
                  
                  {/* Name and Date */}
                  <h4 className={`font-black text-[10px] uppercase tracking-[0.1em] mb-4 min-h-[3em] flex items-center justify-center ${fase.activa ? 'text-consorci-darkBlue' : 'text-text-muted'}`}>
                    {fase.nom}
                  </h4>
                  
                  <div className={`text-[10px] font-bold px-4 py-2 border-2 ${fase.activa ? 'bg-consorci-darkBlue text-white border-consorci-darkBlue' : 'bg-background-surface text-text-muted border-border-subtle'}`}>
                    {new Date(fase.data_inici).toLocaleDateString('ca-ES', { day: 'numeric', month: 'short' }).replace('.', '').toUpperCase()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Accesos Directos - Targetes Estil edubcn */}
      <div className="flex justify-center w-full pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full">
          {[
            { 
              title: "Gestió Alumnat", 
              text: "Afegeix els alumnes del teu centre", 
              icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
              path: "/centro/alumnos",
              active: isPhaseActive(PHASES.PLANIFICACION) || isPhaseActive(PHASES.SOLICITUD),
              phase: "General"
            },
            { 
              title: "Gestió Professors", 
              text: "Afegeix els professors del teu centre", 
              icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
              path: "/centro/profesores",
              active: true,
              phase: "General"
            },
            { 
              title: "Solicitar Tallers", 
              text: "Solicita els tallers que vols amb les plaçes necessàries.", 
              icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
              path: "/centro/peticions",
              active: isPhaseActive(PHASES.SOLICITUD),
              phase: "Fase 1"
            },
            { 
              title: "Assignacions", 
              text: "Asigna els alumnes amb la documentació necessaria als tallers previament sol·licitats.", 
              icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01",
              path: "/centro/assignacions",
              active: isPhaseActive(PHASES.PLANIFICACION),
              phase: "Fase 2"
            },
            { 
              title: "Gestió Sessions", 
              text: "Afegeix els teus professors als tallers assignats", 
              icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
              path: "/centro/sessions",
              active: isPhaseActive(PHASES.EJECUCION),
              phase: "Fase 3"
            },
          ].map((item, idx) => (
            <div
              key={idx}
              onClick={() => item.active && router.push(item.path)}
              className={`group bg-background-surface p-8 md:p-10 border transition-all duration-300 relative overflow-hidden ${
                item.active
                  ? 'border-border-subtle cursor-pointer hover:border-consorci-actionBlue hover:shadow-xl'
                  : 'border-border-subtle opacity-60 cursor-not-allowed'
              }`}
            >
              <div className={`absolute top-0 right-0 w-16 h-16 bg-background-subtle -mr-8 -mt-8 rotate-45 transition-colors duration-300 ${
                item.active ? 'group-hover:bg-consorci-actionBlue' : ''
              }`}></div>

              <div className={`w-16 h-16 flex items-center justify-center mb-8 border border-border-subtle transition-all duration-300 ${
                item.active 
                  ? 'bg-background-subtle text-consorci-darkBlue group-hover:bg-consorci-darkBlue group-hover:text-white' 
                  : 'bg-background-subtle text-text-muted'
              }`}>
                <div className={item.active ? 'group-hover:text-white' : ''}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                </div>
              </div>
              
              <h3 className={`text-xl font-medium mb-3 uppercase tracking-tight ${
                item.active ? 'text-consorci-darkBlue' : 'text-text-muted'
              }`}>
                {item.title}
              </h3>
              
              <p className="text-xs text-text-muted font-medium leading-relaxed uppercase tracking-wider">
                {item.text}
              </p>

              <div className="mt-8 flex items-center">
                <div className={`flex items-center font-bold text-[10px] uppercase tracking-[0.2em] transition-transform ${
                  item.active ? 'text-consorci-actionBlue group-hover:translate-x-2' : 'text-text-muted'
                }`}>
                  {item.active ? item.phase : "Mòdul tancat"}
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
