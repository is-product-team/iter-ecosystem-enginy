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
import SatisfactionCharts from '@/components/SatisfactionCharts';
import { toast } from 'sonner';

export default function MonitoringPage() {
  const t = useTranslations('Center.Monitoring');
  const commonT = useTranslations('Common');
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Phase 4 Analytics State
  const [selectedAssignmentStats, setSelectedAssignmentStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'COMPLETED'>('ACTIVE');

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

  const handleFetchStats = async (assignmentId: number) => {
    setLoadingStats(true);
    try {
      const response = await getApi().get(`/certificates/stats/${assignmentId}`);
      setSelectedAssignmentStats({ id: assignmentId, ...response.data });
    } catch (err) {
      toast.error(t('error_load_analytics'));
    } finally {
      setLoadingStats(false);
    }
  };

  const handleDownloadZip = async (assignmentId: number) => {
    try {
      const response = await getApi().get(`/certificates/download-bulk/${assignmentId}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificats_taller_${assignmentId}.zip`);
      document.body.appendChild(link);
      link.click();
      toast.success(t('success_download_zip'));
    } catch (err) {
      toast.error(t('error_download_zip'));
    }
  };

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

  const activeAssignments = stats.assignments.filter((a: any) => a.status !== 'COMPLETED');
  const completedAssignments = stats.assignments.filter((a: any) => a.status === 'COMPLETED');

  return (
    <DashboardLayout title={t('title')} subtitle={t('subtitle')}>
      <KPIOverview 
        stats={{
          sessionsToday: stats.summary.sessionsToday,
          pendingAttendance: stats.summary.totalPendingAttendance,
          activeAssignments: activeAssignments.length,
          incidents: stats.incidents.length
        }} 
      />

      {/* Tab Switcher */}
      <div className="flex border-b border-gray-100 mb-10 gap-8">
        <button 
          onClick={() => setActiveTab('ACTIVE')}
          className={`pb-4 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'ACTIVE' ? 'text-[#00426B] border-b-2 border-[#00426B]' : 'text-gray-400'}`}
        >
          {t('tabs.active')}
        </button>
        <button 
          onClick={() => setActiveTab('COMPLETED')}
          className={`pb-4 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'COMPLETED' ? 'text-[#00426B] border-b-2 border-[#00426B]' : 'text-gray-400'}`}
        >
          {t('tabs.completed')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          {activeTab === 'ACTIVE' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeAssignments.map((assignment: any) => (
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
              {activeAssignments.length === 0 && (
                <div className="col-span-full py-12 text-center bg-background-subtle border border-dashed border-border-subtle text-text-muted text-[11px] font-medium uppercase tracking-widest">
                  {t('no_active_assignments')}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {completedAssignments.map((assignment: any) => (
                <div key={assignment.assignmentId} className="bg-white border-2 border-gray-100 p-6 flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm">
                  <div>
                    <h4 className="text-sm font-black text-[#00426B] uppercase tracking-tight">{assignment.title}</h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">
                      {t('finished_on', { date: new Date().toLocaleDateString() })}
                    </p>
                  </div>
                  <div className="flex gap-4 w-full md:w-auto">
                    <button 
                      onClick={() => handleFetchStats(assignment.assignmentId)}
                      className="flex-1 md:flex-none px-6 py-3 bg-gray-50 border border-gray-100 text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all"
                    >
                      {t('view_analytics')}
                    </button>
                    <button 
                      onClick={() => handleDownloadZip(assignment.assignmentId)}
                      className="flex-1 md:flex-none px-6 py-3 bg-[#00426B] text-white text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all"
                    >
                      {t('certificates_zip')}
                    </button>
                  </div>
                </div>
              ))}
              
              {/* Analytics Display Area */}
              {selectedAssignmentStats && (
                <div className="mt-12 pt-12 border-t-2 border-dashed border-gray-100">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-black text-[#00426B] uppercase tracking-tighter">{t('quality_report')}</h3>
                    <button onClick={() => setSelectedAssignmentStats(null)} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      {t('close')}
                    </button>
                  </div>
                  <SatisfactionCharts data={selectedAssignmentStats} />
                </div>
              )}

              {completedAssignments.length === 0 && (
                <div className="py-12 text-center bg-background-subtle border border-dashed border-border-subtle text-text-muted text-[11px] font-medium uppercase tracking-widest">
                  {t('no_completed_assignments')}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 3. Incident Sidebar */}
        <div className="lg:col-span-1">
          <IncidentFeed incidents={stats.incidents.map((inc: any) => ({
            id: inc.issueId,
            title: t('incident_id', { id: inc.issueId }),
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
