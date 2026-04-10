'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/context/AuthContext';
import { THEME, REQUEST_STATUSES, ROLES } from '@iter/shared';
import DashboardLayout from '@/components/DashboardLayout';
import workshopService, { Workshop } from '@/services/workshopService';
import requestService, { Request } from '@/services/requestService';
import teacherService, { Teacher } from '@/services/teacherService';
import Loading from '@/components/Loading';
import WorkshopIcon from '@/components/WorkshopIcon';
import Pagination from "@/components/Pagination";

export default function RequestsPage() {
  const t = useTranslations('CenterRequestsPage');
  const tCommon = useTranslations('Common');
  const { user, loading: authLoading } = useAuth();
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);

  const [selectedWorkshopId, setSelectedWorkshopId] = useState<string | null>(null);
  const [editingRequestId, setEditingRequestId] = useState<number | null>(null);

  const [studentsAprox, setStudentsAprox] = useState<number | ''>('');
  const [teacher1Id, setTeacher1Id] = useState<string>('');
  const [teacher2Id, setTeacher2Id] = useState<string>('');
  const [comments, setComments] = useState('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale || 'ca';

  const loadInitialData = useCallback(async () => {
    try {
      const [fetchedWorkshops, fetchedTeachers, fetchedRequests] = await Promise.all([
        workshopService.getAll(),
        teacherService.getAll(),
        requestService.getAll()
      ]);
      setWorkshops(fetchedWorkshops);
      setTeachers(fetchedTeachers);
      setRequests(fetchedRequests);
    } catch (err) {
      console.error(err);
      setError(tCommon('loading_error'));
    } finally {
      setLoading(false);
    }
  }, [tCommon]);

  useEffect(() => {
    if (!authLoading && (!user || user.role.name !== ROLES.COORDINATOR)) {
      router.push(`/${locale}/login`);
      return;
    }

    if (user) {
      loadInitialData();
    }
  }, [user, authLoading, router, locale, loadInitialData]);

  const filteredWorkshops = useMemo(() => {
    let result = workshops;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(w =>
        w.title.toLowerCase().includes(query) ||
        w.sector.toLowerCase().includes(query)
      );
    }
    return result;
  }, [workshops, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const totalPages = Math.ceil(filteredWorkshops.length / itemsPerPage);
  const paginatedWorkshops = filteredWorkshops.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const selectedWorkshop = workshops.find(w => w._id === selectedWorkshopId);

  // Reset form when selectedWorkshopId changes (if not editing)
  useEffect(() => {
    if (selectedWorkshopId && !editingRequestId) {
      // Default reset if just selecting a new workshop
      setStudentsAprox('');
      setTeacher1Id('');
      setTeacher2Id('');
      setComments('');
      setError(null);
    }
  }, [selectedWorkshopId, editingRequestId]);

  const handleEdit = (request: Request) => {
    setEditingRequestId(request.requestId);
    // Find the workshop ID string (assuming it matches)
    const workshop = workshops.find(w => parseInt(w._id) === request.workshopId);
    if (workshop) {
      setSelectedWorkshopId(workshop._id);
    }

    setStudentsAprox(request.studentsAprox || '');
    setComments(request.comments || '');
    setTeacher1Id(request.teacher1Id ? request.teacher1Id.toString() : '');
    setTeacher2Id(request.teacher2Id ? request.teacher2Id.toString() : '');
    setError(null);
  };

  const cancelEdit = () => {
    setEditingRequestId(null);
    setSelectedWorkshopId(null);
    setStudentsAprox('');
    setComments('');
    setTeacher1Id('');
    setTeacher2Id('');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkshopId || !selectedWorkshop) return;

    setSubmitting(true);
    setError(null);

    if (selectedWorkshop.modality === 'C' && studentsAprox !== '' && Number(studentsAprox) > 4) {
      setError(t('max_students_alert'));
      setSubmitting(false);
      return;
    }

    if (!teacher1Id || !teacher2Id) {
      setError(t('referents_required'));
      setSubmitting(false);
      return;
    }

    if (teacher1Id === teacher2Id) {
      setError(t('referents_different'));
      setSubmitting(false);
      return;
    }

    try {
      if (editingRequestId) {
        // Update
        await requestService.update(editingRequestId, {
          studentsAprox: Number(studentsAprox),
          comments,
          teacher1Id: teacher1Id ? parseInt(teacher1Id) : undefined,
          teacher2Id: teacher2Id ? parseInt(teacher2Id) : undefined,
        });
      } else {
        // Create
        await requestService.create({
          workshopId: parseInt(selectedWorkshopId),
          studentsAprox: Number(studentsAprox),
          comments,
          teacher1Id: teacher1Id ? parseInt(teacher1Id) : undefined,
          teacher2Id: teacher2Id ? parseInt(teacher2Id) : undefined,
          modality: selectedWorkshop.modality
        });
      }

      // Reload data
      await loadInitialData();
      cancelEdit(); // Close form
      router.refresh();

    } catch (err: unknown) {
      setError((err as Error).message || t('send_error'));
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || !user) {
    return <Loading fullScreen message={tCommon('status')} />;
  }

  return (
    <DashboardLayout
      title={t('title')}
      subtitle={t('subtitle')}
    >
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Section: Catalog */}
        <div className="flex-1 space-y-6">
          {/* Filter Bar */}
          <div className="bg-background-surface border border-border-subtle p-6 flex flex-col md:flex-row gap-6 items-center">
            <div className="relative flex-1 group w-full">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-consorci-darkBlue transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder={t('search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-background-subtle border border-border-subtle focus:outline-none focus:border-consorci-darkBlue text-sm font-medium text-text-primary transition-all"
              />
            </div>
            <div className="text-[12px] font-medium text-text-muted whitespace-nowrap">
              {filteredWorkshops.length} Workshops available
            </div>
          </div>

          {/* Workshop Table */}
          <div className="bg-background-surface border border-border-subtle overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-background-subtle border-b border-border-subtle">
                  <th className="px-6 py-4 text-[12px] font-medium text-text-primary w-12 text-center">Mod</th>
                  <th className="px-6 py-4 text-[12px] font-medium text-text-primary">Workshop / Sector</th>
                  <th className="px-6 py-4 text-[12px] font-medium text-text-primary text-right">Status / Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12">
                      <Loading message={tCommon('loading')} />
                    </td>
                  </tr>
                ) : filteredWorkshops.length > 0 ? (
                  paginatedWorkshops.map((workshop) => {
                    const existingRequest = requests.find(r => r.workshopId === parseInt(workshop._id));
                    const isSelected = selectedWorkshopId === workshop._id;

                    return (
                      <tr
                        key={workshop._id}
                        onClick={() => {
                          if (!existingRequest && !editingRequestId) {
                            setSelectedWorkshopId(isSelected ? null : workshop._id);
                          }
                        }}
                        className={`group transition-colors ${existingRequest && existingRequest.status !== REQUEST_STATUSES.PENDING && !isSelected
                          ? 'opacity-60 cursor-default'
                          : isSelected
                            ? 'bg-background-subtle cursor-pointer border-l-2 border-l-consorci-darkBlue'
                            : (!existingRequest && !editingRequestId)
                              ? 'hover:bg-background-subtle cursor-pointer border-l-2 border-l-transparent'
                              : 'cursor-default border-l-2 border-l-transparent'
                          }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 flex items-center justify-center font-medium text-[11px] shrink-0 ${workshop.modality === 'A' ? 'bg-green-500/10 text-green-600' :
                              workshop.modality === 'B' ? 'bg-orange-500/10 text-orange-600' :
                                'bg-purple-500/10 text-purple-600'
                              }`}>
                              {workshop.modality}
                            </div>
                            <WorkshopIcon iconName={workshop.icon} className="w-5 h-5 text-text-primary" />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-text-primary text-[14px] leading-tight mb-1">{workshop.title}</div>
                          <div className="text-[11px] font-medium text-text-muted">{workshop.sector}</div>
                        </td>
                        <td className="px-6 py-4">
                          {existingRequest && (
                            <>
                              <div className="text-xs font-medium text-gray-700">1. {existingRequest.teacher1?.name}</div>
                              <div className="text-xs font-medium text-gray-700">2. {existingRequest.teacher2?.name || '-'}</div>
                            </>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {existingRequest ? (
                            existingRequest.status === REQUEST_STATUSES.PENDING ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(existingRequest);
                                }}
                                className="text-[11px] font-medium border border-border-subtle px-3 py-1 text-text-primary hover:bg-background-subtle transition-colors"
                              >
                                Edit request
                              </button>
                            ) : (
                              <span className={`text-[11px] font-medium border px-2 py-1 tracking-tight ${existingRequest.status === REQUEST_STATUSES.APPROVED
                                ? 'border-green-500/20 bg-green-500/5 text-green-600'
                                : 'border-red-500/20 bg-red-500/5 text-red-600'
                                }`}>
                                {existingRequest.status}
                              </span>
                            )
                          ) : isSelected ? (
                            <span className="text-[11px] font-medium border border-consorci-darkBlue px-2 py-1 text-consorci-darkBlue bg-background-subtle">Selected</span>
                          ) : (
                            !editingRequestId && (
                              <span className="text-[11px] font-medium text-text-muted opacity-0 group-hover:opacity-100 transition-opacity">Select</span>
                            )
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <p className="text-text-muted text-[13px] font-medium">No workshops found</p>
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
            totalItems={filteredWorkshops.length}
            currentItemsCount={paginatedWorkshops.length}
            itemName={t('table_workshop')}
          />
        </div>

        {/* Right Section: Form Sidebar */}
        <div className="w-full lg:w-96">
          <div className="bg-background-surface border border-border-subtle sticky top-8">
            <div className="p-8 border-b border-border-subtle bg-background-subtle flex justify-between items-center">
              <h3 className="text-[14px] font-medium text-text-primary flex items-center gap-3">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {editingRequestId ? t('edit_request') : t('new_request')}
              </h3>
              {editingRequestId && (
                <button
                  onClick={cancelEdit}
                  className="text-[11px] text-text-muted hover:text-red-500 font-medium"
                >
                  {t('cancel_btn')}
                </button>
              )}
            </div>

            <div className="p-8">
              {error && (
                <div className="mb-8 p-4 bg-red-500/5 border-l-2 border-red-500 text-red-600">
                  <p className="text-[12px] font-medium mb-1 flex items-center gap-2">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                    {t('error_title')}
                  </p>
                  <p className="text-[13px] opacity-90">{error}</p>
                </div>
              )}

              {!selectedWorkshop ? (
                <div className="text-center py-16 border border-dashed border-border-subtle bg-background-subtle/20">
                  <div className="w-12 h-12 bg-background-subtle flex items-center justify-center mx-auto mb-4 border border-border-subtle">
                    <svg className="w-6 h-6 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <p className="text-[12px] font-medium text-text-muted px-8">
                    Select a workshop from the catalog to start your request
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Selected Workshop Info */}
                  <div className="bg-background-subtle border border-border-subtle p-5">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] font-medium bg-consorci-darkBlue/10 text-consorci-darkBlue px-2 py-0.5 border border-consorci-darkBlue/20">MOD {selectedWorkshop.modality}</span>
                      {!editingRequestId && (
                        <button
                          type="button"
                          onClick={() => setSelectedWorkshopId(null)}
                          className="text-text-muted hover:text-consorci-darkBlue transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      )}
                    </div>
                    <h4 className="font-medium text-[15px] leading-snug text-consorci-darkBlue">{selectedWorkshop.title}</h4>
                    <p className="text-[11px] font-medium text-text-muted mt-1 uppercase tracking-tight">{selectedWorkshop.sector}</p>
                  </div>

                  {/* Form Fields */}
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="block text-[12px] font-medium text-text-primary px-1">Referring Teachers</label>
                      <div className="space-y-2">
                        <select
                          value={teacher1Id}
                          onChange={(e) => setTeacher1Id(e.target.value)}
                          className="w-full px-4 py-3 bg-background-subtle border border-border-subtle text-sm font-medium text-text-primary focus:border-consorci-darkBlue outline-none appearance-none"
                          required
                        >
                          <option value="">Select main referent *</option>
                          {teachers.map(t => (
                            <option key={t.teacherId} value={t.teacherId}>{t.name}</option>
                          ))}
                        </select>
                        <select
                          value={teacher2Id}
                          onChange={(e) => setTeacher2Id(e.target.value)}
                          className="w-full px-4 py-3 bg-background-subtle border border-border-subtle text-sm font-medium text-text-primary focus:border-consorci-darkBlue outline-none appearance-none"
                          required
                        >
                          <option value="">Select second referent *</option>
                          {teachers.map(t => (
                            <option key={t.teacherId} value={t.teacherId}>{t.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-[12px] font-medium text-text-primary px-1">Approx. Students</label>
                      <input
                        type="number"
                        value={studentsAprox}
                        onChange={(e) => setStudentsAprox(e.target.value === '' ? '' : parseInt(e.target.value))}
                        placeholder="Ex: 4"
                        className="w-full px-4 py-3 bg-background-subtle border border-border-subtle text-sm font-medium text-text-primary focus:border-consorci-darkBlue outline-none appearance-none"
                        min="1"
                        max={selectedWorkshop.modality === 'C' ? 4 : 100}
                        required
                      />
                      {selectedWorkshop.modality === 'C' && (
                        <p className="mt-2 text-[11px] text-orange-600 font-medium italic bg-orange-500/5 p-2 border border-orange-200/30">
                          * Maximum 4 students in Modality C.
                        </p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <label className="block text-[12px] font-medium text-text-primary px-1">Reason for request</label>
                      <textarea
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        placeholder="Brief explanation of student profile..."
                        className="w-full px-4 py-3 bg-background-subtle border border-border-subtle text-sm font-medium text-text-primary focus:border-consorci-darkBlue outline-none min-h-[100px] resize-none appearance-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className={`w-full py-4 font-medium text-[13px] flex items-center justify-center gap-3 transition-all ${submitting
                      ? 'bg-background-subtle text-text-muted cursor-not-allowed'
                      : 'bg-consorci-darkBlue text-white hover:bg-black active:scale-[0.98]'
                      }`}
                  >
                    {submitting ? (
                      <>
                        <Loading size="mini" white />
                        <span>Processing request...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={editingRequestId ? "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" : "M12 19l9 2-9-18-9 18 9-2zm0 0v-8"} />
                        </svg>
                        <span>{editingRequestId ? t('update_btn') : t('send_btn')}</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}