'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ROLES } from '@iter/shared';
import DashboardLayout from '@/components/DashboardLayout';
import getApi from '@/services/api';
import Loading from '@/components/Loading';
import { toast } from 'sonner';
import Pagination from '@/components/Pagination';
import { useTranslations, useLocale } from 'next-intl';

type AssignmentMode = 'single' | 'whole';

interface Session {
  sessionId: number | string;
  sessionDate: string;
  startTime?: string;
  endTime?: string;
  isPending?: boolean;
  assignmentTitle?: string;
  assignmentId?: number;
  modality?: string;
  referent1?: string;
  referent2?: string;
  staff?: { userId?: number; id?: number; name?: string; user?: { fullName: string } }[];
  status?: string;
}

interface BackendAssignment {
  assignmentId: number;
  workshop?: { title: string; modality: string };
  teacher1?: { user: { fullName: string } };
  teacher2?: { user: { fullName: string } };
  sessions?: Session[];
  status: string;
}

interface Teacher {
  userId: number;
  name: string;
}

export default function SessionsListPage() {
  const { user, loading: authLoading } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [assignments, setAssignments] = useState<BackendAssignment[]>([]); // For the dropdown
  const [allTeachers, setAllTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const t = useTranslations('Center.Sessions');
  const tc = useTranslations('Common');
  const tr = useTranslations('Center.Requests');
  const locale = useLocale();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModality, setSelectedModality] = useState(tc("all_modalities"));
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState<AssignmentMode>('single');
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>("");
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");

  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    if (!authLoading && (!user || user.role.name !== ROLES.COORDINATOR)) {
      router.push(`/${locale}/login`);
    }
  }, [user, authLoading, router, locale]);

  const fetchData = useCallback(async () => {
    if (user && user.center?.centerId) {
      try {
        const api = getApi();
        const [resAssig, resProfs] = await Promise.all([
          api.get(`/assignments/center/${user.center.centerId}`),
          api.get('/teachers')
        ]);

        const rawAssignments = resAssig.data;
        setAssignments(rawAssignments);
        setAllTeachers(resProfs.data || []);

        // Flatten sessions
        const flatSessions: Session[] = [];
        rawAssignments.forEach((a: BackendAssignment) => {
          if (a.sessions && a.sessions.length > 0) {
            a.sessions.forEach((s: Session) => {
              flatSessions.push({
                ...s,
                assignmentTitle: a.workshop?.title,
                assignmentId: a.assignmentId,
                modality: a.workshop?.modality,
                referent1: a.teacher1?.user?.fullName,
                referent2: a.teacher2?.user?.fullName
              });
            });
          } else if (a.status !== 'PUBLISHED' && a.status !== 'CANCELLED') {
            flatSessions.push({
              sessionId: `pending-${a.assignmentId}`,
              isPending: true,
              assignmentTitle: a.workshop?.title,
              assignmentId: a.assignmentId,
              modality: a.workshop?.modality,
              referent1: a.teacher1?.user?.fullName,
              referent2: a.teacher2?.user?.fullName,
              sessionDate: new Date().toISOString(), // Use current date just for sorting
              status: a.status
            });
          }
        });

        // Sort by date
        flatSessions.sort((a, b) => new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime());
        setSessions(flatSessions);

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filtering Logic
  const filteredSessions = (sessions || []).filter(s => {
    const matchesSearch = s.assignmentTitle?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesModality = selectedModality === tc("all_modalities") || s.modality === selectedModality;
    return matchesSearch && matchesModality;
  });

  const totalPages = Math.ceil(filteredSessions.length / itemsPerPage);
  const paginatedSessions = filteredSessions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedModality, tc]);

  const handleAssign = async () => {
    if (!selectedAssignmentId || !selectedTeacherId) {
      toast.error(t('error_no_selection'));
      return;
    }
    if (mode === 'single' && !selectedSessionId) {
      toast.error(t('error_no_session'));
      return;
    }

    try {
      const api = getApi();

      if (mode === 'whole') {
        // Assign to the whole assignment (teaching staff)
        await api.post(`/assignments/${selectedAssignmentId}/staff`, {
          userId: parseInt(selectedTeacherId)
        });

        const targetAssignment = assignments.find(a => a.assignmentId === parseInt(selectedAssignmentId));
        if (targetAssignment?.sessions) {
          await Promise.all(targetAssignment.sessions.map((s: Session) =>
            api.post(`/assignments/sessions/${s.sessionId}/staff`, { userId: parseInt(selectedTeacherId) })
              .catch(() => { }) // Ignore duplicates
          ));
        }

        toast.success(t('success_whole'));
      } else {
        // Single session
        await api.post(`/assignments/sessions/${selectedSessionId}/staff`, {
          userId: parseInt(selectedTeacherId)
        });
        toast.success(t('success_day'));
      }

      setShowModal(false);
      fetchData(); // Refresh list to show new staff

      // Reset form
      setSelectedSessionId("");
      setSelectedTeacherId("");


    } catch (_error) {
      toast.error(t('error_assignment'));
    }
  };

  const handleRemoveStaff = async (sessionId: number, idUser: number) => {
    try {
      const api = getApi();
      await api.delete(`/assignments/sessions/${sessionId}/staff/${idUser}`);
      await fetchData(); // Refresh list
      toast.success(t('success_remove'));
    } catch (error) {
      console.error(error);
      toast.error(t('error_remove'));
    }
  };

  const selectedAssignment = assignments.find(a => a.assignmentId.toString() === selectedAssignmentId);

  if (authLoading || loading) return <Loading fullScreen message={tc('loading')} />;

  return (
    <DashboardLayout
      title={t('title')}
      subtitle={t('description')}
    >
      {/* Search & Filter Bar */}
      <div className="mb-8 flex flex-col lg:flex-row gap-6 bg-white border border-gray-200 p-8 shadow-sm">
        {/* Search */}
        <div className="flex-1">
          <label className="block text-[12px] font-medium text-text-primary mb-3">{t('search_workshop')}</label>
          <div className="relative">
            <input
              type="text"
              placeholder={tc('search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-background-subtle border border-border-subtle focus:border-consorci-darkBlue focus:ring-0 text-sm font-medium text-text-primary placeholder:text-text-muted transition-all"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-4 top-3.5 h-5 w-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Modality Filter */}
        <div className="lg:w-64">
          <label className="block text-[12px] font-medium text-text-primary mb-3">{tc('filter_by_modality')}</label>
          <select
            value={selectedModality}
            onChange={(e) => setSelectedModality(e.target.value)}
            className="w-full px-4 py-3 bg-background-subtle border border-border-subtle focus:border-consorci-darkBlue focus:ring-0 text-sm font-medium text-text-primary appearance-none"
          >
            <option value={tc("all_modalities")}>{tc("all_modalities")}</option>
            <option value="A">{tc('modality_label', { modality: 'A' })}</option>
            <option value="B">{tc('modality_label', { modality: 'B' })}</option>
            <option value="C">{tc('modality_label', { modality: 'C' })}</option>
          </select>
        </div>

        {/* Action Button */}
        <div className="flex items-end">
          <button
            onClick={() => setShowModal(true)}
            className="bg-consorci-darkBlue text-white px-8 py-[13px] text-[13px] font-medium transition-all hover:bg-black active:scale-[0.98] flex items-center gap-3 h-[46px]"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            {t('assign_teacher')}
          </button>
        </div>
      </div>

      {/* Flat List */}
      <div className="bg-white border border-gray-200 shadow-sm overflow-hidden">
        {paginatedSessions.length === 0 ? (
          <div className="p-20 text-center text-text-muted font-medium text-sm italic">
            {tc('no_results')}
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-100">
              {paginatedSessions.map((session) => {
                const dateObj = new Date(session.sessionDate);
                const dayName = dateObj.toLocaleDateString(locale === 'ca' ? 'ca-ES' : 'es-ES', { weekday: 'long' });
                const dateStr = dateObj.toLocaleDateString(locale === 'ca' ? 'ca-ES' : 'es-ES', { day: 'numeric', month: 'long' });

                return (
                  <div key={session.sessionId} className={`p-8 flex flex-col md:flex-row md:items-center justify-between hover:bg-background-subtle border-b border-border-subtle transition-colors group ${session.isPending ? 'opacity-70' : ''}`}>
                    <div className="flex items-start gap-5 mb-4 md:mb-0">
                      <div className={`w-12 h-12 flex items-center justify-center shrink-0 border ${session.isPending ? 'bg-background-subtle text-text-muted border-border-subtle' : session.modality === 'A' ? 'bg-blue-500/5 text-consorci-darkBlue border-blue-200/50' : 'bg-orange-500/5 text-orange-600 border-orange-200/50'}`}>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={session.isPending ? "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" : "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"} />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-[17px] font-medium text-text-primary tracking-tight mb-2">
                          {session.assignmentTitle}
                          {!session.isPending && (
                            <span className="ml-3 text-[11px] font-medium text-text-muted border border-border-subtle px-2 py-0.5">
                              {session.startTime || '09:00'} - {session.endTime || '11:00'}
                            </span>
                          )}
                        </h4>
                        <p className="text-[13px] text-text-muted">
                          {session.isPending ? (
                            <span className="text-orange-600 font-medium tracking-tight">{t('pending_confirmation')}</span>
                          ) : (
                            <><span className="capitalize font-medium text-text-primary">{dayName}</span>, {dateStr}</>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Staff & Referents Display */}
                    <div className="flex flex-col md:flex-row gap-6 md:gap-10 md:text-right pl-14 md:pl-0">
                      {/* Referents */}
                      <div>
                        <span className="text-[10px] font-medium text-text-muted uppercase tracking-widest block mb-2">
                          {tr('referent_teachers')}
                        </span>
                        <div className="flex flex-col gap-1">
                          <span className="text-[12px] font-medium text-text-primary">
                            {session.referent1}
                          </span>
                          <span className="text-[12px] font-medium text-text-primary">
                            {session.referent2}
                          </span>
                        </div>
                      </div>

                      {/* Assigned Staff */}
                      <div className="md:min-w-[180px] flex justify-end">
                        <div className="flex flex-col items-end gap-2">
                          <span className="text-[10px] font-medium text-text-muted uppercase tracking-widest block mb-1">
                            {t('specific_team')}
                          </span>
                          {session.isPending ? (
                            <span className="text-[12px] italic text-text-muted">
                              {t('pending_confirmation')}
                            </span>
                          ) : session.staff && session.staff.length > 0 ? (
                            <div className="flex flex-wrap justify-end gap-2 max-w-[300px]">
                              {session.staff.map((staffMember: any) => (
                                <div key={staffMember.userId} className="flex items-center gap-2 bg-background-subtle border border-border-subtle px-3 py-1 hover:border-red-200 transition-colors group/chip">
                                  <span className="text-[11px] font-medium text-text-primary group-hover/chip:text-red-500 transition-colors">
                                    {staffMember.user?.fullName || staffMember.name}
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (staffMember.userId || staffMember.id) {
                                        handleRemoveStaff(Number(session.sessionId), (staffMember.userId || staffMember.id) as number);
                                      }
                                    }}
                                    className="text-text-muted hover:text-red-500 focus:outline-none transition-colors"
                                    title="Remove teacher"
                                  >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[12px] font-medium text-red-500">
                              {t('no_teacher_assigned')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination UI */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={filteredSessions.length}
              currentItemsCount={paginatedSessions.length}
              itemName={tc('sessions').toLowerCase()}
            />
          </>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-background-surface w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in slide-in-from-bottom-4 duration-500 border border-border-subtle">
            {/* Header */}
            <div className="px-10 py-8 border-b border-border-subtle flex justify-between items-start sticky top-0 bg-background-surface z-10">
              <div>
                <h3 className="text-xl font-medium text-text-primary tracking-tight">{t('assign_teacher')}</h3>
                <p className="text-[12px] font-medium text-text-muted mt-2">{t('assign_teacher_desc')}</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-text-muted hover:text-text-primary transition-colors mt-1"
                aria-label="Close"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
              {/* Mode Selection */}
              <div className="flex bg-background-subtle p-1 border border-border-subtle">
                <button
                  onClick={() => { setMode('single'); setSelectedSessionId(""); }}
                  className={`flex-1 py-3 text-[12px] font-medium transition-all ${mode === 'single' ? 'bg-background-surface text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'
                    }`}
                >
                  {t('specific_day')}
                </button>
                <button
                  onClick={() => { setMode('whole'); setSelectedSessionId(""); }}
                  className={`flex-1 py-3 text-[12px] font-medium transition-all ${mode === 'whole' ? 'bg-background-surface text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'
                    }`}
                >
                  {t('whole_workshop')}
                </button>
              </div>

              {/* Workshop Select */}
              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="block text-[12px] font-medium text-text-primary px-1">
                    {t('select_workshop')}
                  </label>
                  <select
                    value={selectedAssignmentId}
                    onChange={(e) => { setSelectedAssignmentId(e.target.value); setSelectedSessionId(""); }}
                    className="w-full bg-background-subtle border border-border-subtle text-sm p-3 font-medium text-text-primary focus:border-consorci-darkBlue outline-none appearance-none"
                  >
                    <option value="">{t('choose_workshop')}</option>
                    {assignments.map(a => (
                      <option key={a.assignmentId} value={a.assignmentId}>
                        {a.workshop?.title} (Ref: {a.assignmentId})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Session Select (Only Single Mode) */}
                {mode === 'single' && selectedAssignmentId && (
                  <div className="animate-in slide-in-from-top-2 duration-200 space-y-3">
                    <label className="block text-[12px] font-medium text-text-primary px-1">
                      {t('select_day')}
                    </label>
                    <select
                      value={selectedSessionId}
                      onChange={(e) => setSelectedSessionId(e.target.value)}
                      className="w-full bg-background-subtle border border-border-subtle text-sm p-3 font-medium text-text-primary focus:border-consorci-darkBlue outline-none appearance-none"
                    >
                      <option value="">{t('choose_session')}</option>
                      {selectedAssignment?.sessions?.map((s: Session, idx: number) => (
                        <option key={s.sessionId} value={s.sessionId}>
                          {t('session_n', { number: idx + 1 })} - {new Date(s.sessionDate).toLocaleDateString()} ({s.startTime}-{s.endTime})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Professor Select */}
                <div className="space-y-3">
                  <label className="block text-[12px] font-medium text-text-primary px-1">
                    {t('select_teacher')}
                  </label>
                  <select
                    value={selectedTeacherId}
                    onChange={(e) => setSelectedTeacherId(e.target.value)}
                    className="w-full bg-background-subtle border border-border-subtle text-sm p-3 font-medium text-text-primary focus:border-consorci-darkBlue outline-none appearance-none"
                  >
                    <option value="">{t('choose_teacher')}</option>
                    {allTeachers.map(p => (
                      <option key={p.userId} value={p.userId}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="p-10 border-t border-border-subtle flex gap-4 bg-background-surface">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 text-[13px] font-medium text-text-muted hover:text-text-primary hover:underline transition-colors"
              >
                {tc('cancel')}
              </button>
              <button
                onClick={handleAssign}
                className="flex-1 py-3 bg-consorci-darkBlue text-white text-[13px] font-medium transition-all hover:bg-black active:scale-[0.98]"
              >
                {tc('save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
