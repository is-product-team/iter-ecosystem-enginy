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
      title={`${t('title_prefix')}${assignment.workshop?.title}`} 
      subtitle={
        <div className="flex flex-col gap-4 mt-6">
          <div className="flex items-center gap-3">
            <div className="px-4 py-1.5 text-[9px] font-black uppercase tracking-widest border-2 border-gray-100 bg-white text-[#00426B]">
              {getStatusLabel(assignment.status)}
            </div>
            <div className="px-4 py-1.5 text-[9px] font-black uppercase tracking-widest bg-[#00426B] text-white">
              {t('modality_prefix')}{assignment.workshop?.modality}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 p-6 bg-[#F8FAFC] border border-gray-200">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('referent_label')}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-[#00426B] uppercase">{assignment.teacher1?.name}</span>
                <span className="text-gray-300">•</span>
                <span className="text-xs font-black text-[#00426B] uppercase">{assignment.teacher2?.name}</span>
              </div>
            </div>
            <div className="h-8 w-[1px] bg-gray-200 hidden sm:block"></div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('center_label')}</span>
              <span className="text-xs font-black text-[#00426B] uppercase">{assignment.center?.name}</span>
            </div>
          </div>
        </div>
      }
    >
      <div className="pb-20">
        {/* SECTION: PARTICIPATING STUDENTS */}
        <section className="bg-white border border-gray-200 shadow-sm overflow-hidden mb-8">
          <div className="p-10 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gradient-to-r from-[#F8FAFC] to-white">
            <div>
              <h3 className="text-xl font-black text-[#00426B] uppercase tracking-tighter">{t('students_title')}</h3>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                {t('students_subtitle', { 
                  occupied: assignment.enrollments?.length || 0,
                  total: assignment.request?.approxStudents || assignment.workshop?.maxPlaces || 20
                })}
              </p>
            </div>
            <button 
              onClick={() => router.push(`/${locale}/center/assignments/${id}/students`)}
              className="bg-[#00426B] text-white px-8 py-4 text-[11px] font-black uppercase tracking-[0.2em] hover:bg-[#0775AB] transition-all flex items-center gap-3 shadow-xl"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
              {t('nominal_register_btn')}
            </button>
          </div>

          <div className="divide-y divide-gray-100">
            {assignment.enrollments?.map((ins: Enrollment) => (
              <div key={ins.enrollmentId} className="p-8 hover:bg-gray-50/50 transition-colors">
                <div className="flex flex-col lg:flex-row gap-10 items-start lg:items-center">
                  {/* Student Info */}
                  <div className="flex items-center gap-6 min-w-[280px]">
                    <Avatar 
                      url={ins.student.photoUrl} 
                      name={`${ins.student.fullName} ${ins.student.lastName}`} 
                      id={ins.student.studentId} 
                      type="student" 
                      size="lg"
                      className="shadow-md"
                    />
                    <div>
                      <p className="text-base font-black text-[#00426B] uppercase tracking-tight leading-none">
                        {ins.student.fullName} {ins.student.lastName}
                      </p>
                      <p className="text-[10px] font-bold text-[#4197CB] uppercase tracking-widest mt-2 bg-blue-50 px-2 py-0.5 inline-block border border-blue-100">
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
                      onUploadSuccess={() => {}}
                    />
                    <DocumentUpload 
                      assignmentId={parseInt(id)}
                      enrollmentId={ins.enrollmentId}
                      documentType="mobility_authorization"
                      initialUrl={ins.mobilityAuthorizationUrl}
                      isValidated={ins.isMobilityAuthorizationValidated}
                      label={t('docs.mobility_authorization')}
                      onUploadSuccess={() => {}}
                    />
                    <DocumentUpload 
                      assignmentId={parseInt(id)}
                      enrollmentId={ins.enrollmentId}
                      documentType="image_rights"
                      initialUrl={ins.imageRightsUrl}
                      isValidated={ins.isImageRightsValidated}
                      label={t('docs.image_rights')}
                      onUploadSuccess={() => {}}
                    />
                  </div>

                  {/* Actions */}
                  <div className="shrink-0">
                    <button 
                      onClick={() => {
                        if (confirm(tCommon('delete_confirm_msg'))) handleRemoveStudent(ins.student.studentId);
                      }}
                      className="p-3 text-gray-200 hover:text-red-500 hover:bg-red-50 transition-all rounded-full"
                      title={tCommon('delete')}
                    >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {(!assignment.enrollments || assignment.enrollments.length === 0) && (
              <div className="p-20 text-center bg-white">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                </div>
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">{t('no_students')}</p>
                <button 
                  onClick={() => router.push(`/${locale}/center/assignments/${id}/students`)}
                  className="text-[#4197CB] font-black text-[10px] uppercase tracking-widest hover:text-[#00426B] transition-colors"
                >
                  {t('no_students_hint')}
                </button>
              </div>
            )}
          </div>
        </section>
        
        {/* ACTION: FINALIZE REGISTRATION */}
        {assignment.status !== 'IN_PROGRESS' && assignment.status !== 'COMPLETED' && (
          <div className={`p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm border ${
            allDocumentsValidated ? 'bg-green-50 border-green-100' : 'bg-blue-50 border-blue-100'
          }`}>
            <div>
              <h4 className={`text-lg font-black uppercase ${allDocumentsValidated ? 'text-green-700' : 'text-[#00426B]'}`}>
                {allDocumentsValidated ? t('finalize_section.ready_title') : t('finalize_section.not_ready_title')}
              </h4>
              <p className="text-xs text-gray-600 mt-1 max-w-xl">
                {allDocumentsValidated 
                  ? t('finalize_section.ready_desc')
                  : t('finalize_section.not_ready_desc')
                }
              </p>
            </div>
            {allDocumentsValidated && (
              <button 
                onClick={async () => {
                  if(!confirm(t('finalize_section.confirm_dialog'))) return;
                  try {
                    await assignmentService.confirmRegistration(parseInt(id));
                    toast.success(t('finalize_section.success'));
                    window.location.reload();
                  } catch(_e) {
                    toast.error(tCommon('save_error'));
                  }
                }}
                className="px-8 py-4 bg-green-600 text-white text-[11px] font-black uppercase tracking-widest shadow-xl"
              >
                {t('finalize_section.confirm_btn')}
              </button>
            )}
          </div>
        )}

        {/* ACTION: CLOSE WORKSHOP */}
        {assignment.status === 'IN_PROGRESS' && (
          <div className="p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm border bg-indigo-50 border-indigo-100 mt-8">
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
                const pendingEvaluations = assignment.enrollments?.filter(e => !e.hasTeacherEvaluation).length || 0;
                
                if (pendingEvaluations > 0) {
                  toast.error(t('close_section.pending_evals_error', { count: pendingEvaluations }));
                  return;
                }

                if(!confirm(t('close_section.confirm_dialog'))) return;
                try {
                  const api = getApi();
                  await api.post(`/assignments/${id}/close`);
                  toast.success(t('close_section.success'));
                  window.location.reload();
                } catch(_e: any) {
                  const message = _e.response?.data?.error || t('close_section.error');
                  toast.error(message);
                }
              }}
              className="px-8 py-4 bg-indigo-600 text-white text-[11px] font-black uppercase tracking-widest shadow-xl hover:bg-indigo-700 transition"
            >
              {t('close_section.confirm_btn')}
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
