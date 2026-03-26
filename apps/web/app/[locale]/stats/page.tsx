'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import statsService, { StatusStat, PopularStat } from '@/services/statsService';
import Loading from '@/components/Loading';
import { toast } from 'sonner';
import {
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import {
  StatusDistribution,
  WorkshopPopularity
} from '@/components/ChartComponents';

export default function AdminStatsPage() {
  const { user, loading: authLoading } = useAuth();
  const [statusStats, setStatusStats] = useState<StatusStat[]>([]);
  const [popularStats, setPopularStats] = useState<PopularStat[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  const fetchData = async () => {
    try {
      const [statusData, popularData] = await Promise.all([
        statsService.getByStatus(),
        statsService.getPopular()
      ]);
      setStatusStats(statusData);
      setPopularStats(popularData);
    } catch (err) {
      console.error("Error fetching stats:", err);
      toast.error('Error al carregar les estadístiques.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && (!user || user.rol.nom_rol !== 'ADMIN')) {
      router.push('/login');
      return;
    }

    if (user) {
      fetchData();
    }
  }, [user, authLoading, router]);

  if (authLoading || !user || loading) {
    return <Loading fullScreen message="Generant analítica professional..." />;
  }

  return (
    <DashboardLayout
      title="Dashboard Analític"
      subtitle="Visualització de dades de gestió del programa"
    >
      <div className="space-y-8 animate-in fade-in duration-700">

        {/* Header Ribbon */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-background-surface p-6 text-text-primary shadow-sm border-l-8 border-consorci-darkBlue">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-5 h-5 text-consorci-lightBlue" />
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-consorci-lightBlue">
                SECURE DATA HUB ACTIVE
              </div>
            </div>
            <h2 className="text-xl font-black uppercase tracking-tight text-consorci-darkBlue">Estadístiques de Gestió</h2>
          </div>
          <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
            <div className="text-right">
              <div className="text-[10px] font-black text-text-muted uppercase mb-0.5 tracking-tighter">Total Peticions</div>
              <div className="text-3xl font-black leading-none text-consorci-darkBlue">
                {statusStats.reduce((acc, s) => acc + s.total, 0)}
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid: Charts & Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Status Distribution (Pie) */}
          <div className="lg:col-span-1 flex flex-col bg-background-surface border border-border-subtle shadow-sm transition-all hover:shadow-md hover:border-consorci-lightBlue/30 group">
            <div className="p-6 border-b border-border-subtle flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-consorci-actionBlue" />
                <h3 className="text-[10px] font-black text-consorci-darkBlue dark:text-consorci-lightBlue uppercase tracking-widest">Estat de Peticions</h3>
              </div>
              <TrendingUp className="w-4 h-4 text-green-500 opacity-50 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="p-6 flex-1 flex flex-col justify-center">
              <StatusDistribution data={statusStats} />
              <div className="mt-4 grid grid-cols-2 gap-2">
                {statusStats.map((s, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-background-subtle p-2 border-l-2 border-consorci-darkBlue dark:border-consorci-lightBlue">
                    <span className="text-[9px] font-bold text-text-secondary uppercase">{s.estat}</span>
                    <span className="text-xs font-black text-consorci-darkBlue dark:text-consorci-lightBlue">{s.total}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Workshop Popularity (Bar) */}
          <div className="lg:col-span-2 flex flex-col bg-background-surface border border-border-subtle shadow-sm transition-all hover:shadow-md hover:border-consorci-lightBlue/30">
            <div className="p-6 border-b border-border-subtle flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-consorci-actionBlue" />
              <h3 className="text-[10px] font-black text-consorci-darkBlue dark:text-consorci-lightBlue uppercase tracking-widest">Demanda Global de Tallers</h3>
            </div>
            <div className="p-6 flex-1">
              <WorkshopPopularity data={popularStats} />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
