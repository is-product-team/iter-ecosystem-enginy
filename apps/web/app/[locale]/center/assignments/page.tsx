'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUser, User } from '@/lib/auth';
import { PHASES, ROLES } from '@iter/shared';
import DashboardLayout from '@/components/DashboardLayout';
import assignmentService, { Assignment } from '@/services/assignmentService';
import phaseService, { Phase } from '@/services/phaseService';
import getApi from '@/services/api';
import Loading from '@/components/Loading';
import { toast } from 'sonner';
import ConfirmDialog from '@/components/ConfirmDialog';
import Pagination from "@/components/Pagination";

export default function AssignmentsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  
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
    onConfirm: () => {},
  });

  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      const currentUser = getUser();
      if (!isMounted) return;

      if (!currentUser || currentUser.rol.nom_rol !== ROLES.COORDINATOR) {
        router.push('/login');
        return;
      }
      
      setUser(currentUser);

      // Fetch assignments
      if (currentUser.id_center) {
        try {
          const [resAssig, resPhases] = await Promise.all([
            assignmentService.getByCenter(currentUser.id_center),
            phaseService.getAll()
          ]);
          if (isMounted) {
            setAssignments(resAssig);
            setPhases(resPhases);
          }
        } catch (err) {
          console.error(err);
        } finally {
          if (isMounted) setLoading(false);
        }
      } else {
        if (isMounted) setLoading(false);
      }
    };

    init();
    return () => { isMounted = false; };
  }, [router]);

  const isPhaseActive = (phaseName: string) => {
    const phase = phases.find(f => f.name === phaseName);
    return phase ? phase.active : false;
  };

  const filteredAssignments = assignments.filter(a => {
    const matchesSearch = !searchQuery || 
      a.workshop?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.center?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "All statuses" || a.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredAssignments.length / itemsPerPage);
  const paginatedAssignments = filteredAssignments.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
  );

  if (!user) return null;

  return (
    <DashboardLayout
      title="Assigned Workshops"
      subtitle="View and manage the planning of your workshops."
    >
      <div className="w-full">
        {/* Filters Panel */}
        <div className="bg-white border-2 border-gray-100 p-8 mb-10 shadow-sm relative overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6">
            <div className="flex-1 w-full space-y-4">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#00426B] mb-4 flex items-center gap-3">
                <div className="w-8 h-1 bg-[#0775AB]"></div>
                Search and Filters
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative group">
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="SEARCH BY WORKSHOP OR CENTER..."
                    className="w-full pl-10 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-[#4197CB] text-[11px] font-bold uppercase tracking-widest text-[#00426B] transition-all outline-none"
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-4 h-4 w-4 text-[#00426B]/40 group-focus-within:text-[#4197CB] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-4 bg-gray-50 border-2 border-transparent focus:border-[#4197CB] text-[11px] font-bold uppercase tracking-widest text-[#00426B] transition-all outline-none appearance-none"
                >
                  <option value="All statuses">All statuses</option>
                  <option value="IN_PROGRESS">In progress / Accepted</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
            </div>
            <button 
              onClick={() => { setSearchQuery(""); setStatusFilter("All statuses"); }}
              className="px-10 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-[#00426B] hover:bg-[#EAEFF2] transition-all border-2 border-transparent hover:border-[#00426B]"
            >
              Clear
            </button>
          </div>
        </div>

        {loading ? (
          <Loading />
        ) : (
          <div className="bg-white border-2 border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b-2 border-gray-100">
                  <th className="px-10 py-8 text-[11px] font-black uppercase text-gray-400 tracking-[0.2em]">Assigned Workshop</th>
                  <th className="px-10 py-8 text-[11px] font-black uppercase text-gray-400 tracking-[0.2em]">Center</th>
                  <th className="px-10 py-8 text-[11px] font-black uppercase text-gray-400 tracking-[0.2em]">More Info</th>
                  <th className="px-10 py-8 text-[11px] font-black uppercase text-gray-400 tracking-[0.2em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedAssignments.map(a => (
                  <tr key={a.id_assignment} className="bg-white hover:bg-gray-50 transition-colors border-b-2 border-gray-50">
                    <td className="px-10 py-10">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#4197CB] mb-2">WORKSHOP IDENTIFIER</span>
                        <span className="text-base font-extrabold text-[#00426B] uppercase tracking-tight leading-tight">{a.workshop?.title}</span>
                      </div>
                    </td>
                    <td className="px-10 py-10">
                      <span className="text-[11px] font-bold text-[#00426B] uppercase">{a.center?.name || 'Not assigned'}</span>
                    </td>
                    <td className="px-10 py-10">
                      <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                        Start: {a.startDate ? new Date(a.startDate).toLocaleDateString() : '—'}
                      </div>
                    </td>
                    <td className="px-10 py-10 text-right">
                      <button
                        onClick={() => router.push(`/center/assignments/${a.id_assignment}`)}
                        className="btn-primary py-2 px-6 text-[10px]"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredAssignments.length === 0 && (
              <div className="p-20 text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">No assignments found</p>
                <p className="text-[9px] font-bold text-gray-300 uppercase mt-2">Try adjusting the search filters.</p>
              </div>
            )}
            
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={filteredAssignments.length}
              currentItemsCount={paginatedAssignments.length}
              itemName="assignments"
            />
          </div>
        )}

        {/* Incidents Section (Only available in Phase 3) */}
        {isPhaseActive(PHASES.EXECUTION) && (
          <section className="mt-16 bg-white p-8 border border-gray-200">
            <h3 className="text-xl font-black text-[#00426B] mb-4 uppercase tracking-tighter">Incidents and Vacancies Management</h3>
            <p className="text-[10px] font-bold text-gray-400 mb-6 uppercase tracking-widest">
              REPORT BEHAVIOR PROBLEMS OR REQUEST VACANT PLACES.
            </p>

            <div className="flex gap-4">
              <input
                id="incident-input"
                type="text"
                placeholder="Describe the problem..."
                className="flex-1 px-4 py-4 bg-[#F8FAFC] border-none text-[11px] font-bold uppercase tracking-wider text-[#00426B] focus:ring-2 focus:ring-[#F26178] outline-none transition-all"
              />
              <button
                onClick={async () => {
                  const input = document.getElementById('incident-input') as HTMLInputElement;
                  if (!input.value) return;
                  const api = getApi();
                  await api.post('/assignments/incidents', {
                    id_center: user.id_center,
                    description: input.value
                  });
                  input.value = '';
                  toast.success('Incident reported. The CEB will review it soon.');
                }}
                className="px-8 py-4 bg-[#F26178] text-white font-black uppercase text-[10px] tracking-widest hover:bg-[#D94E64] transition-all"
              >
                Report Incident
              </button>
            </div>
          </section>
        )}
      </div>
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
