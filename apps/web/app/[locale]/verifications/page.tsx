'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import assignmentService, { Assignment } from '@/services/assignmentService';
import Loading from '@/components/Loading';
import { toast } from 'sonner';
import Pagination from "@/components/Pagination";
import { useTranslations } from 'next-intl';

export default function DocumentVerificationPage() {
  const { user, loading: authLoading } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const t = useTranslations('Admin.Verifications');
  const tc = useTranslations('Common');

  const getGreetingKey = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 20) return 'afternoon';
    return 'evening';
  };

  const [notificationData, setNotificationData] = useState({
    documentName: 'select',
    comment: '',
    greeting: getGreetingKey()
  });
  const [sendingNotif, setSendingNotif] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const router = useRouter();
  const params = useParams();
  const locale = params?.locale || 'ca';

  useEffect(() => {
    if (!authLoading && (!user || user.role.name !== 'ADMIN')) {
      router.push(`/${locale}/login`);
      return;
    }

    if (user) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, router]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await assignmentService.getAll();
      setAssignments(data);
    } catch (err) {
      console.error(err);
      toast.error(t('error_load'));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenNotification = (assignment: Assignment, docNameKey: string) => {
    setSelectedAssignment(assignment);
    setNotificationData({
      ...notificationData,
      documentName: docNameKey,
      comment: ''
    });
    setShowNotificationModal(true);
  };

  const sendNotification = async () => {
    if (!selectedAssignment) return;
    if (!notificationData.comment.trim()) {
      toast.error(t('error_no_comment'));
      return;
    }

    setSendingNotif(true);
    try {
      await assignmentService.sendDocumentNotification(
        selectedAssignment.assignmentId,
        t(`docs.${notificationData.documentName}`),
        notificationData.comment,
        t(`greetings.${notificationData.greeting}`)
      );
      toast.success(t('success_notif'));
      setShowNotificationModal(false);
    } catch (err) {
      console.error(err);
      toast.error(t('error_notif'));
    } finally {
      setSendingNotif(false);
    }
  };

  const handleValidateDocument = async (idEnrollment: number, field: string, valid: boolean) => {
    try {
      await assignmentService.validateDocument(idEnrollment, field, valid);
      toast.success(valid ? t('success_validate') : t('success_unvalidate'));
      loadData(); // Refresh list to see updated status
    } catch (err) {
      console.error(err);
      toast.error(t('error_validate'));
    }
  };

  const totalPages = Math.ceil(assignments.length / itemsPerPage);
  const paginatedAssignments = assignments.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
  );

  if (authLoading || !user) {
    return <Loading fullScreen message={tc('authenticating')} />;
  }

  return (
    <DashboardLayout
      title={t('title')}
      subtitle={t('subtitle')}
    >
      <div className="space-y-6">
        {/* List of Assignments */}
        <div className="bg-background-surface border border-border-subtle overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-background-subtle border-b border-border-subtle">
                <th className="px-6 py-4 text-[12px] font-medium text-text-primary">{t('table_center_workshop')}</th>
                <th className="px-6 py-4 text-[12px] font-medium text-text-primary">{t('table_dates')}</th>
                <th className="px-6 py-4 text-[12px] font-medium text-text-primary">{t('table_docs')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center">
                    <Loading message={tc('loading')} />
                  </td>
                </tr>
              ) : assignments.length > 0 ? (
                paginatedAssignments.map((assig) => (
                  <tr key={assig.assignmentId} className="hover:bg-background-subtle transition-colors">
                    <td className="px-6 py-5">
                      <div className="font-medium text-text-primary text-[15px] leading-tight mb-1">{assig.center?.name}</div>
                      <div className="text-[12px] font-medium text-consorci-darkBlue">{assig.workshop?.title}</div>
                    </td>
                    <td className="px-6 py-5 text-[13px] font-medium text-text-muted">
                      {assig.startDate && assig.endDate ? (
                        <div className="flex flex-col gap-1">
                          <span>{t('start')}: {new Date(assig.startDate).toLocaleDateString()}</span>
                          <span>{t('end')}: {new Date(assig.endDate).toLocaleDateString()}</span>
                        </div>
                      ) : (
                        <span className="text-text-muted opacity-50 italic">{t('dates_not_defined')}</span>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-3">
                        {assig.enrollments?.map((ins) => (
                          <div key={ins.enrollmentId} className="flex items-center justify-between gap-6 p-4 border border-border-subtle bg-background-subtle/30 group">
                            <div className="flex flex-col gap-2 min-w-0">
                              <div className="text-[13px] font-medium text-text-primary truncate">
                                {ins.student?.fullName}
                              </div>
                                <div className="flex flex-wrap gap-2">
                                    {[
                                      { id: 'pedagogical_agreement', name: t('doc_names.agreement'), url: ins.pedagogicalAgreementUrl, valid: ins.isPedagogicalAgreementValidated, validField: 'isPedagogicalAgreementValidated', docKey: 'pedagogical' },
                                      { id: 'mobility_authorization', name: t('doc_names.mobility'), url: ins.mobilityAuthorizationUrl, valid: ins.isMobilityAuthorizationValidated, validField: 'isMobilityAuthorizationValidated', docKey: 'mobility' },
                                      { id: 'image_rights', name: t('doc_names.rights'), url: ins.imageRightsUrl, valid: ins.isImageRightsValidated, validField: 'isImageRightsValidated', docKey: 'image' }
                                    ].map(doc => (
                                      <div key={doc.id} className="flex items-center">
                                        {doc.url ? (
                                          <div className="flex items-center">
                                            <a
                                              href={`${process.env.NEXT_PUBLIC_API_URL}${doc.url}`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className={`text-[11px] font-medium px-2.5 py-1.5 transition-all flex items-center gap-2 border ${
                                                  doc.valid 
                                                    ? 'border-green-500/30 text-green-600 bg-green-500/5 hover:bg-green-500/10' 
                                                    : 'border-consorci-darkBlue/20 text-consorci-darkBlue bg-background-subtle hover:bg-background-surface'
                                              }`}
                                              title={`${tc('view_document')} ${doc.name}`}
                                            >
                                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                              </svg>
                                              {doc.name}
                                            </a>
                                            {!doc.valid ? (
                                              <button 
                                                onClick={() => handleValidateDocument(ins.enrollmentId, doc.validField, true)}
                                                className="bg-green-600 text-white px-3 py-1.5 text-[11px] font-medium hover:bg-black transition-all border border-green-600 border-l-0"
                                              >
                                                {tc('ok')}
                                              </button>
                                            ) : (
                                              <button 
                                                onClick={() => handleValidateDocument(ins.enrollmentId, doc.validField, false)}
                                                className="bg-background-subtle text-red-500 px-3 py-1.5 text-[11px] font-medium hover:bg-red-50 transition-all border border-border-subtle border-l-0"
                                              >
                                                ✕
                                              </button>
                                            )}
                                          </div>
                                        ) : (
                                          <span className="text-[11px] font-medium text-text-muted opacity-30 border border-border-subtle px-2 py-1.5">
                                            {doc.name}
                                          </span>
                                        )}
                                      </div>
                                    ))}
                                </div>
                              </div>

                                <button
                                  onClick={() => handleOpenNotification(assig, 'select')}
                                  className="text-[11px] font-medium border border-border-subtle text-text-muted px-3 py-1.5 hover:bg-background-subtle transition-all flex items-center gap-2 shrink-0"
                                  title={t('report_problem_hint')}
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                  </svg>
                                  {t('report_problem_btn')}
                                </button>
                        </div>
                      ))}
                        {(!assig.enrollments || assig.enrollments.length === 0) && (
                          <span className="text-[12px] font-medium text-text-muted italic opacity-50">{t('no_students')}</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-16 text-center text-text-muted text-[13px] font-medium">
                    {t('no_assignments')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={assignments.length}
          currentItemsCount={paginatedAssignments.length}
          itemName={tc('assignments').toLowerCase()}
        />
      </div>

      {/* Notification Modal */}
      {showNotificationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-6">
          <div className="bg-background-surface w-full max-w-xl border border-border-subtle relative">
            <div className="p-8 border-b border-border-subtle bg-background-subtle flex justify-between items-center">
              <h3 className="text-[14px] font-medium text-text-primary flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                {t('report_modal_title')}
              </h3>
              <button onClick={() => setShowNotificationModal(false)} className="text-text-muted hover:text-red-500 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-10 space-y-8">
              <div className="bg-background-subtle border border-border-subtle p-5">
                <p className="text-[10px] font-medium text-text-muted mb-2 tracking-wider">{t('preview')}</p>
                <div className="text-[13px] font-medium text-text-primary leading-relaxed opacity-80 italic">
                  &quot;{t(`greetings.${notificationData.greeting}`)}, the document <span className="font-medium underline decoration-consorci-darkBlue/30">{notificationData.documentName === 'select' ? '[Document]' : t(`docs.${notificationData.documentName}`)}</span> of the workshop <span className="font-medium text-consorci-darkBlue">{selectedAssignment?.workshop?.title}</span> is incorrect because {notificationData.comment}&quot;
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-[12px] font-medium text-text-primary px-1">{t('greeting')}</label>
                    <select
                      value={notificationData.greeting}
                      onChange={(e) => setNotificationData({ ...notificationData, greeting: e.target.value })}
                      className="w-full px-4 py-3 bg-background-subtle border border-border-subtle text-sm font-medium text-text-primary focus:border-consorci-darkBlue outline-none appearance-none"
                    >
                      <option value="morning">{t('greetings.morning')}</option>
                      <option value="afternoon">{t('greetings.afternoon')}</option>
                      <option value="evening">{t('greetings.evening')}</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[12px] font-medium text-text-primary px-1">{t('doc_with_error')}</label>
                    <select
                      value={notificationData.documentName}
                      onChange={(e) => setNotificationData({ ...notificationData, documentName: e.target.value })}
                      className="w-full px-4 py-3 bg-background-subtle border border-border-subtle text-sm font-medium text-text-primary focus:border-consorci-darkBlue outline-none appearance-none"
                    >
                      <option value="select" disabled>{t('docs.select')}</option>
                      <option value="pedagogical">{t('docs.pedagogical')}</option>
                      <option value="mobility">{t('docs.mobility')}</option>
                      <option value="image">{t('docs.image')}</option>
                      <option value="all">{t('docs.all')}</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[12px] font-medium text-text-primary px-1">{t('reason_error')}</label>
                  <textarea
                    value={notificationData.comment}
                    onChange={(e) => setNotificationData({ ...notificationData, comment: e.target.value })}
                    placeholder={t('reason_placeholder')}
                    className="w-full px-4 py-3 bg-background-subtle border border-border-subtle text-sm font-medium text-text-primary focus:border-consorci-darkBlue outline-none min-h-[120px] resize-none appearance-none"
                  />
                </div>
              </div>

              <div className="flex gap-6">
                <button
                  onClick={() => setShowNotificationModal(false)}
                  className="flex-1 py-4 border border-border-subtle text-text-muted font-medium text-[13px] hover:bg-background-subtle transition-all"
                >
                  {tc('cancel')}
                </button>
                <button
                  onClick={sendNotification}
                  disabled={sendingNotif || notificationData.documentName === 'select'}
                  className={`flex-[2] py-4 font-medium text-[13px] flex items-center justify-center gap-3 transition-all ${
                    sendingNotif || notificationData.documentName === 'select' ? 'bg-background-subtle text-text-muted' : 'bg-consorci-darkBlue text-white hover:bg-black active:scale-[0.98]'
                  }`}
                >
                  {sendingNotif ? (
                    <>
                      <Loading size="mini" white />
                      <span>{t('sending')}</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      <span>{t('send_notification')}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
