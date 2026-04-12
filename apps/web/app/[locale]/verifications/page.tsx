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
    
    const docs = [
      { url: row.pedagogicalAgreementUrl, valid: row.isPedagogicalAgreementValidated },
      { url: row.mobilityAuthorizationUrl, valid: row.isMobilityAuthorizationValidated },
      { url: row.imageRightsUrl, valid: row.isImageRightsValidated }
    ];

    if (statusFilter === 'pending') {
      return matchesSearch && docs.some(d => d.url && !d.valid);
    }
    if (statusFilter === 'validated') {
      return matchesSearch && docs.every(d => d.valid);
    }
    return matchesSearch;
  });

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
    const fields = ['isPedagogicalAgreementValidated', 'isMobilityAuthorizationValidated', 'isImageRightsValidated'];
    const rowDocs = fields
      .filter(f => row[f.replace('is', '').replace('Validated', 'Url')] && !row[f])
      .map(f => ({ enrollmentId: row.enrollmentId, field: f }));

    setSelectedDocs(prev => {
      const isRowSelected = rowDocs.every(rd => prev.find(p => p.enrollmentId === rd.enrollmentId && p.field === rd.field));
      
      if (isRowSelected) {
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
      const allPending = paginatedEnrollments.flatMap(row => {
        const fields = ['isPedagogicalAgreementValidated', 'isMobilityAuthorizationValidated', 'isImageRightsValidated'] as const;
        return fields
          .filter(f => {
            const urlKey = f.replace('is', '').replace('Validated', 'Url') as keyof typeof row;
            return row[urlKey] && !row[f];
          })
          .map(f => ({ enrollmentId: row.enrollmentId, field: f }));
      });
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
      toast.success(t('success_bulk_approve', { count: selectedDocs.length }) || `Aprobados ${selectedDocs.length} documentos`);
      setSelectedDocs([]);
      loadData();
    } catch (error) {
      toast.error(t('error_bulk_approve') || 'Error en la aprobación masiva');
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
      <div className="space-y-4">
        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 bg-background-surface border border-border-subtle p-4">
          <div className="flex-1 relative">
            <input 
              type="text" 
              placeholder={tc('search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-background-subtle border border-border-subtle font-medium text-[13px] outline-none focus:border-consorci-darkBlue"
            />
            <svg className="w-4 h-4 absolute left-3.5 top-3 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-background-subtle border border-border-subtle font-medium text-[13px] outline-none min-w-[200px]"
          >
            <option value="all">{t('all_statuses') || 'Todos los estados'}</option>
            <option value="pending">{t('pending_validation') || 'Pendientes'}</option>
            <option value="validated">{t('fully_validated') || 'Validados'}</option>
          </select>
        </div>

        {/* List of Verifications (High Density) */}
        <div className="bg-background-surface border border-border-subtle overflow-hidden">
          <table className="w-full text-left table-fixed">
            <thead>
              <tr className="bg-background-subtle border-b border-border-subtle">
                <th className="px-6 py-4 w-[40px]">
                  <input 
                    type="checkbox" 
                    checked={selectedDocs.length > 0}
                    onChange={toggleAllSelection}
                    className="w-4 h-4 border-border-subtle rounded-none accent-consorci-darkBlue cursor-pointer"
                  />
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-text-muted uppercase tracking-wider w-[25%]">{t('table_student') || 'Alumno'}</th>
                <th className="px-6 py-4 text-[11px] font-bold text-text-muted uppercase tracking-wider w-[25%]">{t('table_center_workshop')}</th>
                <th className="px-6 py-4 text-[11px] font-bold text-text-muted uppercase tracking-wider w-[40%]">{t('table_docs')}</th>
                <th className="px-6 py-4 text-[11px] font-bold text-text-muted uppercase tracking-wider w-[60px] text-right">{tc('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Loading message={tc('loading')} />
                  </td>
                </tr>
              ) : paginatedEnrollments.length > 0 ? (
                paginatedEnrollments.map((row) => (
                  <tr 
                    key={row.enrollmentId} 
                    onClick={() => setSelectedRow(row)}
                    className={`cursor-pointer transition-colors group border-l-2 ${selectedRow?.enrollmentId === row.enrollmentId ? 'bg-consorci-darkBlue/5 border-consorci-darkBlue' : 'hover:bg-background-subtle/50 border-transparent'}`}
                  >
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                       <input 
                        type="checkbox" 
                        checked={selectedDocs.some(d => d.enrollmentId === row.enrollmentId)}
                        onChange={() => toggleRowSelection(row)}
                        className="w-4 h-4 border-border-subtle rounded-none accent-consorci-darkBlue cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="font-semibold text-text-primary text-[14px] leading-tight mb-1">{row.student?.fullName}</div>
                      <div className="text-[11px] text-text-muted truncate">ID: {row.student?.idalu}</div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="font-medium text-text-primary text-[13px] leading-tight mb-0.5 truncate">{row.centerName}</div>
                      <div className="text-[12px] font-medium text-consorci-darkBlue truncate mb-2">{row.workshopTitle}</div>
                      {row.startDate && (
                        <div className="flex items-center gap-2 text-[10px] font-bold text-text-muted opacity-60">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(row.startDate).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' })}
                          {row.endDate && ` - ${new Date(row.endDate).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' })}`}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="flex flex-wrap gap-x-6 gap-y-3">
                        {[
                          { id: 'pedagogical', name: t('doc_names.agreement'), url: row.pedagogicalAgreementUrl, valid: row.isPedagogicalAgreementValidated, field: 'isPedagogicalAgreementValidated' },
                          { id: 'mobility', name: t('doc_names.mobility'), url: row.mobilityAuthorizationUrl, valid: row.isMobilityAuthorizationValidated, field: 'isMobilityAuthorizationValidated' },
                          { id: 'image', name: t('doc_names.rights'), url: row.imageRightsUrl, valid: row.isImageRightsValidated, field: 'isImageRightsValidated' }
                        ].map(doc => (
                          <div key={doc.id} className="flex items-center gap-2.5 min-w-[100px]">
                            
                            <div className="flex flex-col">
                              {doc.url ? (
                                <div className="flex items-center gap-2">
                                  <a 
                                    href={`${process.env.NEXT_PUBLIC_API_URL}${doc.url}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`text-[11px] font-bold ${doc.valid ? 'text-green-600' : 'text-text-primary hover:text-consorci-darkBlue underline decoration-border-subtle underline-offset-4'}`}
                                  >
                                    {doc.name}
                                  </a>
                                  {!doc.valid && (
                                    <button 
                                      onClick={() => handleValidateDocument(row.enrollmentId, doc.field, true)}
                                      className="text-[9px] bg-green-600 text-white px-1.5 py-0.5 font-black hover:bg-black transition-colors"
                                    >
                                      OK
                                    </button>
                                  )}
                                  {doc.valid && (
                                    <button 
                                      onClick={() => handleValidateDocument(row.enrollmentId, doc.field, false)}
                                      className="text-[9px] text-red-500 hover:text-red-700 font-bold"
                                    >
                                      ✕
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <span className="text-[11px] font-medium text-text-muted opacity-40 italic">{doc.name}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right align-top">
                      <button
                        onClick={() => handleOpenNotification(row as any, 'select')}
                        className="p-2 text-text-muted hover:text-red-500 hover:bg-red-50 transition-all"
                        title={t('report_problem_hint')}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="text-text-muted text-[13px] font-medium italic opacity-60 italic">{tc('no_results') || 'No se han encontrado resultados'}</div>
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
          totalItems={filteredEnrollments.length}
          currentItemsCount={paginatedEnrollments.length}
          itemName={tc('students') || 'alumnos'}
        />
      </div>

      {/* Slide-over Side Panel */}
      {selectedRow && (
        <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-background-surface shadow-2xl z-50 animate-in slide-in-from-right duration-300 border-l border-border-subtle flex flex-col">
          <div className="p-6 border-b border-border-subtle bg-background-subtle flex justify-between items-center">
            <div>
              <h3 className="text-[16px] font-bold text-text-primary leading-tight">{selectedRow.student?.fullName}</h3>
              <p className="text-[12px] text-text-muted font-medium mt-1">{selectedRow.workshopTitle} · {selectedRow.centerName}</p>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); setSelectedRow(null); }}
              className="p-2 hover:bg-background-surface transition-colors"
            >
              <svg className="w-6 h-6 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-10">
            {[
              { id: 'pedagogical', name: t('doc_names.agreement'), url: selectedRow.pedagogicalAgreementUrl, valid: selectedRow.isPedagogicalAgreementValidated, field: 'isPedagogicalAgreementValidated' },
              { id: 'mobility', name: t('doc_names.mobility'), url: selectedRow.mobilityAuthorizationUrl, valid: selectedRow.isMobilityAuthorizationValidated, field: 'isMobilityAuthorizationValidated' },
              { id: 'image', name: t('doc_names.rights'), url: selectedRow.imageRightsUrl, valid: selectedRow.isImageRightsValidated, field: 'isImageRightsValidated' }
            ].map(doc => (
              <div key={doc.id} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-[13px] font-bold uppercase tracking-wider text-text-primary flex items-center gap-3">
                    {doc.name}
                  </h4>
                  <div className="flex gap-3">
                    {doc.url && (
                        <>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleValidateDocument(selectedRow.enrollmentId, doc.field, !doc.valid); }}
                            className={`px-6 py-2 text-[11px] font-bold transition-all ${
                              doc.valid 
                                ? 'bg-red-50 text-red-600 border border-red-500/20 hover:bg-red-500 hover:text-white' 
                                : 'bg-green-600 text-white hover:bg-black shadow-lg shadow-green-500/20'
                            }`}
                          >
                            {doc.valid ? t('btn_unvalidate') || 'Deshacer' : t('btn_validate') || 'Validar Ahora'}
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleOpenNotification(selectedRow, doc.id); }}
                            className="px-4 py-2 border border-border-subtle text-text-muted text-[11px] font-medium hover:bg-background-subtle"
                          >
                            {t('report_problem_btn')}
                          </button>
                        </>
                    )}
                  </div>
                </div>

                {doc.url ? (
                  <div className="aspect-[1.41] w-full bg-background-subtle border border-border-subtle overflow-hidden relative group">
                    <iframe 
                      src={`${process.env.NEXT_PUBLIC_API_URL}${doc.url}#toolbar=0`}
                      className="w-full h-full"
                      title={doc.name}
                    />
                    <a 
                      href={`${process.env.NEXT_PUBLIC_API_URL}${doc.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute top-4 right-4 bg-black/80 text-white p-2.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Abrir en pestaña nueva"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                ) : (
                  <div className="py-12 border-2 border-dashed border-border-subtle text-center">
                    <p className="text-[12px] font-medium text-text-muted opacity-40 italic">{t('doc_not_uploaded') || 'Documento no subido'}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notification Modal */}
      {showNotificationModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-6">
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
                  &quot;{t(`greetings.${notificationData.greeting}`)}, the document <span className="font-medium underline decoration-consorci-darkBlue/30">{notificationData.documentName === 'select' ? '[Document]' : t(`docs.${notificationData.documentName}`)}</span> of the workshop <span className="font-medium text-consorci-darkBlue">{selectedRow?.workshop?.title}</span> is incorrect because {notificationData.comment}&quot;
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
