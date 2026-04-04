'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ROLES } from '@iter/shared';
import DashboardLayout from '@/components/DashboardLayout';
import getApi from '@/services/api';
import Loading from '@/components/Loading';
import { toast } from 'sonner';
import Pagination from '@/components/Pagination';

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

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModality, setSelectedModality] = useState("All modalities");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState<AssignmentMode>('single');
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>("");
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");

  const router = useRouter();

  useEffect(() => {
    if (!authLoading && (!user || user.role.name !== ROLES.COORDINATOR)) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

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
            // If it doesn't have sessions but is in a phase where it should have them soon
            // We add it as a "placeholder" item so the user knows it's there
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
    const matchesModality = selectedModality === "All modalities" || s.modality === selectedModality;
    return matchesSearch && matchesModality;
  });

  const totalPages = Math.ceil(filteredSessions.length / itemsPerPage);
  const paginatedSessions = filteredSessions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedModality]);

  const handleAssign = async () => {
    if (!selectedAssignmentId || !selectedTeacherId) {
      toast.error('Select workshop and teacher');
      return;
    }
    if (mode === 'single' && !selectedSessionId) {
      toast.error('Select a session');
      return;
    }

    try {
      const api = getApi();

      if (mode === 'whole') {
        // Assign to the whole assignment (teaching staff)
        await api.post(`/assignments/${selectedAssignmentId}/staff`, {
          idUser: parseInt(selectedTeacherId)
        });

        const targetAssignment = assignments.find(a => a.assignmentId === parseInt(selectedAssignmentId));
        if (targetAssignment?.sessions) {
          await Promise.all(targetAssignment.sessions.map((s: Session) =>
            api.post(`/assignments/sessions/${s.sessionId}/staff`, { idUser: parseInt(selectedTeacherId) })
              .catch(() => { }) // Ignore duplicates
          ));
        }

        toast.success('Teacher assigned to the whole workshop');
      } else {
        // Single session
        await api.post(`/assignments/sessions/${selectedSessionId}/staff`, {
          idUser: parseInt(selectedTeacherId)
        });
        toast.success('Teacher assigned to the selected day');
      }

      setShowModal(false);
      fetchData(); // Refresh list to show new staff

      // Reset form
      setSelectedSessionId("");
      setSelectedTeacherId("");


    } catch (_error) {
      toast.error('Error making assignment');
    }
  };

  const handleRemoveStaff = async (sessionId: number, idUser: number) => {
    try {
      const api = getApi();
      await api.delete(`/assignments/sessions/${sessionId}/staff/${idUser}`);
      await fetchData(); // Refresh list
      toast.success('Teacher removed successfully');
    } catch (error) {
      console.error(error);
      toast.error('Error removing teacher');
    }
  };

  const selectedAssignment = assignments.find(a => a.assignmentId.toString() === selectedAssignmentId);

  if (authLoading || loading) return <Loading fullScreen message="Loading sessions..." />;

  return (
    <DashboardLayout
      title="Session Management"
      subtitle="View and manage training sessions."
    >
      {/* Search & Filter Bar */}
      <div className="mb-8 flex flex-col lg:flex-row gap-6 bg-white border border-gray-200 p-8 shadow-sm">
        {/* Search */}
        <div className="flex-1">
          <label className="block text-[10px] font-black text-[#00426B] uppercase tracking-[0.2em] mb-3">Search workshop</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Ex: Robotics, Cinema..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-[#F8FAFC] border border-gray-100 focus:border-[#0775AB] focus:ring-0 text-sm font-bold text-[#00426B] placeholder:text-gray-300 transition-all"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-4 top-3.5 h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Modality Filter */}
        <div className="lg:w-64">
          <label className="block text-[10px] font-black text-[#00426B] uppercase tracking-[0.2em] mb-3">Filter by modality</label>
          <select
            value={selectedModality}
            onChange={(e) => setSelectedModality(e.target.value)}
            className="w-full px-4 py-3 bg-[#F8FAFC] border border-gray-100 focus:border-[#0775AB] focus:ring-0 text-sm font-bold text-[#00426B] appearance-none"
          >
            <option value="All modalities">All modalities</option>
            <option value="A">Modality A</option>
            <option value="B">Modality B</option>
            <option value="C">Modality C</option>
          </select>
        </div>

        {/* Action Button */}
        <div className="flex items-end">
          <button
            onClick={() => setShowModal(true)}
            className="bg-[#00426B] text-white px-8 py-[13px] text-[11px] font-black uppercase tracking-[0.2em] hover:bg-[#0775AB] transition-all flex items-center gap-3 shadow-lg h-[46px]"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            Assign Teachers
          </button>
        </div>
      </div>

      {/* Flat List */}
      <div className="bg-white border border-gray-200 shadow-sm overflow-hidden">
        {paginatedSessions.length === 0 ? (
          <div className="p-20 text-center text-gray-400 font-bold uppercase tracking-widest text-xs italic">
            No sessions found with these filters.
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-100">
              {paginatedSessions.map((session) => {
                const dateObj = new Date(session.sessionDate);
                const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
                const dateStr = dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'long' });

                return (
                  <div key={session.sessionId} className={`p-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-gray-50 transition-colors group ${session.isPending ? 'opacity-70 bg-gray-50/50' : ''}`}>
                    <div className="flex items-start gap-4 mb-2 md:mb-0">
                      <div className={`p-3 rounded-full shrink-0 ${session.isPending ? 'bg-gray-200 text-gray-400' : session.modality === 'A' ? 'bg-blue-50 text-[#00426B]' : 'bg-orange-50 text-orange-600'}`}>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={session.isPending ? "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" : "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"} />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-base font-black text-[#00426B] uppercase tracking-tight leading-none mb-2">
                          {session.assignmentTitle}
                          {!session.isPending && (
                            <span className="ml-2 text-[9px] font-normal text-gray-400 normal-case tracking-normal border border-gray-200 px-1.5 py-0.5 rounded">
                              {session.startTime || '09:00'} - {session.endTime || '11:00'}
                            </span>
                          )}
                        </h4>
                        <p className="text-sm font-medium text-gray-600">
                          {session.isPending ? (
                            <span className="text-orange-500 font-bold uppercase text-[10px] tracking-widest">Pending final confirmation</span>
                          ) : (
                            <><span className="capitalize font-bold">{dayName}</span>, {dateStr}</>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Staff & Referents Display */}
                    <div className="flex flex-col md:flex-row gap-6 md:gap-10 md:text-right pl-14 md:pl-0">
                      {/* Referents */}
                      <div>
                        <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest block mb-1">
                          Center Referents
                        </span>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-[#00426B] uppercase leading-tight">
                            {session.referent1}
                          </span>
                          <span className="text-[10px] font-bold text-[#00426B] uppercase leading-tight">
                            {session.referent2}
                          </span>
                        </div>
                      </div>

                      {/* Assigned Staff */}
                      <div className="md:min-w-[150px] flex justify-end">
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest block mb-1">
                            Assigned Teachers
                          </span>
                          {session.isPending ? (
                            <span className="text-[10px] italic text-gray-400">
                              Confirmation required
                            </span>
                          ) : session.staff && session.staff.length > 0 ? (
                            <div className="flex flex-wrap justify-end gap-2 max-w-[300px]">
                              {session.staff.map((staffMember: any) => (
                                <div key={staffMember.userId} className="flex items-center gap-1.5 bg-blue-50 border border-blue-100 px-2 py-1 rounded group/chip hover:border-red-200 transition-colors">
                                  <span className="text-[10px] font-black text-[#4197CB] uppercase group-hover/chip:text-red-400 transition-colors">
                                    {staffMember.user?.fullName || staffMember.name}
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (staffMember.userId || staffMember.id) {
                                        handleRemoveStaff(Number(session.sessionId), (staffMember.userId || staffMember.id) as number);
                                      }
                                    }}
                                    className="text-blue-300 hover:text-red-500 focus:outline-none transition-colors"
                                    title="Remove teacher"
                                  >
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[10px] font-bold text-red-400 uppercase">
                              No teacher assigned
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
              itemName="sessions"
            />
          </>
        )}
      </div>

      {/* Modal Assignment */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>

          <div className="relative bg-white w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-gray-100 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="bg-gray-50 px-8 py-5 border-b border-gray-100 flex justify-between items-center sticky top-0 z-10">
              <div>
                <h3 className="text-xl font-black text-[#00426B] uppercase tracking-tight">Assign Teacher</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Select the mode and teacher for the session.</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-300 hover:text-[#00426B] transition-colors"
                aria-label="Close"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
              {/* Mode Selection */}
              <div className="flex bg-[#F1F5F9] p-1.5 rounded-lg border border-gray-100 shadow-inner">
                <button
                  onClick={() => { setMode('single'); setSelectedSessionId(""); }}
                  className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all rounded-md ${mode === 'single' ? 'bg-white text-[#00426B] shadow-lg ring-1 ring-gray-100' : 'text-gray-400 hover:text-gray-600'
                    }`}
                >
                  Specific Day
                </button>
                <button
                  onClick={() => { setMode('whole'); setSelectedSessionId(""); }}
                  className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all rounded-md ${mode === 'whole' ? 'bg-white text-[#00426B] shadow-lg ring-1 ring-gray-100' : 'text-gray-400 hover:text-gray-600'
                    }`}
                >
                  Whole Workshop
                </button>
              </div>

              {/* Workshop Select */}
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-[#00426B] uppercase tracking-[0.2em] mb-3">
                    Select Workshop
                  </label>
                  <select
                    value={selectedAssignmentId}
                    onChange={(e) => { setSelectedAssignmentId(e.target.value); setSelectedSessionId(""); }}
                    className="w-full bg-[#F8FAFC] border border-gray-100 text-sm p-3 font-bold text-[#00426B] focus:border-[#0775AB] outline-none appearance-none"
                  >
                    <option value="">-- Choose a workshop --</option>
                    {assignments.map(a => (
                      <option key={a.assignmentId} value={a.assignmentId}>
                        {a.workshop?.title} (Ref: {a.assignmentId})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Session Select (Only Single Mode) */}
                {mode === 'single' && selectedAssignmentId && (
                  <div className="animate-in slide-in-from-top-2 duration-200">
                    <label className="block text-[10px] font-black text-[#00426B] uppercase tracking-[0.2em] mb-3">
                      Select Day
                    </label>
                    <select
                      value={selectedSessionId}
                      onChange={(e) => setSelectedSessionId(e.target.value)}
                      className="w-full bg-[#F8FAFC] border border-gray-100 text-sm p-3 font-bold text-[#00426B] focus:border-[#0775AB] outline-none appearance-none"
                    >
                      <option value="">-- Choose a session --</option>
                      {selectedAssignment?.sessions?.map((s: Session, idx: number) => (
                        <option key={s.sessionId} value={s.sessionId}>
                          Session {idx + 1} - {new Date(s.sessionDate).toLocaleDateString()} ({s.startTime}-{s.endTime})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Professor Select */}
                <div>
                  <label className="block text-[10px] font-black text-[#00426B] uppercase tracking-[0.2em] mb-3">
                    Select Teacher
                  </label>
                  <select
                    value={selectedTeacherId}
                    onChange={(e) => setSelectedTeacherId(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-gray-100 text-sm p-3 font-bold text-[#00426B] focus:border-[#0775AB] outline-none appearance-none"
                  >
                    <option value="">-- Choose a teacher --</option>
                    {allTeachers.map(p => (
                      <option key={p.userId} value={p.userId}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-8 py-5 border-t border-gray-100 flex gap-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAssign}
                className="flex-1 py-3 bg-[#00426B] text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#0775AB] transition-all shadow-xl active:scale-95"
              >
                Save Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
