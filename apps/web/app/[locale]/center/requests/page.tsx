'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
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
import DataTable, { Column } from '@/components/ui/DataTable';

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

  const closeModal = () => {
    setEditingRequestId(null);
    setSelectedWorkshopId(null);
    setStudentsAprox('');
    setComments('');
    setTeacher1Id('');
    setTeacher2Id('');
    setError(null);
  };

  const cancelEdit = () => {
    closeModal();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkshopId || !selectedWorkshop) return;

    setSubmitting(true);
    setError(null);



    if (!teacher1Id) {
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

  const columns: Column<Workshop>[] = [
    {
      header: "ID",
      render: (w) => <span className="table-id">{w._id}</span>,
      width: 60,
      align: 'center'
    },
    {
      header: "Taller",
      render: (w) => (
        <div className="flex items-center gap-3">
          <WorkshopIcon iconName={w.icon} className="w-4 h-4 text-text-primary shrink-0" />
          <span className="table-primary">{w.title}</span>
        </div>
      ),
      width: 250
    },
    {
      header: "Mod",
      render: (w) => (
        <span className={
          w.modality === 'A' ? 'table-tag-green' :
          w.modality === 'B' ? 'table-tag-orange' :
          'table-tag-purple'
        }>
          {w.modality}
        </span>
      ),
      width: 50,
      align: 'center'
    },
    {
      header: "Sector",
      render: (w) => <span className="table-tag-muted">{w.sector}</span>,
      width: 150
    },
    {
      header: "Hores",
      headerClassName: 'hidden lg:table-cell',
      cellClassName: 'hidden lg:table-cell',
      render: (w) => <span className="table-detail">{w.technicalDetails?.durationHours}h</span>,
      width: 80,
      align: 'center'
    },
    {
      header: "Places",
      headerClassName: 'hidden lg:table-cell',
      cellClassName: 'hidden lg:table-cell',
      render: (w) => <span className="table-detail">{w.technicalDetails?.maxPlaces}</span>,
      width: 80,
      align: 'center'
    },
    {
      header: "Referents",
      headerClassName: 'hidden md:table-cell',
      cellClassName: 'hidden md:table-cell',
      render: (w) => {
        const existingRequest = requests.find(r => r.workshopId === parseInt(w._id));
        if (!existingRequest) return <span className="table-id opacity-30">---</span>;
        return (
          <div className="flex flex-col gap-0.5">
            {existingRequest.teacher1Id && (
              <span className="table-detail font-semibold whitespace-nowrap">
                {teachers.find(t => t.teacherId === existingRequest.teacher1Id)?.name}
              </span>
            )}
            {existingRequest.teacher2Id && (
              <span className="table-detail font-semibold whitespace-nowrap">
                {teachers.find(t => t.teacherId === existingRequest.teacher2Id)?.name}
              </span>
            )}
          </div>
        );
      },
      width: 180
    },
    {
      header: "Estat",
      align: 'right',
      render: (w) => {
        const existingRequest = requests.find(r => r.workshopId === parseInt(w._id));
        const isSelected = selectedWorkshopId === w._id;
        if (existingRequest) {
          return (
            <span className={`text-[11px] font-bold tracking-widest uppercase ${
              existingRequest.status === REQUEST_STATUSES.APPROVED ? 'text-green-600' :
              existingRequest.status === REQUEST_STATUSES.PENDING ? 'text-orange-600' :
              'text-red-600'
            }`}>
              {existingRequest.status === REQUEST_STATUSES.PENDING ? t('status_pending') : 
               existingRequest.status === REQUEST_STATUSES.APPROVED ? t('status_approved') : 
               t('status_rejected')}
            </span>
          );
        }
        if (isSelected) {
          return (
            <div className="flex items-center justify-end gap-2 text-consorci-darkBlue font-bold text-[11px] uppercase tracking-tight">
              <span>{t('selected_label')}</span>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            </div>
          );
        }
        return null;
      },
      width: 120
    }
  ];

  const handleRowClick = (workshop: Workshop) => {
    const existingRequest = requests.find(r => r.workshopId === parseInt(workshop._id));
    if (existingRequest && existingRequest.status === REQUEST_STATUSES.PENDING) {
      handleEdit(existingRequest);
    } else {
      setSelectedWorkshopId(selectedWorkshopId === workshop._id ? null : workshop._id);
    }
  };

  if (authLoading || !user) {
    return <Loading fullScreen message={tCommon('status')} />;
  }

  return (
    <>
      <DashboardLayout
      title={t('title')}
      subtitle={t('subtitle')}
    >
      <div className="space-y-6 animate-in fade-in duration-500">
        {/* Catalog Section */}
        <div className="space-y-6">
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
              {t('num_workshops', { count: filteredWorkshops.length })}
            </div>
          </div>

          <DataTable
            data={filteredWorkshops}
            columns={columns}
            loading={loading}
            emptyMessage={tCommon('no_results')}
            onRowClick={handleRowClick}
            rowClassName={(workshop) => {
              const isSelected = selectedWorkshopId === workshop._id;
              return `border-l-2 ${isSelected ? 'bg-background-subtle border-l-consorci-darkBlue' : 'border-l-transparent hover:border-l-consorci-lightBlue'}`;
            }}
          />
        </div>
      </div>
      </DashboardLayout>

      {/* Workshop Solicitation Modal - Flat Sharp Look with Backdrop Blur */}
      {(() => {
        const workshopForModal = workshops.find(w => w._id === selectedWorkshopId);
        
        if (!workshopForModal) return null;

        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop with Blur */}
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
              onClick={closeModal}
            ></div>
            
            {/* Modal Card - Sharp, No Shadow, Flat */}
            <div className="relative w-full max-w-5xl bg-background-surface border border-border-subtle flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="px-8 py-6 border-b border-border-subtle bg-background-subtle flex justify-between items-center shrink-0">
                <div className="flex flex-col gap-1">
                  <h3 className="text-lg font-bold text-text-primary leading-tight uppercase tracking-tight font-sans">{workshopForModal.title}</h3>
                  <p className="text-xs font-semibold text-text-secondary uppercase tracking-widest font-sans">{workshopForModal.sector}</p>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className={`px-4 py-1.5 flex items-center justify-center font-bold text-[10px] tracking-widest border border-current font-sans ${workshopForModal.modality === 'A' ? 'text-green-500' :
                    workshopForModal.modality === 'B' ? 'text-orange-500' :
                      'text-purple-500'
                    }`}>
                    {tCommon('modality_label', { modality: workshopForModal.modality })}
                  </div>
                  <button 
                    onClick={closeModal}
                    className="p-2 text-text-muted hover:text-text-primary transition-colors border border-transparent hover:border-border-subtle"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row overflow-y-auto">
                {/* Left Panel: Info */}
                <div className="lg:w-2/5 p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-border-subtle bg-background-subtle/30">
                  <div className="space-y-10">
                    <div>
                      <h4 className="text-[11px] font-bold text-text-muted uppercase tracking-widest mb-4 border-b border-border-subtle pb-2 inline-block">{t('workshop_details')}</h4>
                      <p className="text-[15px] leading-relaxed text-text-secondary italic">
                        {workshopForModal.technicalDetails?.description || tCommon('no_description')}
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-5 p-5 border border-border-subtle bg-background-surface">
                        <svg className="w-5 h-5 text-consorci-darkBlue" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <div>
                          <div className="text-[10px] uppercase font-bold text-text-muted mb-1">{t('duration')}</div>
                          <div className="text-sm font-bold text-text-primary">{tCommon('duration_label', { hours: workshopForModal.technicalDetails?.durationHours || 0 })}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-5 p-5 border border-border-subtle bg-background-surface">
                        <svg className="w-5 h-5 text-consorci-darkBlue" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        <div>
                          <div className="text-[10px] uppercase font-bold text-text-muted mb-1">{t('max_students')}</div>
                          <div className="text-sm font-bold text-text-primary">{tCommon('places_label', { count: workshopForModal.technicalDetails?.maxPlaces || 0 })}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Panel: Form */}
                <div className="lg:w-3/5 p-8 lg:p-10 bg-background-surface">
                  <h4 className="text-[11px] font-bold text-text-muted uppercase tracking-widest mb-8 border-b border-border-subtle pb-2 inline-block">
                    {editingRequestId ? t('edit_request') : t('new_request')}
                  </h4>

                  {error && (
                    <div className="mb-6 p-4 border border-red-500/20 bg-red-500/5 text-red-600 font-bold text-sm tracking-tight capitalize">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-widest">{t('referents_label')}</label>
                        <div className="space-y-2">
                          <select
                            value={teacher1Id}
                            onChange={(e) => setTeacher1Id(e.target.value)}
                            className="w-full px-4 py-3 bg-background-subtle border border-border-subtle text-sm font-medium text-text-primary focus:border-consorci-darkBlue outline-none appearance-none"
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
                            className="w-full px-4 py-3 bg-background-subtle border border-border-subtle text-sm font-medium text-text-primary focus:border-consorci-darkBlue outline-none appearance-none"
                          >
                            <option value="">{t('referent2_placeholder')}</option>
                            {teachers.map(t => (
                              <option key={t.teacherId} value={t.teacherId}>{t.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-widest">{t('num_students_label')}</label>
                        <input
                          type="number"
                          value={studentsAprox}
                          onChange={(e) => setStudentsAprox(e.target.value === '' ? '' : parseInt(e.target.value))}
                          placeholder={t('num_students_placeholder')}
                          className="w-full px-4 py-3 bg-background-subtle border border-border-subtle text-sm font-medium text-text-primary focus:border-consorci-darkBlue outline-none appearance-none font-sans"
                          min="1"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-widest">{t('reason_label')}</label>
                      <textarea
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        placeholder={t('reason_placeholder')}
                        className="w-full px-4 py-3 bg-background-subtle border border-border-subtle text-sm font-medium text-text-primary focus:border-consorci-darkBlue outline-none min-h-[120px] resize-none appearance-none"
                      />
                    </div>

                    <div className="flex justify-end gap-10 pt-8 border-t border-border-subtle mt-10">
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="text-[11px] font-bold text-text-muted hover:text-text-primary uppercase tracking-[0.3em] transition-all"
                      >
                        {t('cancel_btn')}
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className={`px-12 py-4 font-bold text-[11px] uppercase tracking-[0.3em] transition-all border ${submitting
                          ? 'bg-background-subtle text-text-muted border-border-subtle cursor-not-allowed'
                          : 'bg-consorci-darkBlue text-white border-consorci-darkBlue hover:bg-black hover:border-black'
                          }`}
                      >
                        {submitting ? (
                          <>
                            <Loading size="mini" white />
                            <span>{t('processing')}</span>
                          </>
                        ) : (
                          <span>{editingRequestId ? t('update_btn') : t('send_btn')}</span>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </>
  );
}
