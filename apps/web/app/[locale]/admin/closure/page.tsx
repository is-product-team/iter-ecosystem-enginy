'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import Loading from '@/components/Loading';
import assignmentService, { Assignment } from '@/services/assignmentService';
import { toast } from 'sonner';
import Pagination from '@/components/Pagination';
import ClosureModal from '@/components/ClosureModal';

export default function ClosurePage() {
  const t = useTranslations('Admin.Closure');
  const tc = useTranslations('Common');
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const locale = useLocale();

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchAssignments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await assignmentService.getAll();
      // Filter only those in EXECUTION or COMPLETED for this view
      setAssignments(data.filter(a => a.status === 'EXECUTION' || a.status === 'COMPLETED'));
    } catch (error) {
      console.error(error);
      toast.error(tc('error_loading'));
    } finally {
      setLoading(false);
    }
  }, [tc]);

  useEffect(() => {
    if (!authLoading && (!user || user.role.name !== 'ADMIN')) {
      router.push(`/${locale}/login`);
      return;
    }
    fetchAssignments();
  }, [user, authLoading, router, locale, fetchAssignments]);

  const filteredAssignments = useMemo(() => {
    return assignments.filter(a => 
      a.workshop?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.center?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [assignments, searchTerm]);

  const totalPages = Math.ceil(filteredAssignments.length / itemsPerPage);
  const paginatedData = filteredAssignments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleOpenClosure = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setIsModalOpen(true);
  };

  const handleConfirmClosure = async () => {
    if (!selectedAssignment) return;
    setIsProcessing(true);
    try {
      await assignmentService.closeAssignment(selectedAssignment.assignmentId);
      toast.success(t('closure_success'));
      setIsModalOpen(false);
      fetchAssignments(); // Refresh status
    } catch (error) {
      console.error(error);
      toast.error(t('closure_error'));
    } finally {
      setIsProcessing(false);
    }
  };

  if (authLoading || loading) {
    return <Loading fullScreen message={tc('loading')} />;
  }

  return (
    <DashboardLayout
      title={t('title')}
      subtitle={t('subtitle')}
    >
      <div className="space-y-6">
        {/* Search Bar */}
        <div className="bg-background-surface border border-border-subtle p-6 flex gap-4">
          <div className="flex-1 relative">
            <input 
              type="text" 
              placeholder={t('search_placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-background-subtle border border-border-subtle focus:border-consorci-darkBlue outline-none text-sm font-medium transition-all"
            />
            <svg className="w-5 h-5 absolute left-4 top-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Assignments Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {paginatedData.map((assignment) => {
            const isCompleted = assignment.status === 'COMPLETED';
            const total = assignment.enrollments?.length || 0;
            const evaluated = assignment.enrollments?.filter(e => e.hasTeacherEvaluation).length || 0;
            const progress = total > 0 ? (evaluated / total) * 100 : 0;

            return (
              <div 
                key={assignment.assignmentId}
                className={`bg-background-surface border ${isCompleted ? 'border-green-200 bg-green-50/10' : 'border-border-subtle'} p-8 transition-all hover:shadow-xl group`}
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className={`inline-block px-3 py-1 text-[10px] font-black uppercase tracking-widest mb-3 ${
                      isCompleted ? 'bg-green-100 text-green-700' : 'bg-consorci-darkBlue text-white'
                    }`}>
                      {isCompleted ? tc('completed') : tc('in_execution')}
                    </span>
                    <h3 className="text-lg font-bold text-text-primary group-hover:text-consorci-darkBlue transition-colors">{assignment.workshop?.title}</h3>
                    <p className="text-[13px] text-text-muted font-medium mt-1">{assignment.center?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-bold text-text-muted uppercase opacity-50">ID: {assignment.assignmentId}</p>
                    <p className="text-[12px] font-medium text-text-primary mt-1">
                      {new Date(assignment.startDate || '').toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Progress evaluations */}
                <div className="mb-8 space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="text-[11px] font-black uppercase tracking-wider text-text-muted">{t('evaluations')}</span>
                    <span className="text-[12px] font-bold text-text-primary">{evaluated} / {total} Alumnos</span>
                  </div>
                  <div className="w-full h-1.5 bg-background-subtle border border-border-subtle overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${isCompleted ? 'bg-green-500' : 'bg-consorci-darkBlue'}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-6 border-t border-border-subtle/50">
                  <div className="flex -space-x-3 overflow-hidden">
                     {/* Teachers avatars placeholder or names */}
                     <div className="text-[11px] font-bold text-text-muted bg-background-subtle px-3 py-1 border border-border-subtle">
                       {assignment.teacher1?.name} {assignment.teacher2 ? `& ${assignment.teacher2.name}` : ''}
                     </div>
                  </div>
                  
                  {!isCompleted ? (
                    <button
                      onClick={() => handleOpenClosure(assignment)}
                      className="px-6 py-2.5 bg-background-subtle border border-border-subtle text-consorci-darkBlue text-[12px] font-bold uppercase tracking-wider hover:bg-consorci-darkBlue hover:text-white transition-all active:scale-[0.98]"
                    >
                      {t('action_close')}
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 text-green-600">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-[11px] font-black uppercase tracking-widest">{t('closed_status')}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredAssignments.length === 0 && (
          <div className="py-24 text-center border-2 border-dashed border-border-subtle">
             <p className="text-text-muted font-medium italic">{tc('no_results')}</p>
          </div>
        )}

        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredAssignments.length}
          currentItemsCount={paginatedData.length}
          itemName={t('assignments_name')}
        />
      </div>

      <ClosureModal 
        isOpen={isModalOpen}
        assignment={selectedAssignment}
        isProcessing={isProcessing}
        onConfirm={handleConfirmClosure}
        onCancel={() => setIsModalOpen(false)}
      />
    </DashboardLayout>
  );
}
