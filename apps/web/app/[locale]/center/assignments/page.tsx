'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('AssignmentsPage');
  const tCommon = useTranslations('Common');

  const [user, setUser] = useState<User | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

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
  const params = useParams();
  const locale = params?.locale || 'ca';

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      const currentUser = getUser();
      if (!isMounted) return;

      if (!currentUser || currentUser.role.name !== ROLES.COORDINATOR) {
        router.push(`/${locale}/login`);
        return;
      }

      setUser(currentUser);

      // Fetch assignments
      if (currentUser.centerId) {
        try {
          const [resAssig, resPhases] = await Promise.all([
            assignmentService.getByCenter(currentUser.centerId),
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
  }, [router, locale]);

  const isPhaseActive = (phaseName: string) => {
    const phase = phases.find(f => f.name === phaseName);
    return phase ? phase.isActive : false;
  };

  const filteredAssignments = assignments.filter(a => {
    const matchesSearch = !searchQuery ||
      a.workshop?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.center?.name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "All" || a.status === statusFilter;

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
      title={t('title')}
      subtitle={t('subtitle')}
    >
      <div className="w-full">
        {/* Filters Panel */}
        <div className="bg-background-surface border border-border-subtle p-10 mb-10">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8">
            <div className="flex-1 w-full space-y-6">
              <h3 className="text-[14px] font-medium text-text-primary">
                Search assignments
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative group">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by workshop or center..."
                    className="w-full pl-11 pr-4 py-3.5 bg-background-subtle border border-border-subtle focus:border-consorci-darkBlue text-sm font-medium text-text-primary transition-all outline-none"
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-4 top-4 h-5 w-5 text-text-muted group-focus-within:text-consorci-darkBlue transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-3.5 bg-background-subtle border border-border-subtle focus:border-consorci-darkBlue text-sm font-medium text-text-primary transition-all outline-none appearance-none"
                >
                  <option value="All">{t('all_statuses')}</option>
                  <option value="IN_PROGRESS">{t('in_progress')}</option>
                  <option value="COMPLETED">{t('completed')}</option>
                </select>
              </div>
            </div>
            <button
              onClick={() => { setSearchQuery(""); setStatusFilter("All statuses"); }}
              className="px-8 py-3.5 text-[13px] font-medium text-text-muted hover:text-text-primary transition-all"
            >
              Clear filters
            </button>
          </div>
        </div>

        {loading ? (
          <Loading />
        ) : (
          <div className="bg-background-surface border border-border-subtle overflow-hidden">
            <div className="premium-table-container">
              <table className="w-full text-left">
              <thead>
                <tr className="bg-background-subtle border-b border-border-subtle">
                  <th className="px-10 py-6 text-[12px] font-medium text-text-primary">Assigned Workshop</th>
                  <th className="px-10 py-6 text-[12px] font-medium text-text-primary">Center</th>
                  <th className="px-10 py-6 text-[12px] font-medium text-text-primary">Planning</th>
                  <th className="px-10 py-6 text-[12px] font-medium text-text-primary">Status</th>
                  <th className="px-10 py-6 text-[12px] font-medium text-text-primary text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {paginatedAssignments.map(a => (
                  <tr key={a.assignmentId} className="bg-white hover:bg-gray-50 transition-colors border-b-2 border-gray-50">
                    <td className="px-10 py-8">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-medium text-consorci-darkBlue mb-1">WORKSHOP IDENTIFIER</span>
                        <span className="text-[15px] font-medium text-text-primary tracking-tight leading-tight">{a.workshop?.title}</span>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <span className="text-[13px] font-medium text-text-primary">{a.center?.name || 'Not assigned'}</span>
                    </td>
                    <td className="px-10 py-8">
                      <div className="text-[13px] text-text-muted">
                        Start: {a.startDate ? new Date(a.startDate).toLocaleDateString() : '—'}
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <span className={`text-[11px] font-medium px-3 py-1 border ${a.status === 'VALIDATED' ? 'border-green-500/20 bg-green-500/5 text-green-600' :
                          a.status === 'DATA_ENTRY' ? 'border-orange-500/20 bg-orange-500/5 text-orange-600' :
                            'border-border-subtle bg-background-subtle text-text-muted'
                        }`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <button
                        onClick={() => router.push(`/center/assignments/${a.assignmentId}`)}
                        className="bg-consorci-darkBlue text-white py-2 px-6 text-[12px] font-medium transition-all hover:bg-black active:scale-[0.98]"
                      >
                        {t('manage_btn')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

            {filteredAssignments.length === 0 && (
              <div className="p-20 text-center">
                <p className="text-text-primary font-medium text-sm">No assignments found</p>
                <p className="text-text-muted text-[12px] font-medium mt-2">Try adjusting the search filters.</p>
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
          <section className="mt-16 bg-background-surface p-10 border border-border-subtle">
            <h3 className="text-xl font-medium text-text-primary mb-3">Incidents and Vacancies Management</h3>
            <p className="text-[13px] font-medium text-text-muted mb-8">
              Report behavior problems or request vacant places for your workshops.
            </p>

            <div className="flex gap-4">
              <input
                id="incident-input"
                type="text"
                placeholder="Describe the problem..."
                className="flex-1 px-4 py-4 bg-background-subtle border border-border-subtle text-sm font-medium text-text-primary focus:border-consorci-darkBlue outline-none transition-all appearance-none"
              />
              <button
                onClick={async () => {
                  const input = document.getElementById('incident-input') as HTMLInputElement;
                  if (!input.value) return;
                  const api = getApi();
                  await api.post('/assignments/incidents', {
                    centerId: user.centerId,
                    description: input.value
                  });
                  input.value = '';
                  toast.success(t('incident_success'));
                }}
                className="px-8 py-4 bg-[#F26178] text-white font-medium text-[13px] transition-all hover:bg-black active:scale-[0.98]"
              >
                {t('report_btn')}
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
