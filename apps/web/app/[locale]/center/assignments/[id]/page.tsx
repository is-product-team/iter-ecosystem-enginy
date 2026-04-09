'use client';

import { useEffect, useState, use } from 'react';
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

const DocumentUpload = dynamic(() => import('@/components/DocumentUpload'), { ssr: false });

type ViewMode = 'workshop' | 'selection';

export default function AssignmentDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const t = useTranslations('AssignmentDetailPage');
  const tCommon = useTranslations('Common');
  const { id } = use(params);
  const [_user, setUser] = useState<User | null>(null);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const paramsNav = useParams();
  const locale = paramsNav?.locale || 'ca';

  const router = useRouter();

  useEffect(() => {
    const currentUser = getUser();
    if (!currentUser || currentUser.role.name !== ROLES.COORDINATOR) {
      router.push(`/${locale}/login`);
      return;
    }
    setUser(currentUser);

    const fetchData = async () => {
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
  }, [id, router]);

  const handleRemoveStudent = async (studentId: number) => {
    try {
      if (!assignment) return;
      const currentIds = assignment.enrollments?.map((i: Enrollment) => i.studentId) || [];
      const updated = await assignmentService.updateEnrollments(parseInt(id), currentIds.filter((id: number) => id !== studentId));
      setAssignment(updated);
      toast.success(t('remove_student_success'));
    } catch (error) {
      toast.error(tCommon('save_error'));
    }
  };

  const getStatusLabel = (status: string) => {
    return t(`status.${status}`) || status.replace('_', ' ');
  };

  if (loading || !assignment) return <Loading fullScreen message={t('loading_msg')} />;

  const allDocumentsValidated = assignment.enrollments && assignment.enrollments.length > 0 && assignment.enrollments.every((ins: Enrollment) =>
    ins.isPedagogicalAgreementValidated &&
    ins.isMobilityAuthorizationValidated &&
    ins.isImageRightsValidated
  );

  return (
    <DashboardLayout
      title={`Workshop: ${assignment.workshop?.title}`}
      subtitle={
        <div className="flex flex-col gap-6 mt-8">
          <div className="flex items-center gap-4">
            <div className="px-4 py-1 text-[11px] font-medium border border-border-subtle bg-background-subtle text-text-primary">
              {getStatusLabel(assignment.status)}
            </div>
            <div className="px-4 py-1 text-[11px] font-medium bg-consorci-darkBlue text-white">
              Modality {assignment.workshop?.modality}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-10 p-8 bg-background-subtle border border-border-subtle mb-10">
            <div className="flex flex-col">
              <span className="text-[11px] font-medium text-text-muted uppercase tracking-widest mb-2">Teaching Team Referent</span>
              <div className="flex items-center gap-3">
                <span className="text-[13px] font-medium text-text-primary">{assignment.teacher1?.name}</span>
                <span className="text-text-muted opacity-30">•</span>
                <span className="text-[13px] font-medium text-text-primary">{assignment.teacher2?.name}</span>
              </div>
            </div>
            <div className="h-10 w-[1px] bg-border-subtle hidden sm:block"></div>
            <div className="flex flex-col">
              <span className="text-[11px] font-medium text-text-muted uppercase tracking-widest mb-2">Educational Center</span>
              <span className="text-[13px] font-medium text-text-primary">{assignment.center?.name}</span>
            </div>
          </div>
        </div>
      }
    >
      <div className="pb-20">
        {/* SECTION: PARTICIPATING STUDENTS */}
        <section className="bg-background-surface border border-border-subtle overflow-hidden mb-12">
          <div className="p-10 border-b border-border-subtle flex flex-col md:flex-row justify-between items-start md:items-center gap-8 bg-background-subtle">
            <div>
              <h3 className="text-xl font-medium text-text-primary tracking-tight">Participating Students</h3>
              <p className="text-[12px] font-medium text-text-muted mt-2">
                {assignment.enrollments?.length || 0} of {assignment.request?.approxStudents || assignment.workshop?.maxPlaces || 20} seats occupied.
              </p>
            </div>
            <button
              onClick={() => router.push(`/center/assignments/${id}/students`)}
              className="bg-consorci-darkBlue text-white px-8 py-4 text-[13px] font-medium transition-all hover:bg-black active:scale-[0.98] flex items-center gap-3"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" /></svg>
              Nominal Register
            </button>
          </div>

          <div className="divide-y divide-gray-100">
            {assignment.enrollments?.map((ins: Enrollment) => (
              <div key={ins.enrollmentId} className="p-8 hover:bg-gray-50/50 transition-colors">
                <div className="flex flex-col lg:flex-row gap-10 items-start lg:items-center">
                  {/* Student Info */}
                  <div className="flex items-center gap-6 min-w-[300px]">
                    <Avatar
                      url={ins.student.photoUrl}
                      name={`${ins.student.fullName} ${ins.student.lastName}`}
                      id={ins.student.studentId}
                      type="student"
                      size="lg"
                    />
                    <div>
                      <p className="text-[15px] font-medium text-text-primary tracking-tight leading-none mb-2">
                        {ins.student.fullName} {ins.student.lastName}
                      </p>
                      <p className="text-[11px] font-medium text-text-muted bg-background-subtle px-2 py-0.5 inline-block border border-border-subtle">
                        {ins.student.grade} • {ins.student.idalu}
                      </p>
                    </div>
                  </div>

                  {/* Documents */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                    <DocumentUpload
                      assignmentId={parseInt(id)}
                      enrollmentId={ins.enrollmentId}
                      documentType="pedagogical_agreement"
                      initialUrl={ins.pedagogicalAgreementUrl}
                      isValidated={ins.isPedagogicalAgreementValidated}
                      label={t('docs.pedagogical_agreement')}
                      onUploadSuccess={() => { }}
                    />
                    <DocumentUpload
                      assignmentId={parseInt(id)}
                      enrollmentId={ins.enrollmentId}
                      documentType="mobility_authorization"
                      initialUrl={ins.mobilityAuthorizationUrl}
                      isValidated={ins.isMobilityAuthorizationValidated}
                      label={t('docs.mobility_authorization')}
                      onUploadSuccess={() => { }}
                    />
                    <DocumentUpload
                      assignmentId={parseInt(id)}
                      enrollmentId={ins.enrollmentId}
                      documentType="image_rights"
                      initialUrl={ins.imageRightsUrl}
                      isValidated={ins.isImageRightsValidated}
                      label={t('docs.image_rights')}
                      onUploadSuccess={() => { }}
                    />
                  </div>

                  {/* Actions */}
                  <div className="shrink-0">
                    <button
                      onClick={() => handleRemoveStudent(ins.student.studentId)}
                      className="p-3 text-text-muted hover:text-red-500 hover:bg-red-500/5 transition-all"
                      title="Remove student"
                    >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {(!assignment.enrollments || assignment.enrollments.length === 0) && (
              <div className="p-20 text-center bg-background-surface">
                <div className="w-20 h-20 bg-background-subtle flex items-center justify-center mx-auto mb-8 border border-border-subtle">
                  <svg className="w-10 h-10 text-text-muted opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                </div>
                <p className="text-[13px] font-medium text-text-muted mb-6">No students assigned yet</p>
                <button
                  onClick={() => router.push(`/center/assignments/${id}/students`)}
                  className="text-consorci-darkBlue font-medium text-[13px] hover:underline transition-colors"
                >
                  {t('no_students_hint')}
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ACTION: FINALIZE REGISTRATION */}
        {assignment.status !== 'IN_PROGRESS' && assignment.status !== 'COMPLETED' && (
          <div className={`p-10 flex flex-col md:flex-row items-center justify-between gap-8 border ${allDocumentsValidated ? 'bg-green-500/5 border-green-500/20' : 'bg-background-subtle border-border-subtle'
            }`}>
            <div>
              <h4 className={`text-lg font-medium ${allDocumentsValidated ? 'text-green-600' : 'text-text-primary'}`}>
                {allDocumentsValidated ? ' Everything ready to start' : 'Confirm Documentation'}
              </h4>
              <p className="text-[13px] text-text-muted mt-2 max-w-xl">
                {allDocumentsValidated
                  ? "All data and documents have been validated. You can now confirm the final registration to activate the workshop."
                  : "Once all data and documents are validated, you can confirm the final registration."
                }
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

        {/* ACTION: CLOSE WORKSHOP */}
        {assignment.status === 'IN_PROGRESS' && (
          <div className="p-8 flex flex-col gap-8 shadow-sm border bg-indigo-50 border-indigo-100 mt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h4 className="text-lg font-black uppercase text-indigo-700">
                  {t('close_section.title')}
                </h4>
                <p className="text-xs text-gray-600 mt-1 max-w-xl">
                  {t('close_section.desc')}
                </p>
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

            {/* Summary List */}
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
        )}
      </div>
    </DashboardLayout>
  );
}
