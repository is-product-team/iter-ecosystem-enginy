'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

interface KPIProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}

const KPICard: React.FC<KPIProps> = ({ label, value, icon, color }) => (
  <div className="bg-background-surface p-8 border border-border-subtle group hover:border-consorci-darkBlue transition-all duration-300">
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 bg-background-subtle rounded-none border border-border-subtle group-hover:bg-consorci-darkBlue group-hover:text-white transition-all duration-300 ${color}`}>
        {icon}
      </div>
      <span className="text-3xl font-medium text-text-primary tracking-tight">{value}</span>
    </div>
    <h4 className="text-[11px] font-medium text-text-muted uppercase tracking-widest">{label}</h4>
  </div>
);

interface KPIOverviewProps {
  stats: {
    sessionsToday: number;
    pendingAttendance: number;
    activeAssignments: number;
    incidents: number | string;
  };
}

export const KPIOverview: React.FC<KPIOverviewProps> = ({ stats }) => {
  const t = useTranslations('Center.Monitoring.KPI');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      <KPICard
        label={t('sessions_today')}
        value={stats.sessionsToday}
        color="text-consorci-actionBlue"
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />
      <KPICard
        label={t('pending_attendance')}
        value={stats.pendingAttendance}
        color={stats.pendingAttendance > 0 ? "text-consorci-pinkRed" : "text-consorci-green"}
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        }
      />
      <KPICard
        label={t('active_assignments')}
        value={stats.activeAssignments}
        color="text-consorci-darkBlue"
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        }
      />
      <KPICard
        label={t('incidents')}
        value={stats.incidents}
        color={typeof stats.incidents === 'number' && stats.incidents > 0 ? "text-consorci-pinkRed" : "text-text-muted"}
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        }
      />
    </div>
  );
};
