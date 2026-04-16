'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from '@/context/AuthContext';
import { REQUEST_STATUSES } from '@iter/shared';
import DashboardLayout from '@/components/DashboardLayout';
import workshopService, { Workshop } from '@/services/workshopService';
import requestService, { Request } from '@/services/requestService';
import assignmentService from '@/services/assignmentService';
import centerService, { Center } from '@/services/centerService';
import api from '@/services/api';
import Loading from '@/components/Loading';
import { toast } from 'sonner';
import ConfirmDialog from '@/components/ConfirmDialog';
import Pagination from '@/components/Pagination';
import DataTable, { Column } from '@/components/ui/DataTable';
import FilterPanel from '@/components/ui/FilterPanel';
import Avatar from '@/components/Avatar';

export default function AdminRequestsPage() {
  const t = useTranslations('Admin.Requests');
  const tc = useTranslations('Common');
  const tForm = useTranslations('Forms');

  const { user, loading: authLoading } = useAuth();
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [centers, setCenters] = useState<Center[]>([]);
  const [_phases, _setPhases] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCenterId, setSelectedCenterId] = useState<string>('');
  const [selectedModality, setSelectedModality] = useState<string>('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Dialog states
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    isDestructive?: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { },
  });

  const router = useRouter();

  const fetchData = async () => {
    try {
      setLoading(true);
      const apiInstance = api();
      const [fetchedWorkshops, fetchedRequests, fetchedPhases, fetchedCenters] = await Promise.all([
        workshopService.getAll(),
        requestService.getAll(),
        apiInstance.get('/phases'),
        centerService.getAll()
      ]);
      setWorkshops(fetchedWorkshops);
      setRequests(fetchedRequests);
      _setPhases(fetchedPhases.data);
      setCenters(fetchedCenters);
    } catch (err) {
      console.error(err);
      setError(tc('error_loading'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && (!user || user.role.name !== 'ADMIN')) {
      router.push('/login');
      return;
    }

    if (user) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, router]);

  const handleApprove = (requestId: number) => {
    setConfirmConfig({
      isOpen: true,
      title: t('approve_title'),
      message: t('approve_confirm'),
      onConfirm: async () => {
        try {
          // Optimistic update: status and a mock assignment to trigger UI change
          setRequests(prev => prev.map(r => r.requestId === requestId ? {
            ...r,
            status: REQUEST_STATUSES.APPROVED,
            assignments: [{ id: 0 }] // Mock to trigger "Assigned" label
          } : r));

          await requestService.updateStatus(requestId, REQUEST_STATUSES.APPROVED);
          await assignmentService.createFromRequest(requestId);
          await fetchData(); // Final sync with real data
        } catch (err) {
          await fetchData();
          toast.error(t('error_approve'));
        }
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleReject = async (requestId: number) => {
    setConfirmConfig({
      isOpen: true,
      title: t('reject_title'),
      message: t('reject_confirm'),
      isDestructive: true,
      onConfirm: async () => {
        try {
          // Optimistic update
          setRequests(prev => prev.map(r => r.requestId === requestId ? { ...r, status: REQUEST_STATUSES.REJECTED } : r));

          await requestService.updateStatus(requestId, REQUEST_STATUSES.REJECTED);
          await fetchData();
        } catch (err) {
          await fetchData();
          toast.error(t('error_reject'));
        }
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleRunTetris = () => {
    setConfirmConfig({
      isOpen: true,
      title: t('tetris_title'),
      message: t('tetris_confirm'),
      onConfirm: async () => {
        setLoading(true);
        try {
          const result = await assignmentService.runTetris() as { assignmentsCreated: number };
          toast.success(t('success_tetris', { count: result.assignmentsCreated }));
          await fetchData();
        } catch (err: unknown) {
          const errorMessage = (err as { response?: { data?: { error?: string } }, message?: string })?.response?.data?.error
            || (err as Error).message
            || 'Unknown error';
          toast.error(t('error_tetris') + errorMessage);
        } finally {
          setLoading(false);
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<Request | null>(null);
  const [editFormData, setEditFormData] = useState({ studentsAprox: 0, comments: '' });

  const handleEditClick = (request: Request) => {
    setEditingRequest(request);
    setEditFormData({
      studentsAprox: request.studentsAprox || 0,
      comments: request.comments || ''
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRequest) return;

    try {
      await requestService.update(editingRequest.requestId, {
        studentsAprox: editFormData.studentsAprox,
        comments: editFormData.comments
      });
      toast.success(t('success_update'));
      setIsEditModalOpen(false);
      setEditingRequest(null);
      await fetchData();
    } catch (err) {
      toast.error(t('error_update'));
    }
  };

  // Column definition for the requests table
  const columns: Column<Request>[] = [
    {
      header: "ID",
      render: (r) => <span className="font-mono text-[10px] opacity-50">{r.requestId}</span>,
      width: 60,
      align: 'center'
    },
    {
      header: "",
      render: (r) => <Avatar name={r.center?.name || "Center"} size="sm" type="center" />,
      width: 50,
      align: 'center'
    },
    {
      header: "Centre",
      render: (r) => <span className="font-semibold text-text-primary underline decoration-border-subtle underline-offset-4">{r.center?.name}</span>,
      width: 250
    },
    {
      header: "Data",
      render: (r) => <span className="text-[11px] font-medium text-text-muted">{new Date(r.createdAt).toLocaleDateString()}</span>,
      width: 120,
      align: 'center'
    },
    {
      header: t('table_teachers'),
      render: (r) => (
        <div className="space-y-1.5">
          {(r.assignment as any)?.teachers && (r.assignment as any).teachers.length > 0 ? (
            (r.assignment as any).teachers.map((t: any, idx: number) => (
              <div key={idx} className="flex items-center gap-2 text-[12px] font-medium text-text-secondary">
                <span className="w-4 h-4 bg-consorci-darkBlue/10 flex items-center justify-center text-[8px] font-bold text-consorci-darkBlue">{idx + 1}</span>
                {t.fullName}
              </div>
            ))
          ) : (
            <>
              <div className="flex items-center gap-2 text-[12px] font-medium text-text-secondary">
                <span className="w-4 h-4 bg-consorci-darkBlue/10 flex items-center justify-center text-[8px] font-bold text-consorci-darkBlue">1</span>
                {r.teacher1?.name || (r.teacher1Id ? `${tc('teachers')} ${r.teacher1Id}` : '-')}
              </div>
              <div className="flex items-center gap-2 text-[12px] font-medium text-text-secondary">
                <span className="w-4 h-4 bg-consorci-darkBlue/10 flex items-center justify-center text-[8px] font-bold text-consorci-darkBlue">2</span>
                {r.teacher2?.name || (r.teacher2Id ? `${tc('teachers')} ${r.teacher2Id}` : '-')}
              </div>
            </>
          )}
        </div>
      )
    },
    {
      header: "Alumnes",
      align: 'center',
      render: (r) => (
        <span className="text-sm font-bold text-text-primary px-3">{r.studentsAprox}</span>
      ),
      width: 100
    },
    {
      header: t('table_status'),
      align: 'center',
      render: (r) => (
        <div className="flex items-center justify-center gap-2">
          {r.status === REQUEST_STATUSES.APPROVED ? (
            <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : r.status === REQUEST_STATUSES.REJECTED ? (
            <svg className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="h-4 w-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          <span className={`text-[11px] font-bold ${
            r.status === REQUEST_STATUSES.APPROVED ? 'text-green-600' :
            r.status === REQUEST_STATUSES.REJECTED ? 'text-red-600' :
            'text-orange-600'
          }`}>
            {r.status === REQUEST_STATUSES.PENDING ? tc('pending') : r.status === REQUEST_STATUSES.APPROVED ? t('assigned') : t('rejected')}
          </span>
        </div>
      )
    },
    {
      header: tc('actions'),
      align: 'center',
      render: (r) => (
        <div className="flex justify-center gap-2">
          {r.status === REQUEST_STATUSES.REJECTED ? (
            <span className="text-[11px] font-bold text-text-muted/60 uppercase tracking-wider">{t('rejected')}</span>
          ) : (r as Request & { assignments?: unknown[] }).assignments && (r as Request & { assignments?: unknown[] }).assignments!.length > 0 ? (
            <span className="text-[11px] font-bold text-consorci-lightBlue uppercase tracking-wider">{t('assigned')}</span>
          ) : (
            <>
              <button
                onClick={() => handleEditClick(r)}
                className="btn-raw"
                title={tc('edit')}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
              {r.status === REQUEST_STATUSES.PENDING && (
                <button
                  onClick={() => handleApprove(r.requestId)}
                  className="btn-raw text-green-600 hover:text-green-700"
                  title={t('approve_btn')}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </button>
              )}
              <button
                onClick={() => handleReject(r.requestId)}
                className="btn-raw-destructive"
                title={t('reject_btn')}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </>
          )}
        </div>
      )
    }
  ];

  // Filtered Requests based on Center Selection
  const filteredRequests = useMemo(() => {
    return requests.filter(r => {
      const matchesCenter = !selectedCenterId || r.centerId === parseInt(selectedCenterId);
      return matchesCenter;
    });
  }, [requests, selectedCenterId]);

  // Grouped requests by workshop
  const workshopRequests = useMemo(() => {
    const map: Record<number, Request[]> = {};
    filteredRequests.forEach(r => {
      if (!map[r.workshopId]) map[r.workshopId] = [];
      map[r.workshopId].push(r);
    });
    return map;
  }, [filteredRequests]);

  // Final filtered workshops
  const filteredWorkshops = useMemo(() => {
    const query = searchQuery.toLowerCase();

    return workshops.filter(w => {
      const matchesSearch = !searchQuery ||
        w.title.toLowerCase().includes(query) ||
        w.sector.toLowerCase().includes(query);

      const matchesModality = !selectedModality || w.modality === selectedModality;

      const hasRequestsAfterFilter = workshopRequests[parseInt(w._id)]?.length > 0;

      return matchesSearch && matchesModality && hasRequestsAfterFilter;
    });
  }, [workshops, searchQuery, selectedModality, workshopRequests]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCenterId, selectedModality]);

  const totalPages = Math.ceil(filteredWorkshops.length / itemsPerPage);
  const paginatedWorkshops = filteredWorkshops.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (authLoading || !user) {
    return <Loading fullScreen message={tc('authenticating')} />;
  }

  const headerActions = (
    <button
      onClick={handleRunTetris}
      className="bg-consorci-darkBlue text-white px-8 py-3.5 text-[13px] font-semibold transition-all hover:bg-black hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center gap-3 h-[49px]"
    >
      <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.5 2L14 9L21 11.5L14 14L11.5 21L9 14L2 11.5L9 9L11.5 2Z" />
      </svg>
      {t('run_tetris_btn')}
    </button>
  );

  return (
    <DashboardLayout
      title={t('title')}
      subtitle={t('subtitle')}
      actions={headerActions}
    >
      <FilterPanel
        onClear={() => {
          setSearchQuery('');
          setSelectedCenterId('');
          setSelectedModality('');
        }}
        clearLabel={tc('clear_filters')}
      >
        {/* Search */}
        <div className="space-y-2.5">
          <label className="text-[11px] font-bold text-text-muted px-1 uppercase tracking-wider">{tc('search_by_title')}</label>
          <div className="relative group">
            <input
              type="text"
              placeholder={tc('search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-background-subtle border border-border-subtle focus:border-consorci-lightBlue outline-none text-sm font-medium text-text-primary placeholder:text-text-muted transition-all"
            />
            <svg className="absolute left-4 top-4 h-4 w-4 text-text-muted group-focus-within:text-consorci-lightBlue transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Center Filter */}
        <div className="space-y-2.5">
          <label className="text-[11px] font-bold text-text-muted px-1 uppercase tracking-wider">{tc('educational_center')}</label>
          <div className="relative">
            <select
              value={selectedCenterId}
              onChange={(e) => setSelectedCenterId(e.target.value)}
              className="w-full px-4 py-3.5 bg-background-subtle border border-border-subtle focus:border-consorci-lightBlue outline-none text-sm font-medium text-text-primary appearance-none transition-all"
            >
              <option value="">{tc('all_centers')}</option>
              {centers.map(c => (
                <option key={c.centerId} value={c.centerId}>{c.name}</option>
              ))}
            </select>
            <svg className="absolute right-4 top-4 h-4 w-4 text-text-muted pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Modality Filter */}
        <div className="space-y-2.5">
          <label className="text-[11px] font-bold text-text-muted px-1 uppercase tracking-wider">Modalitat</label>
          <div className="relative">
            <select
              value={selectedModality}
              onChange={(e) => setSelectedModality(e.target.value)}
              className="w-full px-4 py-3.5 bg-background-subtle border border-border-subtle focus:border-consorci-lightBlue outline-none text-sm font-medium text-text-primary appearance-none transition-all"
            >
              <option value="">{tc('all_modalities')}</option>
              <option value="A">{tc('modality_label', { modality: 'A' })}</option>
              <option value="B">{tc('modality_label', { modality: 'B' })}</option>
              <option value="C">{tc('modality_label', { modality: 'C' })}</option>
            </select>
            <svg className="absolute right-4 top-4 h-4 w-4 text-text-muted pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </FilterPanel>

      {loading ? (
        <Loading message={tc('loading')} />
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-500 p-6">
          <p className="text-red-700 font-bold text-sm">{error}</p>
        </div>
      ) : filteredWorkshops.length > 0 ? (
        <div className="space-y-12">
          {paginatedWorkshops.map(workshop => {
            const workshopId = parseInt(workshop._id);
            const currentRequests = workshopRequests[workshopId] || [];
            return (
              <section key={workshop._id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center justify-between mb-6 pb-4 mt-16 border-b border-border-subtle/50">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-consorci-darkBlue/5 dark:bg-consorci-lightBlue/10 flex items-center justify-center">
                      <svg className="w-6 h-6 text-consorci-darkBlue dark:text-consorci-lightBlue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold text-text-primary tracking-tight leading-tight">{workshop.title}</h3>
                      <div className="flex items-center gap-3 mt-1.5 font-medium">
                        <span className="text-[12px] text-text-muted">{workshop.sector}</span>
                        <span className="w-1 h-1 bg-text-muted/30 rounded-full"></span>
                        <span className={`text-[10px] uppercase tracking-wider font-bold ${workshop.modality === 'A' ? 'text-green-600' :
                          workshop.modality === 'B' ? 'text-orange-600' :
                            'text-consorci-darkBlue'
                          }`}>{tc('modality_label', { modality: workshop.modality })}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <DataTable
                  tableId={`requests_workshop_${workshopId}`}
                  variant="simple"
                  data={currentRequests}
                  columns={columns}
                  emptyMessage={t('no_requests')}
                />
              </section>
            );
          })}

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredWorkshops.length}
            currentItemsCount={paginatedWorkshops.length}
            itemName={tc('workshops').toLowerCase()}
          />
        </div>
      ) : (
        <div className="bg-background-surface border border-dashed border-border-subtle p-20 text-center">
          <p className="text-text-muted text-xs font-black uppercase tracking-widest">{t('no_requests')}</p>
        </div>
      )}
      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background-page/40 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-background-surface max-w-lg w-full p-12 border border-border-subtle slide-in-from-bottom-8 animate-in duration-500">
            <div className="flex flex-col items-center text-center mb-10">
              <div className="w-16 h-16 bg-consorci-darkBlue/5 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-consorci-darkBlue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-text-primary tracking-tight">{t('edit_title')}</h3>
              <p className="text-sm text-text-muted mt-2 font-medium">{tc('review_data')}</p>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-8">
              <div className="space-y-2.5">
                <label className="block text-[11px] font-bold text-text-muted px-1 uppercase tracking-wider">{t('num_students')}</label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    className="w-full bg-background-subtle border border-border-subtle px-4 py-3.5 text-sm font-bold text-text-primary focus:border-consorci-lightBlue outline-none transition-all"
                    value={editFormData.studentsAprox || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, studentsAprox: e.target.value === '' ? 0 : parseInt(e.target.value) })}
                  />
                  <div className="absolute right-4 top-3.5 text-xs font-bold text-text-muted pointer-events-none">{t('students_label')}</div>
                </div>
              </div>
              <div className="space-y-2.5">
                <label className="block text-[11px] font-bold text-text-muted px-1 uppercase tracking-wider">{t('comments')}</label>
                <textarea
                  className="w-full bg-background-subtle border border-border-subtle px-4 py-3.5 text-sm text-text-primary font-medium focus:border-consorci-lightBlue outline-none h-40 resize-none transition-all"
                  placeholder={t('observations_placeholder')}
                  value={editFormData.comments}
                  onChange={(e) => setEditFormData({ ...editFormData, comments: e.target.value })}
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-4 text-[13px] font-bold text-text-muted hover:text-text-primary hover:bg-background-subtle transition-all"
                >
                  {tc('cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-[1.5] py-4 bg-consorci-darkBlue text-white text-[13px] font-bold transition-all hover:bg-black hover:scale-[1.02] active:scale-[0.98]"
                >
                  {tc('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
        isDestructive={confirmConfig.isDestructive}
      />
    </DashboardLayout>
  );
}
