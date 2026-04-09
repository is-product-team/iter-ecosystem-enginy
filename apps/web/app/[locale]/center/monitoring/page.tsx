'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/context/AuthContext';
import getApi from '@/services/api';
import DashboardLayout from '@/components/DashboardLayout';
import { KPIOverview } from '@/components/monitoring/KPIOverview';
import { AssignmentMonitorCard } from '@/components/monitoring/AssignmentMonitorCard';
import { IncidentFeed } from '@/components/monitoring/IncidentFeed';
import Loading from '@/components/Loading';

export default function MonitoringPage() {
  const t = useTranslations('Center.Monitoring');
  const commonT = useTranslations('Common');
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.centerId) return;
      
      try {
        setLoading(true);
        const response = await getApi().get(`/phase3/center/${user.centerId}/stats`);
        setStats(response.data);
      } catch (err) {
        console.error('Error fetching monitoring stats:', err);
        setError(commonT('loading_error'));
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user, commonT]);

  if (loading) return <Loading />;

  if (error || !stats) {
    return (
      <DashboardLayout title={t('title')} subtitle={t('subtitle')}>
        <div className="bg-background-surface border border-border-subtle p-12 text-center text-consorci-pinkRed font-medium">
          {error || commonT('loading_error')}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={t('title')} subtitle={t('subtitle')}>
      {/* 1. KPIs Section */}
      <KPIOverview 
        stats={{
          sessionsToday: stats.summary.sessionsToday,
          pendingAttendance: stats.summary.totalPendingAttendance,
          activeAssignments: stats.assignments.length,
          incidents: stats.incidents.length
        }} 
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* 2. Active Workshops Progress (Main column) */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex justify-between items-center mb-6 px-1">
             <h3 className="text-[12px] font-medium text-text-muted uppercase tracking-widest">{t('Assignments.title')}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stats.assignments.map((assignment: any) => (
              <AssignmentMonitorCard 
                key={assignment.assignmentId} 
                assignment={{
                  id: assignment.assignmentId,
                  workshopName: assignment.title,
                  modality: assignment.modality,
                  centerName: assignment.centerName,
                  progress: assignment.progress,
                  attendanceHealth: assignment.health,
                  hasStaffGap: assignment.hasStaffGap,
                  sessionsCompleted: assignment.totalSessions - assignment.pendingAttendance,
                  totalSessions: assignment.totalSessions,
                  nextSessionDate: assignment.nextSession?.date || null
                }}
              />
            ))}
            {stats.assignments.length === 0 && (
              <div className="col-span-full py-12 text-center bg-background-subtle border border-dashed border-border-subtle text-text-muted text-[11px] font-medium uppercase tracking-widest">
                {t('no_assignments')}
              </div>
            )}
          </div>
        </div>

        {/* 3. Incident Sidebar */}
        <div className="lg:col-span-1">
          <IncidentFeed incidents={stats.incidents.map((inc: any) => ({
            id: inc.issueId,
            title: `Incidència #${inc.issueId}`,
            description: inc.description,
            type: inc.type,
            createdAt: inc.createdAt,
            status: inc.status,
            workshopName: inc.assignment?.workshop?.title
          }))} />
        </div>
      </div>
    </DashboardLayout>
  );
}
