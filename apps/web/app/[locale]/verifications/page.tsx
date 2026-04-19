'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import assignmentService, { Assignment } from '@/services/assignmentService';
import Loading from '@/components/Loading';
import Button from '@/components/ui/Button';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import DataTable, { Column } from '@/components/ui/DataTable';
import DataTableToolbar, { FilterSelect } from '@/components/ui/DataTableToolbar';
import { ClipboardCheck } from 'lucide-react';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, pending, problem, validated
  const [groupBy, setGroupBy] = useState<string | null>(null);

  const router = useRouter();
  const params = useParams();
  const locale = params?.locale || 'ca';

  const DOCUMENT_CONFIG = [
    { id: 'pedagogical', field: 'isPedagogicalAgreementValidated', urlField: 'pedagogicalAgreementUrl', label: 'A', nameKey: 'doc_names.agreement' },
    { id: 'mobility', field: 'isMobilityAuthorizationValidated', urlField: 'mobilityAuthorizationUrl', label: 'M', nameKey: 'doc_names.mobility' },
    { id: 'image', field: 'isImageRightsValidated', urlField: 'imageRightsUrl', label: 'R', nameKey: 'doc_names.rights' }
  ] as const;

  const flatEnrollments = useMemo(() => assignments.flatMap(assig =>
    (assig.enrollments || []).map(ins => ({
      ...ins,
      workshopTitle: assig.workshop?.title,
      centerName: assig.center?.name,
      assignmentId: assig.assignmentId,
      startDate: assig.startDate,
      endDate: assig.endDate,
      workshop: assig.workshop
    }))
  ), [assignments]);

  const filteredEnrollments = useMemo(() => flatEnrollments.filter(row => {
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
  }), [flatEnrollments, searchTerm, statusFilter]);


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
      // Optimistic update for immediate UI response
      if (selectedRow) {
        setSelectedRow({
          ...selectedRow,
          [field]: valid
        });
      }

      await assignmentService.validateDocument(idEnrollment, field, valid);
      loadData(); // Sync with server
    } catch (err) {
      console.error(err);
      toast.error(t('error_validate'));
      loadData(); // Rollback on error
    }
  };

  const toggleRowSelection = (row: any) => {
    const rowDocs = DOCUMENT_CONFIG
      .filter(doc => row[doc.urlField] && !row[doc.field])
      .map(doc => ({ enrollmentId: row.enrollmentId, field: doc.field }));

    setSelectedDocs(prev => {
      const isRowFullySelected = rowDocs.length > 0 && rowDocs.every(rd => prev.some(p => p.enrollmentId === rd.enrollmentId && p.field === rd.field));

      if (isRowFullySelected) {
        return prev.filter(p => p.enrollmentId !== row.enrollmentId);
      } else {
        const otherDocs = prev.filter(p => p.enrollmentId !== row.enrollmentId);
        return [...otherDocs, ...rowDocs];
      }
    });
  };

  const toggleAllSelection = () => {
    if (selectedDocs.length > 0) {
      setSelectedDocs([]);
    } else {
      const allPending = filteredEnrollments.flatMap(row =>
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

  const isAllPendingOnPageSelected = useMemo(() => {
    const allPendingOnPage = filteredEnrollments.flatMap(row =>
      DOCUMENT_CONFIG
        .filter(doc => row[doc.urlField] && !row[doc.field])
        .map(doc => ({ enrollmentId: row.enrollmentId, field: doc.field }))
    );
    return allPendingOnPage.length > 0 && allPendingOnPage.every(rd =>
      selectedDocs.some(sd => sd.enrollmentId === rd.enrollmentId && sd.field === rd.field)
    );
  }, [filteredEnrollments, selectedDocs]);

  const columns: Column<any>[] = [
    {
      header: '',
      align: 'center',
      headerClassName: 'w-[60px]',
      render: (row) => {
        const rowPendingDocs = DOCUMENT_CONFIG.filter(doc => row[doc.urlField] && !row[doc.field]);
        if (rowPendingDocs.length === 0) return null;

        const isRowFullySelected = rowPendingDocs.every(rd =>
          selectedDocs.some(sd => sd.enrollmentId === row.enrollmentId && sd.field === rd.field)
        );

        return (
          <div className="flex items-center justify-center">
            <input
              type="checkbox"
              checked={isRowFullySelected}
              onChange={() => toggleRowSelection(row)}
              className="w-4 h-4 border-border-subtle accent-consorci-darkBlue cursor-pointer"
            />
          </div>
        );
      }
    },
    {
      header: "Alumne",
      render: (row) => (
        <div onClick={() => setSelectedRow(row)} className="cursor-pointer">
          <div className="table-primary">{row.student?.fullName}</div>
        </div>
      ),
      width: 200
    },
    {
      header: "Centre",
      render: (row) => (
        <span onClick={() => setSelectedRow(row)} className="cursor-pointer table-detail font-medium whitespace-nowrap">{row.centerName}</span>
      ),
      width: 250
    },
    {
      header: "Taller",
      render: (row) => (
        <span onClick={() => setSelectedRow(row)} className="cursor-pointer table-tag-blue font-bold mt-0.5 whitespace-nowrap">{row.workshopTitle}</span>
      ),
      width: 300
    },
    {
      header: "Documents",
      render: (row) => (
        <div className="flex items-center gap-4">
          {DOCUMENT_CONFIG.map((docConfig) => {
            const url = row[docConfig.urlField];
            const valid = row[docConfig.field];
            return (
              <div
                key={docConfig.id}
                title={url ? (valid ? 'Validat' : 'Pendent') : 'No pujat'}
                className={`text-[10px] font-bold ${url
                  ? valid
                    ? 'text-[var(--pastel-green)]'
                    : 'text-[var(--pastel-orange)]'
                  : 'text-text-muted opacity-20'
                  }`}
              >
                {docConfig.label}
              </div>
            );
          })}
        </div>
      ),
      width: 150,
      align: 'center'
    },
    {
      header: tc('actions'),
      align: 'right',
      render: (row) => (
        <Button
          onClick={() => setSelectedRow(row)}
          variant="outline"
          size="sm"
          className="!px-4 !py-2 font-bold !text-[11px] !text-text-muted hover:!text-consorci-darkBlue"
        >
          {tc('view')}
        </Button>
      )
    }
  ];

  if (authLoading || !user) {
    return <Loading fullScreen message={tc('authenticating')} />;
  }

  return (
    <DashboardLayout
      title={t('title')}
      subtitle={t('subtitle')}
    >
      <div className="space-y-6">
        <DataTableToolbar
          search={{
            value: searchTerm,
            onChange: setSearchTerm,
            placeholder: tc('search')
          }}
          onClear={() => {
            setSearchTerm('');
            setStatusFilter('all');
            setGroupBy(null);
          }}
          groups={{
            value: groupBy || '',
            onChange: setGroupBy,
            options: [
              { label: 'Centre', value: 'centerName' },
              { label: 'Taller', value: 'workshopTitle' }
            ]
          }}
          filters={
            <FilterSelect
              label={t('all_statuses') || 'Tots els estats'}
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { label: t('all_statuses') || 'Tots els estats', value: 'all' },
                { label: t('pending_validation') || 'Pendents de Validar', value: 'pending' },
                { label: t('fully_validated') || 'Tots Validats', value: 'validated' },
              ]}
              icon={ClipboardCheck}
            />
          }
          actions={
            selectedDocs.length > 0 && (
              <Button
                onClick={handleBulkApprove}
                disabled={loading}
                loading={loading}
                variant="primary"
                className="px-8 h-full font-bold !text-[11px] uppercase tracking-widest"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {t('btn_bulk_approve') || 'Validació Massiva'} ({selectedDocs.length})
              </Button>
            )
          }
        />

        <div className="flex justify-start px-2">
          <label className="flex items-center gap-2 text-[11px] font-bold text-text-muted uppercase cursor-pointer hover:text-consorci-darkBlue transition-colors">
            <input
              type="checkbox"
              checked={isAllPendingOnPageSelected}
              onChange={toggleAllSelection}
              className="w-4 h-4 border-border-subtle accent-consorci-darkBlue cursor-pointer"
            />
            {t('select_all_pending_page') || 'Seleccionar tots los pendents de la pàgina'}
          </label>
        </div>

        <DataTable
          data={filteredEnrollments}
          columns={columns}
          loading={loading && assignments.length === 0}
          emptyMessage={tc('no_results')}
          getRowId={(row) => row.student?.idalu || row.enrollmentId}
          rowClassName={(row) => selectedRow?.enrollmentId === row.enrollmentId ? 'bg-consorci-darkBlue/5' : ''}
          hideTopBorder
          groupBy={groupBy}
          onGroupByChange={setGroupBy}
        />
      </div>

      {/* Modern Side Drawer for Details */}
      {selectedRow && (
        <div className="fixed inset-0 z-50 flex justify-end overflow-hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setSelectedRow(null)} />
          <div className="relative w-full max-w-2xl bg-background-surface border-l border-border-subtle flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-8 border-b border-border-subtle bg-background-subtle flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-text-primary tracking-tight">{selectedRow.student?.fullName}</h3>
                <p className="text-[13px] font-medium text-text-muted mt-1">{selectedRow.workshopTitle} • {selectedRow.centerName}</p>
              </div>
                <Button 
                  variant="subtle"
                  onClick={() => setSelectedRow(null)} 
                  className="!p-2 !h-auto !bg-transparent text-text-muted hover:!text-red-500"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-12">
              {DOCUMENT_CONFIG.map(doc => {
                const url = selectedRow[doc.urlField];
                const valid = selectedRow[doc.field];
                return (
                  <div key={doc.id} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <h4 className="text-[13px] font-bold uppercase tracking-widest text-text-primary">{t(doc.nameKey)}</h4>
                      </div>
                      <div className="flex gap-3">
                        {url && (
                          <>
                            <Button
                              onClick={() => handleValidateDocument(selectedRow.enrollmentId, doc.field, !valid)}
                              variant={valid ? 'outline' : 'primary'}
                              size="sm"
                              className={`px-6 !py-2 !font-bold ${valid ? 'hover:!bg-red-50 hover:!text-red-600 hover:!border-red-500/20' : ''}`}
                            >
                              {valid ? t('btn_unvalidate') : t('btn_validate')}
                            </Button>
                            <Button
                              onClick={() => handleOpenNotification(selectedRow, doc.id)}
                              variant="outline"
                              size="sm"
                              className="!px-4 !py-2 !text-text-muted hover:!bg-background-subtle"
                            >
                              {t('report_problem_btn')}
                            </Button>
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
          <div className="bg-background-surface w-full max-xl border border-border-subtle">
            <div className="p-8 border-b border-border-subtle bg-background-subtle flex justify-between items-center">
              <h3 className="text-lg font-bold text-text-primary tracking-tight flex items-center gap-3">
                <svg className="w-5 h-5 text-consorci-darkBlue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {t('report_modal_title')}
              </h3>
              <Button 
                variant="subtle"
                onClick={() => setShowNotificationModal(false)} 
                className="!p-2 !h-auto !bg-transparent text-text-muted hover:!text-red-500"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </Button>
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
                <Button
                  onClick={() => setShowNotificationModal(false)}
                  variant="outline"
                  className="flex-1 !py-4 !text-text-muted font-bold !text-[13px]"
                >
                  {tc('cancel')}
                </Button>
                <Button
                  onClick={sendNotification}
                  disabled={sendingNotif || notificationData.documentName === 'select' || !notificationData.comment}
                  loading={sendingNotif}
                  variant="primary"
                  className="flex-[2] !py-4 font-bold !text-[13px]"
                >
                  {t('send_notification')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
