'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from '@/context/AuthContext';
import { ROLES } from '@iter/shared';
import DashboardLayout from '@/components/DashboardLayout';
import Loading from '@/components/Loading';
import assignmentService, { Assignment } from '@/services/assignmentService';
import questionnaireService from '@/services/questionnaireService';
import { KPIOverview } from '@/components/monitoring/KPIOverview';
import { TeacherEvaluationsTable } from '@/components/monitoring/TeacherEvaluationsTable';
import { AssignmentMonitorCard } from '@/components/monitoring/AssignmentMonitorCard';
import { CloseWorkshopSection } from '@/components/monitoring/CloseWorkshopSection';
import { TeacherFeedback } from '@/components/monitoring/TeacherFeedback';
import { toast } from 'sonner';
import Button from '@/components/ui/Button';

export default function MonitoringPage() {
  const t = useTranslations('Center.Monitoring');
  const tc = useTranslations('Common');
  const { user, loading: authLoading } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [feedbackAssignment, setFeedbackAssignment] = useState<Assignment | null>(null);
  const [feedbackData, setFeedbackData] = useState<any[] | null>(null);
  
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = useLocale();

  // Tab management
  const activeTab = searchParams.get('tab') || 'active';

  useEffect(() => {
    if (!authLoading && (!user || user.role.name !== ROLES.COORDINATOR)) {
      router.push(`/${locale}/login`);
    }
  }, [user, authLoading, router, locale]);

  const fetchData = useCallback(async () => {
    if (user && user.center?.centerId) {
      try {
        const [assignmentsData, evaluationsData] = await Promise.all([
          assignmentService.getByCenter(user.center.centerId),
          questionnaireService.getEvaluationsList()
        ]);
        setAssignments(assignmentsData);
        setEvaluations(evaluationsData);
      } catch (error) {
        console.error('Error fetching monitoring data:', error);
        toast.error(tc('loading_error'));
      } finally {
        setLoading(false);
      }
    }
  }, [user, tc]);

  const fetchFeedback = useCallback(async (assignmentId: number) => {
    try {
        const data = await questionnaireService.getAssignmentEvaluation(assignmentId);
        setFeedbackData(data);
    } catch (_error) {
        setFeedbackData(null);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (feedbackAssignment) {
        fetchFeedback(feedbackAssignment.assignmentId);
        setSelectedAssignment(null); // Clear top closure view when viewing feedback
    } else {
        setFeedbackData(null);
    }
  }, [feedbackAssignment, fetchFeedback]);

  useEffect(() => {
    if (selectedAssignment) {
        setFeedbackAssignment(null); // Clear bottom feedback view when managing a workshop
    }
  }, [selectedAssignment]);

  // Compute Stats for KPIOverview
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const active = assignments.filter(a => a.status === 'IN_PROGRESS' || a.status === 'READY_TO_START');

    let sessionsToday = 0;
    let pendingAttendance = 0;
    const incidents = 0; // Mocked for now as we don't have a service yet

    active.forEach(a => {
      const sessions = a.sessions || [];
      sessions.forEach(s => {
        if (s.sessionDate.startsWith(today)) {
          sessionsToday++;
        }
      });
      
      // Real pending attendance calculation: 
      // Sessions in the past that don't have attendance records yet
      const pastSessions = sessions.filter(s => new Date(s.sessionDate) < new Date());
      pastSessions.forEach(s => {
        const hasAttendance = s.attendance && s.attendance.length > 0;
        if (!hasAttendance) {
          pendingAttendance++;
        }
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

  // Filter assignments based on active tab
  const filteredAssignments = assignments.filter(a => {
    if (activeTab === 'completed') {
      return a.status === 'COMPLETED';
    }
    // Default: Active ones
    return a.status === 'IN_PROGRESS' || a.status === 'READY_TO_START' || a.status === 'VALIDATED';
  });

  const handleTabChange = (tab: string) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('tab', tab);
    router.push(`/${locale}/center/monitoring?${newParams.toString()}`);
  };

  return (
    <DashboardLayout
      title={t('title')}
      subtitle={t('description')}
    >
      <div className="w-full pb-20">
        <KPIOverview stats={stats} />

        <div className="flex flex-col gap-16 mt-12">
          {/* Active Workshops Section */}
          <section className="space-y-8">
            <div className="border-b border-border-subtle pb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold uppercase tracking-tight text-text-primary">{t('tabs.active')}</h3>
              <span className="text-[10px] font-black text-consorci-darkBlue bg-consorci-darkBlue/5 px-3 py-1 border border-consorci-darkBlue/10 uppercase tracking-widest">
                {assignments.filter(a => a.status !== 'COMPLETED').length} {t('tabs.active').toLowerCase()}
              </span>
            </div>

            {selectedAssignment && (
              <div id="closure-section" className="animate-in fade-in slide-in-from-top-4 duration-500 relative flex flex-col gap-0 border border-border-subtle shadow-2xl z-20">
                {/* Closure Header */}
                <div className="flex justify-between items-center bg-consorci-darkBlue text-white p-8">
                  <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60 mb-1">
                          {locale === 'ca' ? 'GESTIÓ DE TANCAMENT' : 'GESTIÓN DE CIERRE'}
                      </span>
                      <span className="text-2xl font-black uppercase tracking-tighter">
                          {selectedAssignment.workshop?.title}
                      </span>
                  </div>
                  <Button 
                    onClick={() => setSelectedAssignment(null)}
                    variant="subtle"
                    size="sm"
                    className="text-white hover:!text-consorci-lightBlue !p-2"
                  >
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
                  </Button>
                </div>

                {/* Closure Section Only */}
                <div className="bg-background-surface p-0">
                  <CloseWorkshopSection 
                      assignment={selectedAssignment} 
                      onSuccess={() => {
                          setSelectedAssignment(null);
                          fetchData();
                      }}
                  />
                </div>
              </div>
            )}

            {assignments.filter(a => a.status !== 'COMPLETED').length === 0 ? (
              <div className="p-20 text-center bg-background-surface border border-dashed border-border-subtle">
                <p className="text-sm text-text-muted font-medium italic">{t('no_assignments')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {assignments.filter(a => a.status !== 'COMPLETED').map(a => (
                  <AssignmentMonitorCard 
                    key={a.assignmentId} 
                    assignment={a} 
                    onCloseClick={(clickedAssig) => {
                      setSelectedAssignment(clickedAssig);
                      window.scrollTo({ top: 400, behavior: 'smooth' });
                    }}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}
