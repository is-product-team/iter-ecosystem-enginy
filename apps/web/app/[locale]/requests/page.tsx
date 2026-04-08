'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
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
import Pagination from "@/components/Pagination";

export default function AdminRequestsPage() {
  const t = useTranslations('RequestsPage');
  const tCommon = useTranslations('Common');
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
      setError(tCommon('loading_error'));
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
  }, [user, authLoading, router]);

  const handleApprove = (requestId: number) => {
    setConfirmConfig({
      isOpen: true,
      title: t('request_approve_title'),
      message: t('request_approve_msg'),
      onConfirm: async () => {
        try {
          await requestService.updateStatus(requestId, REQUEST_STATUSES.APPROVED);
          await assignmentService.createFromRequest(requestId);
          await fetchData();
          toast.success(t('request_approved_success'));
        } catch (err) {
          toast.error(tCommon('save_error'));
        }
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleReject = async (requestId: number) => {
    setConfirmConfig({
      isOpen: true,
      title: t('request_reject_title'),
      message: t('request_reject_msg'),
      isDestructive: true,
      onConfirm: async () => {
        try {
          await requestService.updateStatus(requestId, REQUEST_STATUSES.REJECTED);
          await fetchData();
          toast.success(t('request_rejected_success'));
        } catch (err) {
          toast.error(tCommon('save_error'));
        }
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleRunTetris = () => {
    setConfirmConfig({
      isOpen: true,
      title: t('run_tetris_title'),
      message: t('run_tetris_msg'),
      onConfirm: async () => {
        setLoading(true);
        try {
          const result = await assignmentService.runTetris() as { assignmentsCreated: number };
          toast.success(t('tetris_success', { count: result.assignmentsCreated }));
          await fetchData();
        } catch (err: unknown) {
          const errorMessage = (err as { response?: { data?: { error?: string } }, message?: string })?.response?.data?.error 
            || (err as Error).message 
            || 'Unknown error';
          toast.error(tCommon('save_error') + ': ' + errorMessage);
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
  const [editFormData, setEditFormData] = useState({ approxStudents: 0, comments: '' });

  const handleEditClick = (request: Request) => {
    setEditingRequest(request);
    setEditFormData({
      approxStudents: request.studentsAprox || 0,
      comments: request.comments || ''
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRequest) return;

    try {
      await requestService.update(editingRequest.requestId, {
        studentsAprox: editFormData.approxStudents,
        comments: editFormData.comments
      });
      toast.success(tCommon('save_success'));
      setIsEditModalOpen(false);
      setEditingRequest(null);
      await fetchData();
    } catch (err) {
      toast.error(tCommon('save_error'));
    }
  };

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
    return <Loading fullScreen message={tCommon('loading')} />;
  }

  return (
    <DashboardLayout
      title={t('title')}
      subtitle={t('subtitle')}
    >
      {/* Filter Section */}
      <div className="space-y-6 mb-8">
        <div className="bg-white border border-gray-200 p-6 flex flex-col xl:flex-row gap-6 items-end">
          <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('search_workshop')}</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder={tForm('description_placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-[#00426B] outline-none text-xs font-bold"
                />
                <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Center Filter */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('educational_center')}</label>
              <select
                value={selectedCenterId}
                onChange={(e) => setSelectedCenterId(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-[#00426B] outline-none text-xs font-bold"
              >
                <option value="">{t('all_centers')}</option>
                {centers.map(c => (
                  <option key={c.centerId} value={c.centerId}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Modality Filter */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{tForm('modality')}</label>
              <select
                value={selectedModality}
                onChange={(e) => setSelectedModality(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-[#00426B] outline-none text-xs font-bold"
              >
                <option value="">{t('all_modalities')}</option>
                <option value="A">{t('mod_a')}</option>
                <option value="B">{t('mod_b')}</option>
                <option value="C">{t('mod_c')}</option>
              </select>
            </div>
          </div>

          <div className="hidden xl:block w-px h-10 bg-gray-200 mx-2"></div>

          <div className="flex w-full xl:w-auto">
            <button
              onClick={handleRunTetris}
              className="flex-1 xl:w-auto bg-[#00426B] text-white px-8 py-2.5 text-[10px] font-black uppercase tracking-widest hover:bg-[#0775AB] transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.5 2L14 9L21 11.5L14 14L11.5 21L9 14L2 11.5L9 9L11.5 2Z" />
                <path d="M19 14L20.2 17.5L23.7 18.7L20.2 19.9L19 23.4L17.8 19.9L14.3 18.7L17.8 17.5L19 14Z" />
              </svg>
              {t('automatic_assignment')}
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <Loading message={t('syncing')} />
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
                <div className="flex items-center gap-4 mb-4 border-b border-gray-100 pb-2">
                  <div className="h-6 w-1 bg-[#00426B]"></div>
                  <div>
                    <h3 className="text-lg font-black text-[#00426B] uppercase tracking-tight">{workshop.title}</h3>
                    <div className="flex items-center gap-3">
                      <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest">{workshop.sector}</span>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 border ${workshop.modality === 'A' ? 'border-green-200 bg-green-50 text-green-700' :
                        workshop.modality === 'B' ? 'border-orange-200 bg-orange-50 text-orange-700' :
                          'border-blue-200 bg-blue-50 text-blue-700'
                        }`}>MOD {workshop.modality}</span>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 bg-white">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('table_center_date')}</th>
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('table_teachers')}</th>
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">{t('table_students')}</th>
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('table_status')}</th>
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">{t('table_actions')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {currentRequests.map(r => (
                        <tr key={r.requestId} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="text-sm font-bold text-[#00426B]">{r.center?.name}</div>
                            <div className="text-[10px] font-bold text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-xs font-medium text-gray-700">1. {r.teacher1?.name || (r.teacher1Id ? `Teacher ${r.teacher1Id}` : '-')}</div>
                            <div className="text-xs font-medium text-gray-700">2. {r.teacher2?.name || (r.teacher2Id ? `Teacher ${r.teacher2Id}` : '-')}</div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="bg-gray-100 px-2 py-1 text-xs font-black text-[#00426B]">{r.studentsAprox}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-[9px] font-black uppercase px-2 py-1 border ${r.status === REQUEST_STATUSES.PENDING ? 'border-orange-200 text-orange-600 bg-orange-50' :
                              r.status === REQUEST_STATUSES.APPROVED ? 'border-green-200 text-green-600 bg-green-50' :
                                'border-red-200 text-red-600 bg-red-50'
                              }`}>
                              {r.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {r.status === REQUEST_STATUSES.REJECTED ? (
                              <span className="text-[9px] font-bold text-gray-300 uppercase italic">{t('rejected_status')}</span>
                            ) : (r as Request & { assignments?: unknown[] }).assignments && (r as Request & { assignments?: unknown[] }).assignments!.length > 0 ? (
                                <span className="text-[9px] font-bold text-gray-300 uppercase italic">{t('assigned_status')}</span>
                            ) : (
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => handleEditClick(r)}
                                  className="px-3 py-1.5 border border-gray-200 text-gray-600 hover:text-[#00426B] text-[9px] font-black uppercase tracking-widest hover:bg-gray-50 flex items-center gap-1"
                                >
                                  <svg className="w-3 h-3 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                  </svg>
                                  {tCommon('edit')}
                                </button>
                                {r.status === REQUEST_STATUSES.PENDING && (
                                  <button
                                    onClick={() => handleApprove(r.requestId)}
                                    className="px-3 py-1.5 bg-[#00426B] text-white text-[9px] font-black uppercase tracking-widest hover:bg-[#0775AB]"
                                  >
                                    {t('approve')}
                                  </button>
                                )}
                                <button
                                  onClick={() => handleReject(r.requestId)}
                                  className="px-3 py-1.5 border border-red-200 text-red-600 text-[9px] font-black uppercase tracking-widest hover:bg-red-50"
                                >
                                  {t('reject')}
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            );
          })}
          
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredWorkshops.length}
            currentItemsCount={paginatedWorkshops.length}
            itemName="workshops"
          />
        </div>
      ) : (
        <div className="bg-white border border-dashed border-gray-200 p-20 text-center">
          <p className="text-gray-400 text-xs font-black uppercase tracking-widest">{t('no_requests')}</p>
        </div>
      )}
      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white max-w-md w-full p-6 shadow-2xl border-t-4 border-[#00426B]">
            <h3 className="text-lg font-black text-[#00426B] uppercase mb-4">{t('edit_request')}</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('num_students')}</label>
                <input
                  type="number"
                  min="1"
                  className="w-full border border-gray-300 p-2 text-sm font-bold text-[#00426B] focus:border-[#00426B] outline-none"
                  value={editFormData.approxStudents || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, approxStudents: e.target.value === '' ? 0 : parseInt(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('comments')}</label>
                <textarea
                  className="w-full border border-gray-300 p-2 text-sm text-gray-600 focus:border-[#00426B] outline-none h-24 resize-none"
                  value={editFormData.comments}
                  onChange={(e) => setEditFormData({ ...editFormData, comments: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-gray-100"
                >
                  {tCommon('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00426B] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#0775AB]"
                >
                  {t('save_changes')}
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
