'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { getUser, User } from '@/lib/auth';
import { ROLES } from '@iter/shared';
import DashboardLayout from '@/components/DashboardLayout';
import assignmentService, { Assignment, Enrollment } from '@/services/assignmentService';
import studentService, { Student } from '@/services/studentService';
import Loading from '@/components/Loading';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
import Avatar from '@/components/Avatar';
import getApi from '@/services/api';

const StudentSelectionDrawer = dynamic(() => import('@/components/StudentSelectionDrawer'), { ssr: false });
const Phase2Table = dynamic(() => import('@/components/Phase2Table'), { ssr: false });
const BulkDocumentUpload = dynamic(() => import('@/components/BulkDocumentUpload'), { ssr: false });

export default function AssignmentDetailsPage() {
  const t = useTranslations('AssignmentWorkshopsPage');
  const tCommon = useTranslations('Common');
  const params = useParams();
  const id = params?.id as string;
  const locale = params?.locale || 'ca';

  const [user, setUser] = useState<User | null>(null);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const currentUser = getUser();
    if (!currentUser || currentUser.role.name !== ROLES.COORDINATOR) {
      router.push(`/${locale}/login`);
      return;
    }
    setUser(currentUser);

    const fetchData = async () => {
      if (!id) return;
      try {
        const resAssig = await assignmentService.getById(parseInt(id));
        setAssignment(resAssig);
      } catch (_error) {
        toast.error(tCommon('loading_error'));
        router.push(`/${locale}/center/assignments`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, router, locale, tCommon]);

  const handleRemoveStudent = async (studentId: number) => {
    try {
      if (!assignment || !id) return;
      const currentIds = assignment.enrollments?.map((i: Enrollment) => i.studentId) || [];
      const updated = await assignmentService.updateEnrollments(parseInt(id), currentIds.filter((sid: number) => sid !== studentId));
      setAssignment(updated);
      toast.success(t('remove_student_success'));
    } catch (error) {
      toast.error(tCommon('save_error'));
    }
  };

  const handleUpdateEnrollments = async (studentIds: number[]) => {
    try {
      if (!id) return;
      const updated = await assignmentService.updateEnrollments(parseInt(id), studentIds);
      setAssignment(updated);
      toast.success(tCommon('success'));
    } catch (error) {
      toast.error(tCommon('save_error'));
    }
  };

  const refreshData = async () => {
    try {
      if (!id) return;
      const resAssig = await assignmentService.getById(parseInt(id));
      setAssignment(resAssig);
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  const STATUS_MAP: Record<string, string> = {
    'PROVISIONAL': locale === 'ca' ? 'PROVISIONAL' : 'PROVISIONAL',
    'PUBLISHED': locale === 'ca' ? 'PUBLICAT' : 'PUBLICADO',
    'DATA_ENTRY': locale === 'ca' ? 'PENDENT GESTIÓ' : 'PENDIENTE GESTIÓN',
    'DATA_SUBMITTED': locale === 'ca' ? 'DADES ENVIADES' : 'DATOS ENVIADOS',
    'VALIDATED': locale === 'ca' ? 'CONFIRMAT' : 'CONFIRMADO',
    'READY_TO_START': locale === 'ca' ? 'LLEST PER COMENÇAR' : 'LISTO PARA EMPEZAR',
    'VACANT': locale === 'ca' ? 'VACANT' : 'VACANTE',
    'IN_PROGRESS': locale === 'ca' ? 'EN EXECUCIÓ' : 'EN EJECUCIÓN',
    'COMPLETED': locale === 'ca' ? 'FINALITZAT' : 'FINALIZADO',
    'CANCELLED': locale === 'ca' ? 'CANCEL·LAT' : 'CANCELADO',
  };

  const getStatusLabel = (status: string) => {
    if (!status) return '—';
    const cleanStatus = status.trim().toUpperCase();
    try {
      if (typeof (t as any).has === 'function' && (t as any).has(`status.${cleanStatus}`)) {
        return t(`status.${cleanStatus}`);
      }
      return STATUS_MAP[cleanStatus] || cleanStatus.replace(/_/g, ' ');
    } catch (e) {
      return STATUS_MAP[cleanStatus] || cleanStatus.replace(/_/g, ' ') || '—';
    }
  };

  const allDocumentsValidated = useMemo(() => {
    if (!assignment?.enrollments) return false;
    return assignment.enrollments.length > 0 && assignment.enrollments.every(ins => 
      ins.isPedagogicalAgreementValidated &&
      ins.isMobilityAuthorizationValidated &&
      ins.isImageRightsValidated
    );
  }, [assignment]);

  if (loading || !assignment) return <Loading fullScreen message={t('loading_msg')} />;

  const workshopTitle = assignment.workshop?.title || '';
  const workshopModality = assignment.workshop?.modality || '';

  return (
    <DashboardLayout
      title={`${t('title_prefix')}${workshopTitle}`}
      subtitle={
        <div className="flex flex-col gap-6 mt-8">
          <div className="flex items-center gap-4">
            <div className="px-4 py-1 text-[11px] font-medium border border-border-subtle bg-background-subtle text-text-primary">
              {getStatusLabel(assignment.status)}
            </div>
            <div className="px-4 py-1 text-[11px] font-medium bg-consorci-darkBlue text-white">
              {`${t('modality_prefix')}${workshopModality}`}
            </div>
          </div>
        </div>
      }
    >
      <div className="pb-20">
        <section className="flex flex-col gap-10">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8 bg-background-surface p-10 border border-border-subtle">
            <div>
              <h3 className="text-2xl font-medium text-text-primary tracking-tight">{t('students_title')}</h3>
              <p className="text-[12px] font-medium text-text-muted mt-2">
                {t('students_subtitle', {
                  occupied: assignment.enrollments?.length || 0,
                  total: assignment.request?.studentsAprox || assignment.workshop?.maxPlaces || 20
                })}
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setIsBulkUploadOpen(!isBulkUploadOpen)}
                className={`px-8 py-4 text-[13px] font-medium border transition-all flex items-center gap-3 ${
                  isBulkUploadOpen ? 'bg-consorci-darkBlue text-white border-consorci-darkBlue' : 'bg-background-subtle border-border-subtle text-text-primary hover:bg-background-surface'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                {isBulkUploadOpen ? t('ia_matcher_close_btn') : t('ia_matcher_btn')}
              </button>
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="bg-consorci-darkBlue text-white px-8 py-4 text-[13px] font-medium transition-all hover:bg-black active:scale-[0.98] flex items-center gap-3"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" /></svg>
                {t('select_students_btn')}
              </button>
            </div>
          </div>

          {isBulkUploadOpen && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-300">
              <BulkDocumentUpload 
                assignmentId={parseInt(id)} 
                enrollments={assignment.enrollments || []}
                onUploadComplete={refreshData}
              />
            </div>
          )}

          <Phase2Table 
            assignmentId={parseInt(id)}
            enrollments={assignment.enrollments || []}
            onRemoveStudent={handleRemoveStudent}
            onRefresh={refreshData}
          />
        </section>
      </div>

      <StudentSelectionDrawer 
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        initialSelectedIds={assignment.enrollments?.map(i => i.studentId) || []}
        maxSeats={assignment.request?.studentsAprox || assignment.workshop?.maxPlaces || 20}
        onSave={handleUpdateEnrollments}
      />

      {assignment.status !== 'IN_PROGRESS' && assignment.status !== 'COMPLETED' && (
        <div className={`p-10 flex flex-col md:flex-row items-center justify-between gap-8 border ${allDocumentsValidated ? 'bg-green-500/5 border-green-500/20' : 'bg-background-subtle border-border-subtle'}`}>
          <div>
            <h4 className={`text-lg font-medium ${allDocumentsValidated ? 'text-green-600' : 'text-text-primary'}`}>
              {allDocumentsValidated ? t('finalize_section.ready_title') : t('finalize_section.not_ready_title')}
            </h4>
            <p className="text-[13px] text-text-muted mt-2 max-w-xl">
              {allDocumentsValidated ? t('finalize_section.ready_desc') : t('finalize_section.not_ready_desc')}
            </p>
          </div>
          {allDocumentsValidated && (
            <button
              onClick={async () => {
                if (!confirm(t('finalize_section.confirm_dialog'))) return;
                try {
                  await assignmentService.confirmRegistration(parseInt(id));
                  toast.success(t('finalize_section.success'));
                  window.location.reload();
                } catch (_e) {
                  toast.error(tCommon('save_error'));
                }
              }}
              className="px-8 py-4 bg-green-600 text-white text-[13px] font-medium transition-all hover:bg-black active:scale-[0.98]"
            >
              {t('finalize_section.confirm_btn')}
            </button>
          )}
        </div>
      )}

      {assignment.status === 'IN_PROGRESS' && (
        <>
          <div className="p-8 flex flex-col gap-8 shadow-sm border bg-indigo-50 border-indigo-100 mt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h4 className="text-lg font-black uppercase text-indigo-700">{t('close_section.title')}</h4>
                <p className="text-xs text-gray-600 mt-1 max-w-xl">{t('close_section.desc')}</p>
              </div>
              <button
                onClick={async () => {
                  const pendingEvaluations = assignment.enrollments?.filter(e => !e.evaluations || e.evaluations.length === 0).length || 0;
                  if (pendingEvaluations > 0) {
                    toast.error(t('close_section.pending_evals_error', { count: pendingEvaluations }));
                    return;
                  }
                  if (!confirm(t('close_section.confirm_dialog'))) return;
                  try {
                    const api = getApi();
                    await api.post(`/assignments/${id}/close`);
                    toast.success(t('close_section.success'));
                    window.location.reload();
                  } catch (_e: any) {
                    const message = _e.response?.data?.error || t('close_section.error');
                    toast.error(message);
                  }
                }}
                className="px-8 py-4 bg-indigo-600 text-white text-[11px] font-black uppercase tracking-widest shadow-xl hover:bg-indigo-700 transition"
              >
                {t('close_section.confirm_btn')}
              </button>
            </div>

            <div className="border-t border-indigo-100 pt-6">
              <h5 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-4">Certification Summary</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {assignment.enrollments?.map((ins: any) => {
                  const total = assignment.sessions?.length || 0;
                  const attended = ins.attendance?.filter((a: any) => a.status === 'PRESENT' || a.status === 'LATE').length || 0;
                  const pct = total > 0 ? Math.round((attended / total) * 100) : 0;
                  const hasEvaluation = ins.evaluations && ins.evaluations.length > 0;
                  const willGetCert = pct >= 80 && hasEvaluation;
                  return (
                    <div key={ins.enrollmentId} className="bg-white/50 p-4 border border-indigo-100 flex items-center justify-between">
                      <div>
                        <p className="text-[12px] font-bold text-gray-900">{ins.student.fullName}</p>
                        <p className="text-[10px] text-gray-500">{pct}% attendance</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {!hasEvaluation ? (
                          <span className="text-[8px] font-black uppercase bg-orange-100 text-orange-600 px-1.5 py-0.5">Need Eval</span>
                        ) : willGetCert ? (
                          <span className="text-[8px] font-black uppercase bg-green-100 text-green-600 px-1.5 py-0.5">Will Certify</span>
                        ) : (
                          <span className="text-[8px] font-black uppercase bg-gray-100 text-gray-500 px-1.5 py-0.5">No Cert</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
