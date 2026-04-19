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
import Button from '@/components/ui/Button';
import { toast } from 'sonner';
import ConfirmDialog from '@/components/ConfirmDialog';
import Pagination from '@/components/Pagination';
import DataTable, { Column } from '@/components/ui/DataTable';
import DataTableToolbar, { FilterSelect } from '@/components/ui/DataTableToolbar';
import { School, Zap } from 'lucide-react';
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
      render: (r) => <span className="table-id">{r.requestId}</span>,
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
      render: (r) => <span className="table-primary">{r.center?.name}</span>,
      width: 200
    },
    {
      header: "Taller",
      render: (r) => <span className="table-detail font-semibold">{r.workshop?.title}</span>,
      width: 250
    },
    {
      header: "Data",
      render: (r) => <span className="table-detail">{new Date(r.createdAt).toLocaleDateString()}</span>,
      width: 100,
      align: 'center'
    },
    {
      header: "Alumnes",
      render: (r) => <span className="table-detail font-bold">{r.studentsAprox}</span>,
      width: 80,
      align: 'center'
    },
    {
      header: "Estat",
      render: (r) => {
        const s = r.status.toUpperCase();
        return (
          <span className={
            s === 'APPROVED' ? 'table-tag-green' :
            s === 'PENDING' ? 'table-tag-orange' :
            'table-tag-red'
          }>
            {t(`statuses.${r.status.toLowerCase()}`)}
          </span>
        );
      },
      width: 120,
      align: 'center'
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
          {r.status === REQUEST_STATUSES.PENDING && (
            <Button
              onClick={(e) => { e.stopPropagation(); handleApprove(r.requestId); }}
              variant="primary"
              size="sm"
              className="!px-4 !py-2 uppercase tracking-wider"
            >
              Asignar plazas
            </Button>
          )}
          <Button
            onClick={(e) => { e.stopPropagation(); handleEditClick(r); }}
            variant="subtle"
            size="sm"
            className="!p-1.5 hover:!text-consorci-darkBlue"
            title={tc('edit')}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </Button>
          <Button
            onClick={(e) => { e.stopPropagation(); handleReject(r.requestId); }}
            variant="subtle"
            size="sm"
            className="!p-1.5 hover:!text-red-500 hover:!bg-red-50"
            title={t('reject_btn')}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>
      ),
      width: 250
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

  const paginatedWorkshops = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredWorkshops.slice(start, end);
  }, [filteredWorkshops, currentPage]);

  const totalPages = Math.ceil(filteredWorkshops.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCenterId, selectedModality]);

  if (authLoading || !user) {
    return <Loading fullScreen message={tc('authenticating')} />;
  }

  const headerActions = (
    <Button
      onClick={handleRunTetris}
      variant="primary"
      size="md"
      className="px-8 !py-3.5 !text-[13px] h-[49px]"
    >
      <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.5 2L14 9L21 11.5L14 14L11.5 21L9 14L2 11.5L9 9L11.5 2Z" />
      </svg>
      {t('run_tetris_btn')}
    </Button>
  );

  return (
    <DashboardLayout
      title={t('title')}
      subtitle={t('subtitle')}
      actions={headerActions}
    >
      <DataTableToolbar
        search={{
          value: searchQuery,
          onChange: setSearchQuery,
          placeholder: tc('search_placeholder')
        }}
        onClear={() => {
          setSearchQuery('');
          setSelectedCenterId('');
          setSelectedModality('');
        }}
        filters={
          <>
            <FilterSelect
              label={tc('educational_center')}
              value={selectedCenterId}
              onChange={setSelectedCenterId}
              options={centers.map(c => ({ label: c.name, value: c.centerId.toString() }))}
              icon={School}
            />
            <FilterSelect
              label="Modalitat"
              value={selectedModality}
              onChange={setSelectedModality}
              options={[
                { label: tc('modality_label', { modality: 'A' }), value: 'A' },
                { label: tc('modality_label', { modality: 'B' }), value: 'B' },
                { label: tc('modality_label', { modality: 'C' }), value: 'C' },
              ]}
              icon={Zap}
            />
          </>
        }
      />

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
                  hideTopBorder
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
                <Button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  variant="subtle"
                  className="flex-1 !py-4 !font-bold !text-text-muted hover:!text-text-primary"
                >
                  {tc('cancel')}
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-[1.5] !py-4 !font-bold"
                >
                  {tc('save')}
                </Button>
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
