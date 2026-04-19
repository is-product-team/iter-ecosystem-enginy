'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from '@/context/AuthContext';
import { ROLES } from '@iter/shared';
import DashboardLayout from '@/components/DashboardLayout';
import Loading from '@/components/Loading';
import assignmentService, { Assignment } from '@/services/assignmentService';
import questionnaireService from '@/services/questionnaireService';
import { TeacherEvaluationsTable } from '@/components/monitoring/TeacherEvaluationsTable';
import { AssignmentMonitorCard } from '@/components/monitoring/AssignmentMonitorCard';
import { TeacherFeedback } from '@/components/monitoring/TeacherFeedback';
import { toast } from 'sonner';
import Button from '@/components/ui/Button';

export default function ClosurePage() {
  const t = useTranslations('Center.Monitoring');
  const tc = useTranslations('Common');
  const { user, loading: authLoading } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedbackAssignment, setFeedbackAssignment] = useState<Assignment | null>(null);
  const [feedbackData, setFeedbackData] = useState<any[] | null>(null);
  
  const router = useRouter();
  const locale = useLocale();

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
        console.error('Error fetching closure data:', error);
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
    } else {
        setFeedbackData(null);
    }
  }, [feedbackAssignment, fetchFeedback]);

  if (authLoading || loading) return <Loading fullScreen message={tc('loading')} />;

  const completedAssignments = assignments.filter(a => a.status === 'COMPLETED');

  return (
    <DashboardLayout
      title={t('tabs.completed')}
      subtitle="Resultats, avaluacions docents i historial de certificacions."
    >
      <div className="w-full pb-20 space-y-16">
        
        {/* Evaluations Section */}
        <section className="space-y-8 animate-in fade-in duration-500">
            <div className="border-b border-border-subtle pb-4">
                <h3 className="text-xl font-bold uppercase tracking-tight text-text-primary">Avaluacions del Docent</h3>
            </div>

            {evaluations.length > 0 ? (
                <TeacherEvaluationsTable 
                    evaluations={evaluations} 
                    onViewDetails={(assignmentId) => {
                        const assignment = assignments.find(a => a.assignmentId === assignmentId);
                        if (assignment) {
                            setFeedbackAssignment(assignment);
                            setTimeout(() => {
                                document.getElementById('feedback-section')?.scrollIntoView({ behavior: 'smooth' });
                            }, 100);
                        }
                    }} 
                />
            ) : (
                <div className="p-12 text-center bg-background-surface border border-dashed border-border-subtle italic text-text-muted">
                    No hi ha avaluacions registrades encara.
                </div>
            )}
        </section>

        {/* Teacher Feedback Detail Overlay-like section */}
        {feedbackAssignment && feedbackData && (
          <section id="feedback-section" className="animate-in fade-in slide-in-from-bottom-4 duration-500 relative flex flex-col gap-0 border border-consorci-lightBlue shadow-2xl">
            <div className="flex justify-between items-center bg-background-subtle border-b border-consorci-lightBlue/20 p-8">
              <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-consorci-lightBlue mb-1">
                      {t('Feedback.title')}
                  </span>
                  <span className="text-xl font-black uppercase tracking-tighter text-text-primary">
                      {feedbackAssignment.workshop?.title}
                  </span>
              </div>
              <Button 
                onClick={() => setFeedbackAssignment(null)}
                variant="subtle"
                size="sm"
                className="text-text-muted hover:!text-consorci-darkBlue !p-2"
              >
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </Button>
            </div>

            <div className="p-0">
              <TeacherFeedback responses={feedbackData} />
            </div>
          </section>
        )}

        {/* Completed History Section */}
        <section className="space-y-8 pt-10 border-t border-border-subtle">
            <div className="border-b border-border-subtle pb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold uppercase tracking-tight text-text-primary">Historial de Tallers</h3>
              <span className="text-[10px] font-black text-consorci-darkBlue bg-consorci-darkBlue/5 px-3 py-1 border border-consorci-darkBlue/10 uppercase tracking-widest">
                {completedAssignments.length} completats
              </span>
            </div>

            {completedAssignments.length === 0 ? (
                <div className="p-20 text-center bg-background-subtle/30 border border-border-subtle italic text-[11px] text-text-muted uppercase tracking-widest">
                    No hi ha tallers finalitzats en l&apos;historial
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 opacity-90">
                    {completedAssignments.map(a => (
                        <AssignmentMonitorCard 
                            key={a.assignmentId} 
                            assignment={a} 
                        />
                    ))}
                </div>
            )}
        </section>

      </div>
    </DashboardLayout>
  );
}
