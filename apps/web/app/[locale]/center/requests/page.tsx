'use client';

import { useEffect, useState, useMemo } from 'react';
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

  const [approxStudents, setApproxStudents] = useState<number | ''>('');
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

  useEffect(() => {
    if (!authLoading && (!user || user.role.name !== ROLES.COORDINATOR)) {
      router.push(`/${locale}/login`);
      return;
    }

    if (user) {
      loadInitialData();
    }
  }, [user, authLoading, router]);

  const loadInitialData = async () => {
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
  };

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
      setApproxStudents('');
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

    setApproxStudents(request.studentsAprox || '');
    setComments(request.comments || '');
    setTeacher1Id(request.teacher1Id ? request.teacher1Id.toString() : '');
    setTeacher2Id(request.teacher2Id ? request.teacher2Id.toString() : '');
    setError(null);
  };

  const cancelEdit = () => {
    setEditingRequestId(null);
    setSelectedWorkshopId(null);
    setApproxStudents('');
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

    if (selectedWorkshop.modality === 'C' && approxStudents !== '' && Number(approxStudents) > 4) {
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
          studentsAprox: Number(approxStudents),
          comments,
          teacher1Id: teacher1Id ? parseInt(teacher1Id) : undefined,
          teacher2Id: teacher2Id ? parseInt(teacher2Id) : undefined,
        });
      } else {
        // Create
        await requestService.create({
          workshopId: parseInt(selectedWorkshopId),
          studentsAprox: Number(approxStudents),
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
          <div className="bg-white border border-gray-200 p-4 rounded-none shadow-sm flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 group w-full">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#00426B] transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder={t('search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-none focus:outline-none focus:border-[#00426B] focus:ring-1 focus:ring-[#00426B] text-sm transition-all"
              />
            </div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">
              {t('num_workshops', { count: filteredWorkshops.length })}
            </div>
          </div>

          {/* Workshop Table */}
          <div className="bg-white border border-gray-200 rounded-none shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-[11px] font-black text-[#00426B] uppercase tracking-wider w-12 text-center">{t('table_mod')}</th>
                  <th className="px-6 py-4 text-[11px] font-black text-[#00426B] uppercase tracking-wider">{t('table_workshop')}</th>
                  <th className="px-6 py-4 text-[11px] font-black text-[#00426B] uppercase tracking-wider">{t('table_referents')}</th>
                  <th className="px-6 py-4 text-[11px] font-black text-[#00426B] uppercase tracking-wider text-right">{t('table_status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
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
                          ? 'bg-gray-50 opacity-60 cursor-default'
                          : isSelected
                            ? 'bg-blue-50/50 cursor-pointer border-l-4 border-l-[#00426B]'
                            : (!existingRequest && !editingRequestId)
                              ? 'hover:bg-gray-50 cursor-pointer border-l-4 border-l-transparent'
                              : 'cursor-default border-l-4 border-l-transparent'
                          }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 flex items-center justify-center font-bold text-xs shrink-0 ${workshop.modality === 'A' ? 'bg-green-100 text-green-700' :
                              workshop.modality === 'B' ? 'bg-orange-100 text-orange-700' :
                                'bg-purple-100 text-purple-700'
                              }`}>
                              {workshop.modality}
                            </div>
                            <WorkshopIcon iconName={workshop.icon} className="w-6 h-6 text-[#00426B]" />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-800 text-sm group-hover:text-[#00426B] transition-colors">{workshop.title}</div>
                          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{workshop.sector}</div>
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
                                className="text-[10px] font-black border border-yellow-400 bg-yellow-50 px-3 py-1 text-yellow-600 uppercase tracking-widest hover:bg-yellow-100 transition-colors"
                              >
                                {t('edit_btn')}
                              </button>
                            ) : (
                              <span className={`text-[10px] font-black border px-2 py-1 uppercase tracking-widest ${existingRequest.status === REQUEST_STATUSES.APPROVED
                                ? 'border-green-200 bg-green-50 text-green-600'
                                : 'border-red-200 bg-red-50 text-red-600'
                                }`}>
                                {existingRequest.status}
                              </span>
                            )
                          ) : isSelected ? (
                            <span className="text-[10px] font-black border border-[#00426B] px-2 py-1 text-[#00426B] uppercase tracking-widest bg-blue-50">{t('selected_label')}</span>
                          ) : (
                            !editingRequestId && (
                              <span className="text-[10px] font-black border border-transparent group-hover:border-gray-300 px-2 py-1 text-gray-300 uppercase tracking-widest transition-all group-hover:text-gray-400">{t('select_btn')}</span>
                            )
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">{tCommon('empty_desc')}</p>
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
          <div className="bg-white border border-gray-200 rounded-none shadow-sm sticky top-8">
            <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h3 className="text-sm font-black text-[#00426B] uppercase tracking-widest flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {editingRequestId ? t('edit_request') : t('new_request')}
              </h3>
              {editingRequestId && (
                <button
                  onClick={cancelEdit}
                  className="text-[10px] text-gray-400 hover:text-red-500 font-bold uppercase tracking-wide"
                >
                  {t('cancel_btn')}
                </button>
              )}
            </div>

            <div className="p-6">
              {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 border-l-4 border-red-500 text-red-700 dark:text-red-400">
                  <p className="text-[11px] font-bold uppercase tracking-wide mb-1 flex items-center gap-2">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                    {t('error_title')}
                  </p>
                  <p className="text-xs">{error}</p>
                </div>
              )}

              {!selectedWorkshop ? (
                <div className="text-center py-12 border-2 border-dashed border-border-subtle bg-background-subtle/30">
                  <div className="w-12 h-12 rounded-full bg-background-subtle flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <p className="text-xs font-bold text-text-muted uppercase tracking-widest px-6">
                    {t('select_workshop')}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Selected Workshop Info */}
                  <div className="bg-background-surface border-l-4 border-consorci-darkBlue p-4 rounded-none text-text-primary shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[9px] font-black bg-consorci-darkBlue/10 text-consorci-darkBlue px-1.5 py-0.5 tracking-tighter uppercase">MOD {selectedWorkshop.modality}</span>
                      {!editingRequestId && (
                        <button
                          type="button"
                          onClick={() => setSelectedWorkshopId(null)}
                          className="text-text-muted hover:text-consorci-darkBlue transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      )}
                    </div>
                    <h4 className="font-bold text-sm leading-tight text-consorci-darkBlue dark:text-consorci-lightBlue">{selectedWorkshop.title}</h4>
                    <p className="text-[10px] font-bold text-text-secondary uppercase mt-1">{selectedWorkshop.sector}</p>
                  </div>

                  {/* Form Fields */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-1.5">{t('referents_label')}</label>
                      <div className="space-y-2">
                        <select
                          value={teacher1Id}
                          onChange={(e) => setTeacher1Id(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-none focus:outline-none focus:border-[#00426B] text-sm font-bold text-gray-700"
                          required
                        >
                          <option value="">{t('referent1_placeholder')}</option>
                          {teachers.map(t => (
                            <option key={t.teacherId} value={t.teacherId}>{t.name}</option>
                          ))}
                        </select>
                        <select
                          value={teacher2Id}
                          onChange={(e) => setTeacher2Id(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-none focus:outline-none focus:border-[#00426B] text-sm font-bold text-gray-700"
                          required
                        >
                          <option value="">{t('referent2_placeholder')}</option>
                          {teachers.map(t => (
                            <option key={t.teacherId} value={t.teacherId}>{t.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">{t('num_students_label')}</label>
                      <input
                        type="number"
                        value={approxStudents}
                        onChange={(e) => setApproxStudents(e.target.value === '' ? '' : parseInt(e.target.value))}
                        placeholder={t('num_students_placeholder')}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-none focus:outline-none focus:border-[#00426B] text-sm font-bold text-gray-700"
                        min="1"
                        max={selectedWorkshop.modality === 'C' ? 4 : 100}
                        required
                      />
                      {selectedWorkshop.modality === 'C' && (
                        <p className="mt-1.5 text-[9px] text-orange-600 font-bold italic bg-orange-50 p-1.5 border border-orange-100">
                          {t('modality_c_hint')}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">{t('reason_label')}</label>
                      <textarea
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        placeholder={t('reason_placeholder')}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-none focus:outline-none focus:border-[#00426B] text-sm font-bold text-gray-700 min-h-[80px] resize-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className={`w-full py-4 rounded-none font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${submitting
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-[#00426B] text-white hover:bg-[#0775AB] shadow-md hover:shadow-lg active:translate-y-0.5'
                      }`}
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin h-3.5 w-3.5 border-2 border-white/20 border-t-white"></div>
                        <span>{t('processing')}</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={editingRequestId ? "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" : "M12 19l9 2-9-18-9 18 9-2zm0 0v-8"} />
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