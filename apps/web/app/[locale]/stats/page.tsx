'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import statsService, { StatusStat, PopularStat } from '@/services/statsService';
import Loading from '@/components/Loading';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('Admin.Stats');
  const tc = useTranslations('Common');

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
      toast.error(tc('error_loading'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && (!user || user.role.name !== 'ADMIN')) {
      router.push('/login');
      return;
    }

    if (user) {
      fetchData();
    }
  }, [user, authLoading, router]);

  if (authLoading || !user || loading) {
    return <Loading fullScreen message={tc('loading')} />;
  }

  return (
    <DashboardLayout
      title={t('management_stats')}
      subtitle={t('description')}
    >
      <div className="space-y-8 animate-in fade-in duration-700">

        {/* Header Ribbon */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-background-surface p-8 text-text-primary border border-border-subtle">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <ShieldCheck className="w-5 h-5 text-consorci-darkBlue" strokeWidth={1.5} />
              <div className="text-[12px] font-medium text-text-muted">
                {t('secure_hub')}
              </div>
            </div>
            <h2 className="text-2xl font-medium tracking-tight text-text-primary leading-none">{t('management_stats')}</h2>
          </div>
          <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
            <div className="text-right">
              <div className="text-[11px] font-medium text-text-muted mb-1">{t('total_requests')}</div>
              <div className="text-4xl font-medium leading-none text-text-primary">
                {statusStats.reduce((acc, s) => acc + s.total, 0)}
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid: Charts & Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Status Distribution (Pie) */}
          <div className="lg:col-span-1 flex flex-col bg-background-surface border border-border-subtle group">
            <div className="p-6 border-b border-border-subtle flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-consorci-darkBlue" strokeWidth={1.5} />
                <h3 className="text-[12px] font-medium text-text-primary">{t('request_status')}</h3>
              </div>
              <TrendingUp className="w-4 h-4 text-green-500 opacity-50 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="p-6 flex-1 flex flex-col justify-center">
              <StatusDistribution data={statusStats} />
              <div className="mt-4 grid grid-cols-2 gap-2">
                {statusStats.map((s, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-background-subtle p-3 border-l-2 border-consorci-darkBlue">
                    <span className="text-[11px] font-medium text-text-secondary">{s.status}</span>
                    <span className="text-xs font-medium text-text-primary">{s.total}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Workshop Popularity (Bar) */}
          <div className="lg:col-span-2 flex flex-col bg-background-surface border border-border-subtle">
            <div className="p-6 border-b border-border-subtle flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-consorci-darkBlue" strokeWidth={1.5} />
              <h3 className="text-[12px] font-medium text-text-primary">{t('global_demand')}</h3>
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
