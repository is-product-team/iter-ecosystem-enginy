'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from '@/context/AuthContext';
import { ROLES } from '@iter/shared';
import DashboardLayout from '@/components/DashboardLayout';
import Loading from '@/components/Loading';
import assignmentService, { Assignment } from '@/services/assignmentService';
import { KPIOverview } from '@/components/monitoring/KPIOverview';
import { AssignmentMonitorCard } from '@/components/monitoring/AssignmentMonitorCard';
import { CloseWorkshopSection } from '@/components/monitoring/CloseWorkshopSection';
import { toast } from 'sonner';

export default function MonitoringPage() {
  const t = useTranslations('Center.Monitoring');
  const tc = useTranslations('Common');
  const { user, loading: authLoading } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  
  const router = useRouter();
  const params = useParams();
  const locale = useLocale();

  useEffect(() => {
    if (!authLoading && (!user || user.role.name !== ROLES.COORDINATOR)) {
      router.push(`/${locale}/login`);
    }
  }, [user, authLoading, router, locale]);

  const fetchData = async () => {
    if (user && user.center?.centerId) {
      try {
        const data = await assignmentService.getByCenter(user.center.centerId);
        setAssignments(data);
      } catch (error) {
        console.error('Error fetching monitoring data:', error);
        toast.error(tc('loading_error'));
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Compute Stats for KPIOverview
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const active = assignments.filter(a => a.status === 'IN_PROGRESS' || a.status === 'READY_TO_START');
    
    let sessionsToday = 0;
    const pendingAttendance = 0;
    const incidents = 0; // Mocked for now as we don't have a service yet

    active.forEach(a => {
      a.sessions?.forEach(s => {
        if (s.sessionDate.startsWith(today)) {
          sessionsToday++;
        }
      });
      
      // Potential pending attendance: sessions in the past without attendance full
      const pastSessions = a.sessions?.filter(s => new Date(s.sessionDate) < new Date()) || [];
      pastSessions.forEach(s => {
        // If it was more than 1 hour ago and no attendance records...
        // This is a simplification
      });
    });

    return {
      sessionsToday,
      pendingAttendance,
      activeAssignments: active.length,
      incidents
    };
  }, [assignments]);

  if (authLoading || loading) return <Loading fullScreen message={tc('loading')} />;

  // Filter assignments for the list (e.g., only those relevant for monitoring)
  const monitorableAssignments = assignments.filter(a => 
    a.status === 'IN_PROGRESS' || a.status === 'READY_TO_START' || a.status === 'VALIDATED'
  );

  return (
    <DashboardLayout
      title={t('title')}
      subtitle={t('description')}
    >
      <div className="w-full pb-20">
        <KPIOverview stats={stats} />

        <div className="flex flex-col gap-10">
          <div className="flex items-center justify-between border-b border-border-subtle pb-6">
            <h3 className="text-xl font-medium text-text-primary tracking-tight">{t('tabs.active')}</h3>
          </div>

          {selectedAssignment && (
            <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-500 relative">
              <div className="flex justify-between items-center mb-4 bg-indigo-600 text-white p-4">
                <span className="text-xs font-bold uppercase tracking-widest">{locale === 'ca' ? 'PROCÉS DE TANCAMENT FINAL' : 'PROCESO DE CIERRE FINAL'}</span>
                <button 
                  onClick={() => setSelectedAssignment(null)}
                  className="text-white hover:text-indigo-200 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <CloseWorkshopSection 
                assignment={selectedAssignment} 
                onSuccess={() => {
                  setSelectedAssignment(null);
                  fetchData();
                }}
              />
            </div>
          )}

          {monitorableAssignments.length === 0 ? (
            <div className="p-20 text-center bg-background-surface border border-dashed border-border-subtle">
              <p className="text-sm text-text-muted font-medium italic">{t('no_assignments')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {monitorableAssignments.map(a => (
                <AssignmentMonitorCard 
                  key={a.assignmentId} 
                  assignment={a} 
                  onCloseClick={(clickedAssig) => {
                    setSelectedAssignment(clickedAssig);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
