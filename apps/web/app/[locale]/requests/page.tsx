'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
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
      setError('Could not load data.');
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
      title: 'Approve Request',
      message: 'Are you sure you want to approve this request and generate the assignment immediately?',
      onConfirm: async () => {
        try {
          await requestService.updateStatus(requestId, REQUEST_STATUSES.APPROVED);
          await assignmentService.createFromRequest(requestId);
          await fetchData();
          toast.success('Request approved and assignment generated successfully.');
        } catch (err) {
          toast.error('Error in the approval process.');
        }
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleReject = async (requestId: number) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Reject Request',
      message: 'Are you sure you want to reject this request? This action cannot be undone.',
      isDestructive: true,
      onConfirm: async () => {
        try {
          await requestService.updateStatus(requestId, REQUEST_STATUSES.REJECTED);
          await fetchData();
          toast.success('Request rejected.');
        } catch (err) {
          toast.error('Error rejecting the request.');
        }
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleRunTetris = () => {
    setConfirmConfig({
      isOpen: true,
      title: 'Run Automatic Assignment',
      message: 'This action will process all pending approved requests and generate assignments for all centers. Continue?',
      onConfirm: async () => {
        setLoading(true);
        try {
          const result = await assignmentService.runTetris() as { assignmentsCreated: number };
          toast.success(`Assignment completed: ${result.assignmentsCreated} new assignments.`);
          await fetchData();
        } catch (err: unknown) {
          const errorMessage = (err as { response?: { data?: { error?: string } }, message?: string })?.response?.data?.error 
            || (err as Error).message 
            || 'Unknown error';
          toast.error('Error running Tetris: ' + errorMessage);
        } finally {
          setLoading(false);
        }
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
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
      toast.success('Request updated successfully.');
      setIsEditModalOpen(false);
      setEditingRequest(null);
      await fetchData();
    } catch (err) {
      toast.error('Error updating the request.');
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
    return <Loading fullScreen message="Verifying admin credentials..." />;
  }

  return (
    <DashboardLayout
      title="Request Management"
      subtitle="Monitor and manage educational center requests for the current course."
    >
      {/* Filter Section */}
      <div className="space-y-6 mb-8">
        <div className="bg-white border border-gray-200 p-6 flex flex-col xl:flex-row gap-6 items-end">
          <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <label className="text-[12px] font-medium text-text-primary px-1">Search Workshop</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ex: Robotics, Cinema..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-background-subtle border border-border-subtle focus:border-consorci-darkBlue outline-none text-sm font-medium text-text-primary placeholder:text-text-muted"
                />
                <svg className="absolute left-3 top-3 h-4 w-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Center Filter */}
            <div className="space-y-2">
              <label className="text-[12px] font-medium text-text-primary px-1">Educational Center</label>
              <select
                value={selectedCenterId}
                onChange={(e) => setSelectedCenterId(e.target.value)}
                className="w-full px-4 py-3 bg-background-subtle border border-border-subtle focus:border-consorci-darkBlue outline-none text-sm font-medium text-text-primary appearance-none"
              >
                <option value="">All centers</option>
                {centers.map(c => (
                  <option key={c.centerId} value={c.centerId}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Modality Filter */}
            <div className="space-y-2">
              <label className="text-[12px] font-medium text-text-primary px-1">Modality</label>
              <select
                value={selectedModality}
                onChange={(e) => setSelectedModality(e.target.value)}
                className="w-full px-4 py-3 bg-background-subtle border border-border-subtle focus:border-consorci-darkBlue outline-none text-sm font-medium text-text-primary appearance-none"
              >
                <option value="">All modalities</option>
                <option value="A">Modality A (Complete group)</option>
                <option value="B">Modality B (Half group)</option>
                <option value="C">Modality C (Individual projects)</option>
              </select>
            </div>
          </div>

          <div className="hidden xl:block w-px h-10 bg-gray-200 mx-2"></div>

          <div className="flex w-full xl:w-auto mt-4 xl:mt-0 px-1">
            <button
              onClick={handleRunTetris}
              className="flex-1 xl:w-auto bg-consorci-darkBlue text-white px-8 py-3 text-[13px] font-medium transition-all hover:bg-black active:scale-[0.98] flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.5 2L14 9L21 11.5L14 14L11.5 21L9 14L2 11.5L9 9L11.5 2Z" />
              </svg>
              Run automatic assignment
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <Loading message="Syncing requests..." />
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
                <div className="flex items-center gap-4 mb-4 border-b border-border-subtle pb-6 mt-12">
                  <div className="h-6 w-1 bg-consorci-darkBlue"></div>
                  <div>
                    <h3 className="text-xl font-medium text-text-primary tracking-tight">{workshop.title}</h3>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-[11px] font-medium text-text-muted">{workshop.sector}</span>
                      <span className={`text-[10px] font-medium px-2 py-0.5 border ${workshop.modality === 'A' ? 'border-green-200/50 bg-green-500/5 text-green-600' :
                        workshop.modality === 'B' ? 'border-orange-200/50 bg-orange-500/5 text-orange-600' :
                          'border-blue-200/50 bg-blue-500/5 text-blue-600'
                        }`}>Modality {workshop.modality}</span>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 bg-white">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-background-subtle border-b border-border-subtle">
                        <th className="px-6 py-4 text-[12px] font-medium text-text-primary">Center / Date</th>
                        <th className="px-6 py-4 text-[12px] font-medium text-text-primary">Teachers</th>
                        <th className="px-6 py-4 text-[12px] font-medium text-text-primary text-center">Students</th>
                        <th className="px-6 py-4 text-[12px] font-medium text-text-primary">Status</th>
                        <th className="px-6 py-4 text-[12px] font-medium text-text-primary text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle">
                      {currentRequests.map(r => (
                        <tr key={r.requestId} className="hover:bg-background-subtle transition-colors">
                          <td className="px-6 py-5">
                            <div className="text-sm font-medium text-text-primary">{r.center?.name}</div>
                            <div className="text-[11px] font-medium text-text-muted mt-1">{new Date(r.createdAt).toLocaleDateString()}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-xs font-medium text-gray-700">1. {r.teacher1?.name || (r.teacher1Id ? `Teacher ${r.teacher1Id}` : '-')}</div>
                            <div className="text-xs font-medium text-gray-700">2. {r.teacher2?.name || (r.teacher2Id ? `Teacher ${r.teacher2Id}` : '-')}</div>
                          </td>
                          <td className="px-6 py-5 text-center">
                            <span className="bg-background-subtle px-3 py-1.5 text-xs font-medium text-text-primary border border-border-subtle">{r.studentsAprox}</span>
                          </td>
                          <td className="px-6 py-5">
                            <span className={`text-[10px] font-medium px-2 py-1 border ${r.status === REQUEST_STATUSES.PENDING ? 'border-orange-200/50 text-orange-600 bg-orange-500/5' :
                              r.status === REQUEST_STATUSES.APPROVED ? 'border-green-200/50 text-green-600 bg-green-500/5' :
                                'border-red-200/50 text-red-600 bg-red-500/5'
                              }`}>
                              {r.status.charAt(0) + r.status.slice(1).toLowerCase()}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-right">
                            {r.status === REQUEST_STATUSES.REJECTED ? (
                              <span className="text-[11px] font-medium text-text-muted italic">Rejected</span>
                            ) : (r as Request & { assignments?: unknown[] }).assignments && (r as Request & { assignments?: unknown[] }).assignments!.length > 0 ? (
                                <span className="text-[11px] font-medium text-text-muted italic">Assigned</span>
                            ) : (
                              <div className="flex justify-end gap-3">
                                <button
                                  onClick={() => handleEditClick(r)}
                                  className="px-3 py-1.5 text-text-muted hover:text-consorci-darkBlue text-[12px] font-medium hover:underline transition-all flex items-center gap-1"
                                >
                                  Edit
                                </button>
                                {r.status === REQUEST_STATUSES.PENDING && (
                                  <button
                                    onClick={() => handleApprove(r.requestId)}
                                    className="px-4 py-1.5 bg-consorci-darkBlue text-white text-[12px] font-medium transition-all hover:bg-black"
                                  >
                                    Approve
                                  </button>
                                )}
                                <button
                                  onClick={() => handleReject(r.requestId)}
                                  className="px-3 py-1.5 text-red-500 hover:underline text-[12px] font-medium transition-all"
                                >
                                  Reject
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
          <p className="text-gray-400 text-xs font-black uppercase tracking-widest">No requests found with the applied filters</p>
        </div>
      )}
      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-background-surface max-w-md w-full p-10 border border-border-subtle slide-in-from-bottom-4 animate-in duration-500">
            <h3 className="text-xl font-medium text-text-primary tracking-tight mb-8">Edit Request</h3>
            <form onSubmit={handleEditSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-[12px] font-medium text-text-primary px-1">Number of Students</label>
                <input
                  type="number"
                  min="1"
                  className="w-full bg-background-subtle border border-border-subtle p-3 text-sm font-medium text-text-primary focus:border-consorci-darkBlue outline-none"
                  value={editFormData.approxStudents || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, approxStudents: e.target.value === '' ? 0 : parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[12px] font-medium text-text-primary px-1">Comments</label>
                <textarea
                  className="w-full bg-background-subtle border border-border-subtle p-3 text-sm text-text-primary focus:border-consorci-darkBlue outline-none h-32 resize-none"
                  value={editFormData.comments}
                  onChange={(e) => setEditFormData({ ...editFormData, comments: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-3 mt-10">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-6 py-2 text-[13px] font-medium text-text-muted hover:text-text-primary hover:underline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-2 bg-consorci-darkBlue text-white text-[13px] font-medium transition-all hover:bg-black"
                >
                  Save Changes
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
