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
import { ROLES } from '@iter/shared';

export default function DocumentVerificationPage() {
  const { user, loading: authLoading } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRow, setSelectedRow] = useState<any | null>(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [selectedDocs, setSelectedDocs] = useState<{ enrollmentId: number; field: string }[]>([]);
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
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, pending, problem, validated
  const itemsPerPage = 15; // Increased density

  const router = useRouter();
  const params = useParams();
  const locale = params?.locale || 'ca';

  const DOCUMENT_CONFIG = [
    { id: 'pedagogical', field: 'isPedagogicalAgreementValidated', urlField: 'pedagogicalAgreementUrl', label: 'A', nameKey: 'doc_names.agreement' },
    { id: 'mobility', field: 'isMobilityAuthorizationValidated', urlField: 'mobilityAuthorizationUrl', label: 'M', nameKey: 'doc_names.mobility' },
    { id: 'image', field: 'isImageRightsValidated', urlField: 'imageRightsUrl', label: 'R', nameKey: 'doc_names.rights' }
  ] as const;

  // Flat list transformation
  const flatEnrollments = assignments.flatMap(assig =>
    (assig.enrollments || []).map(ins => ({
      ...ins,
      workshopTitle: assig.workshop?.title,
      centerName: assig.center?.name,
      assignmentId: assig.assignmentId,
      startDate: assig.startDate,
      endDate: assig.endDate,
      workshop: assig.workshop
    }))
  );

  // Filtered list
  const filteredEnrollments = flatEnrollments.filter(row => {
    const matchesSearch = row.student?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.centerName?.toLowerCase().includes(searchTerm.toLowerCase());

    if (statusFilter === 'all') return matchesSearch;

    if (statusFilter === 'pending') {
      return matchesSearch && DOCUMENT_CONFIG.some(doc => row[doc.urlField] && !row[doc.field]);
    }
    if (statusFilter === 'validated') {
      return matchesSearch && DOCUMENT_CONFIG.every(doc => row[doc.field]);
    }
    return matchesSearch;
  });

  useEffect(() => {
    if (!authLoading && (!user || user.role.name !== ROLES.ADMIN)) {
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

  const handleOpenNotification = (row: any, docNameKey: string) => {
    setSelectedRow(row);
    setNotificationData({
      ...notificationData,
      documentName: docNameKey,
      comment: ''
    });
    setShowNotificationModal(true);
  };

  const sendNotification = async () => {
    if (!selectedRow) return;
    if (!notificationData.comment.trim()) {
      toast.error(t('error_no_comment'));
      return;
    }

    setSendingNotif(true);
    try {
      await assignmentService.sendDocumentNotification(
        selectedRow.assignmentId,
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

  const toggleRowSelection = (row: any) => {
    const rowDocs = DOCUMENT_CONFIG
      .filter(doc => row[doc.urlField] && !row[doc.field])
      .map(doc => ({ enrollmentId: row.enrollmentId, field: doc.field }));

    setSelectedDocs(prev => {
      const isRowFullySelected = rowDocs.length > 0 && rowDocs.every(rd => prev.some(p => p.enrollmentId === rd.enrollmentId && p.field === rd.field));

      if (isRowFullySelected) {
        // Unselect only those from this row
        return prev.filter(p => p.enrollmentId !== row.enrollmentId);
      } else {
        // Select all pending from this row, avoid duplicates
        const otherDocs = prev.filter(p => p.enrollmentId !== row.enrollmentId);
        return [...otherDocs, ...rowDocs];
      }
    });
  };

  const toggleAllSelection = () => {
    if (selectedDocs.length > 0) {
      setSelectedDocs([]);
    } else {
      const allPending = paginatedEnrollments.flatMap(row => 
        DOCUMENT_CONFIG
          .filter(doc => row[doc.urlField] && !row[doc.field])
          .map(doc => ({ enrollmentId: row.enrollmentId, field: doc.field }))
      );
      setSelectedDocs(allPending);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedDocs.length === 0) return;

    setLoading(true);
    try {
      // Execute in small batches to avoid timeout
      const batchSize = 5;
      for (let i = 0; i < selectedDocs.length; i += batchSize) {
        const batch = selectedDocs.slice(i, i + batchSize);
        await Promise.all(batch.map(doc => assignmentService.validateDocument(doc.enrollmentId, doc.field, true)));
      }
      toast.success(t('success_bulk_approve', { count: selectedDocs.length }));
      setSelectedDocs([]);
      loadData();
    } catch (error) {
      toast.error(t('error_bulk_approve') || 'Error');
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(filteredEnrollments.length / itemsPerPage);
  const paginatedEnrollments = filteredEnrollments.slice(
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
        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row gap-6 bg-background-surface border border-border-subtle p-6">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder={tc('search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-background-subtle border border-border-subtle font-medium text-[13px] outline-none focus:border-consorci-darkBlue transition-all"
            />
            <svg className="w-4 h-4 absolute left-3.5 top-3.5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-6 py-3 bg-background-subtle border border-border-subtle font-medium text-[13px] outline-none min-w-[220px] cursor-pointer"
          >
            <option value="all">{t('all_statuses') || 'Tots els estats'}</option>
            <option value="pending">{t('pending_validation') || 'Pendents de Validar'}</option>
            <option value="validated">{t('fully_validated') || 'Tots Validats'}</option>
          </select>
          {selectedDocs.length > 0 && (
            <button
              onClick={handleBulkApprove}
              disabled={loading}
              className="px-8 py-3 bg-green-600 text-white font-bold text-[13px] hover:bg-black transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {t('btn_bulk_approve') || 'Validació Massiva'} ({selectedDocs.length})
            </button>
          )}
        </div>

        {/* List of Verifications */}
        <div className="bg-background-surface border border-border-subtle overflow-hidden">
          <div className="premium-table-container">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-background-subtle border-b border-border-subtle">                  <th className="px-6 py-4 w-[60px]">
                    <div className="flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={selectedDocs.length > 0 && selectedDocs.length === paginatedEnrollments.flatMap(r => 
                          DOCUMENT_CONFIG.filter(doc => r[doc.urlField] && !r[doc.field])
                        ).length}
                        onChange={toggleAllSelection}
                        className="w-4 h-4 border-border-subtle accent-consorci-darkBlue cursor-pointer"
                      />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold text-text-muted uppercase tracking-widest">{t('table_student')}</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-text-muted uppercase tracking-widest">{t('table_center_workshop')}</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-text-muted uppercase tracking-widest">{t('table_docs')}</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-text-muted uppercase tracking-widest text-right">{tc('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {loading && paginatedEnrollments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center">
                      <Loading message={tc('loading')} />
                    </td>
                  </tr>
                ) : paginatedEnrollments.length > 0 ? (
                  paginatedEnrollments.map((row) => {
                    const hasPending = DOCUMENT_CONFIG.some(doc => row[doc.urlField] && !row[doc.field]);

                    return (
                      <tr
                        key={row.enrollmentId}
                        className={`group hover:bg-background-subtle/30 transition-colors ${selectedRow?.enrollmentId === row.enrollmentId ? 'bg-consorci-darkBlue/5' : ''}`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center">
                            <input
                              type="checkbox"
                              checked={DOCUMENT_CONFIG.some(doc => row[doc.urlField] && !row[doc.field] && selectedDocs.some(sd => sd.enrollmentId === row.enrollmentId && sd.field === doc.field))}
                              onChange={() => toggleRowSelection(row)}
                              className="w-4 h-4 border-border-subtle accent-consorci-darkBlue cursor-pointer"
                            />
                          </div>
                        </td>
                        <td className="px-6 py-5 cursor-pointer" onClick={() => setSelectedRow(row)}>
                          <div className="font-bold text-text-primary text-[14px]">{row.student?.fullName}</div>
                          <div className="text-[11px] text-text-muted mt-0.5">ID: {row.student?.idalu}</div>
                        </td>
                        <td className="px-6 py-5 cursor-pointer" onClick={() => setSelectedRow(row)}>
                          <div className="font-medium text-text-primary text-[13px] truncate">{row.centerName}</div>
                          <div className="text-[12px] font-medium text-consorci-darkBlue mt-0.5">{row.workshopTitle}</div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            {DOCUMENT_CONFIG.map((docConfig) => {
                              const url = row[docConfig.urlField];
                              const valid = row[docConfig.field];
                              return (
                                <div
                                  key={docConfig.id}
                                  title={url ? (valid ? 'Validat' : 'Pendent') : 'No pujat'}
                                  className={`w-8 h-8 flex items-center justify-center text-[11px] font-bold border ${url
                                      ? valid
                                        ? 'bg-green-50 border-green-200 text-green-700'
                                        : 'bg-amber-50 border-amber-200 text-amber-700 animate-pulse'
                                      : 'bg-background-subtle border-border-subtle text-text-muted opacity-40'
                                    }`}
                                >
                                  {docConfig.label}
                                </div>
                              );
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <button
                            onClick={() => setSelectedRow(row)}
                            className="inline-flex items-center justify-center px-4 py-2 border border-border-subtle text-[11px] font-bold text-text-muted hover:text-consorci-darkBlue hover:border-consorci-darkBlue transition-all"
                          >
                            {tc('view')}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-24 text-center">
                      <div className="text-text-muted text-[13px] font-medium italic opacity-40">{tc('no_results')}</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredEnrollments.length}
          currentItemsCount={paginatedEnrollments.length}
          itemName={tc('students')}
        />
      </div>

      {/* Modern Side Drawer for Details */}
      {selectedRow && (
        <div className="fixed inset-0 z-50 flex justify-end overflow-hidden">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setSelectedRow(null)} />

          {/* Drawer Content */}
          <div className="relative w-full max-w-2xl bg-background-surface border-l border-border-subtle flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-8 border-b border-border-subtle bg-background-subtle flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-text-primary tracking-tight">{selectedRow.student?.fullName}</h3>
                <p className="text-[13px] font-medium text-text-muted mt-1">{selectedRow.workshopTitle} • {selectedRow.centerName}</p>
              </div>
              <button onClick={() => setSelectedRow(null)} className="p-2 text-text-muted hover:text-red-500 transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-12">
              {DOCUMENT_CONFIG.map(doc => {
                const url = selectedRow[doc.urlField];
                const valid = selectedRow[doc.field];
                return (
                  <div key={doc.id} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${url ? (valid ? 'bg-green-500' : 'bg-amber-500') : 'bg-border-subtle'}`} />
                        <h4 className="text-[13px] font-bold uppercase tracking-widest text-text-primary">{t(doc.nameKey)}</h4>
                      </div>
                      <div className="flex gap-3">
                        {url && (
                          <>
                            <button
                              onClick={() => handleValidateDocument(selectedRow.enrollmentId, doc.field, !valid)}
                              className={`px-6 py-2 text-[11px] font-bold transition-all ${valid
                                  ? 'bg-red-50 text-red-600 border border-red-500/20 hover:bg-black hover:text-white'
                                  : 'bg-green-600 text-white hover:bg-black'
                                }`}
                            >
                              {valid ? t('btn_unvalidate') : t('btn_validate')}
                            </button>
                            <button
                              onClick={() => handleOpenNotification(selectedRow, doc.id)}
                              className="px-4 py-2 border border-border-subtle text-text-muted text-[11px] font-bold hover:bg-background-subtle"
                            >
                              {t('report_problem_btn')}
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {url ? (
                      <div className="aspect-[1.41] w-full bg-background-subtle border border-border-subtle overflow-hidden relative group">
                        <iframe
                          src={`${process.env.NEXT_PUBLIC_API_URL}${url}#toolbar=0`}
                          className="w-full h-full"
                          title={t(doc.nameKey)}
                        />
                        <div className="absolute inset-0 bg-black/5 pointer-events-none" />
                        <a
                          href={`${process.env.NEXT_PUBLIC_API_URL}${url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute top-4 right-4 bg-black text-white p-3 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Abrir en pestaña nueva"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </div>
                    ) : (
                      <div className="py-16 border-2 border-dashed border-border-subtle flex flex-col items-center justify-center bg-background-subtle/30">
                        <svg className="w-8 h-8 text-text-muted opacity-20 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-[12px] font-bold text-text-muted opacity-40 uppercase tracking-widest">{t('doc_not_uploaded')}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Notification Modal (Matches Dashboard Style) */}
      {showNotificationModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
          <div className="bg-background-surface w-full max-w-xl border border-border-subtle">
            <div className="p-8 border-b border-border-subtle bg-background-subtle flex justify-between items-center">
              <h3 className="text-lg font-bold text-text-primary tracking-tight flex items-center gap-3">
                <svg className="w-5 h-5 text-consorci-darkBlue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {t('report_modal_title')}
              </h3>
              <button onClick={() => setShowNotificationModal(false)} className="text-text-muted hover:text-red-500 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-10 space-y-8">
              <div className="bg-background-subtle border border-border-subtle p-6">
                <div className="text-[14px] font-medium text-text-primary leading-relaxed">
                  <span className="text-text-muted italic">&quot;{t(`greetings.${notificationData.greeting}`)}, {tc('notif_preamble')} </span>
                  <span className="font-bold underline decoration-consorci-darkBlue/30 text-consorci-darkBlue">
                    {notificationData.documentName === 'select' ? '[Document]' : t(`docs.${notificationData.documentName}`)}
                  </span>
                  <span className="text-text-muted italic"> {tc('notif_mid')} </span>
                  <span className="font-bold">{selectedRow?.workshopTitle}</span>
                  <span className="text-text-muted italic"> {tc('notif_reason')} </span>
                  <span className="font-bold underline">{notificationData.comment || '...'}</span>
                  <span className="text-text-muted italic">&quot;</span>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest">{t('greeting')}</label>
                    <select
                      value={notificationData.greeting}
                      onChange={(e) => setNotificationData({ ...notificationData, greeting: e.target.value })}
                      className="w-full px-4 py-3 bg-background-subtle border border-border-subtle text-sm font-bold text-text-primary focus:border-consorci-darkBlue outline-none appearance-none cursor-pointer"
                    >
                      <option value="morning">{t('greetings.morning')}</option>
                      <option value="afternoon">{t('greetings.afternoon')}</option>
                      <option value="evening">{t('greetings.evening')}</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest">{t('doc_with_error')}</label>
                    <select
                      value={notificationData.documentName}
                      onChange={(e) => setNotificationData({ ...notificationData, documentName: e.target.value })}
                      className="w-full px-4 py-3 bg-background-subtle border border-border-subtle text-sm font-bold text-text-primary focus:border-consorci-darkBlue outline-none appearance-none cursor-pointer"
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
                  <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest">{t('reason_error')}</label>
                  <textarea
                    value={notificationData.comment}
                    onChange={(e) => setNotificationData({ ...notificationData, comment: e.target.value })}
                    placeholder={t('reason_placeholder')}
                    className="w-full px-5 py-4 bg-background-subtle border border-border-subtle text-[14px] font-medium text-text-primary focus:border-consorci-darkBlue outline-none min-h-[140px] resize-none appearance-none"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setShowNotificationModal(false)}
                  className="flex-1 py-4 border border-border-subtle text-text-muted font-bold text-[13px] hover:bg-background-subtle transition-all"
                >
                  {tc('cancel')}
                </button>
                <button
                  onClick={sendNotification}
                  disabled={sendingNotif || notificationData.documentName === 'select' || !notificationData.comment}
                  className={`flex-[2] py-4 font-bold text-[13px] flex items-center justify-center gap-3 transition-all ${sendingNotif || notificationData.documentName === 'select' || !notificationData.comment ? 'bg-background-subtle text-text-muted' : 'bg-consorci-darkBlue text-white hover:bg-black'
                    }`}
                >
                  {sendingNotif ? <Loading size="mini" white /> : t('send_notification')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
