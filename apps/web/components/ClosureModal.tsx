'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Assignment } from '@/services/assignmentService';
import Loading from './Loading';

interface ClosureModalProps {
  isOpen: boolean;
  assignment: Assignment | null;
  isProcessing: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ClosureModal: React.FC<ClosureModalProps> = ({
  isOpen,
  assignment,
  isProcessing,
  onConfirm,
  onCancel,
}) => {
  const t = useTranslations('Admin.Closure');
  const tc = useTranslations('Common');

  if (!isOpen || !assignment) return null;

  const totalEnrollments = assignment.enrollments?.length || 0;
  const evaluatedCount = assignment.enrollments?.filter(e => e.hasTeacherEvaluation).length || 0;
  const allEvaluated = evaluatedCount === totalEnrollments && totalEnrollments > 0;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
        onClick={!isProcessing ? onCancel : undefined}
      />
      
      {/* Modal */}
      <div className="relative bg-background-surface border border-border-subtle max-w-2xl w-full overflow-hidden animate-in zoom-in fade-in duration-200 shadow-2xl">
        <div className="p-10">
          <div className="flex items-start gap-6 mb-10">
            <div className={`w-14 h-14 flex-shrink-0 flex items-center justify-center ${allEvaluated ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-500'}`}>
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-medium text-text-primary mb-2">
                {t('modal_title')}
              </h3>
              <p className="text-[13px] text-text-muted font-medium">
                {assignment.workshop?.title} — {assignment.center?.name}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Stats Summary */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-background-subtle p-5 border border-border-subtle">
                <span className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">{t('evaluations_status')}</span>
                <span className={`text-[16px] font-bold ${allEvaluated ? 'text-green-600' : 'text-orange-500'}`}>
                  {evaluatedCount} / {totalEnrollments}
                </span>
              </div>
              <div className="bg-background-subtle p-5 border border-border-subtle">
                <span className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">{t('certificates_to_be_issued')}</span>
                <span className="text-[16px] font-bold text-consorci-darkBlue">
                   {assignment.enrollments?.filter(e => {
                     // We don't have attendance count here yet in the short list, 
                     // but in the backend it will be filtered.
                     // Just show a tentative count if possible.
                     return true; 
                   }).length} ({t('pending_validation')})
                </span>
              </div>
            </div>

            {/* Warning Message */}
            {!allEvaluated && (
              <div className="bg-orange-50 border border-orange-200 p-5 flex gap-4">
                <svg className="w-5 h-5 text-orange-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-[12px] text-orange-800 font-medium leading-relaxed">
                  {t('missing_evaluations_warning', { count: totalEnrollments - evaluatedCount })}
                </p>
              </div>
            )}

            <div className="bg-background-subtle p-6 border border-border-subtle">
              <h4 className="text-[11px] font-black uppercase text-text-primary mb-3 tracking-widest">{t('effects_title')}</h4>
              <ul className="space-y-3">
                <li className="flex gap-3 text-[12px] text-text-muted font-medium">
                  <span className="text-consorci-darkBlue font-black">→</span>
                  {t('effect_lock_data')}
                </li>
                <li className="flex gap-3 text-[12px] text-text-muted font-medium">
                  <span className="text-consorci-darkBlue font-black">→</span>
                  {t('effect_generate_pdf')}
                </li>
                <li className="flex gap-3 text-[12px] text-text-muted font-medium">
                  <span className="text-consorci-darkBlue font-black">→</span>
                  {t('effect_finish_phase')}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-background-subtle px-10 py-6 border-t border-border-subtle flex gap-4 justify-end">
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="px-6 py-3 text-[12px] font-medium text-text-muted hover:text-text-primary transition-colors disabled:opacity-50"
          >
            {tc('cancel')}
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className={`px-8 py-3 text-[12px] font-bold text-white transition-all active:scale-[0.98] flex items-center gap-3 ${
              isProcessing ? 'bg-consorci-darkBlue/50 cursor-not-allowed' : 'bg-consorci-darkBlue hover:bg-black'
            }`}
          >
            {isProcessing && <Loading size="mini" white />}
            {isProcessing ? t('closing_process') : t('confirm_closure')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClosureModal;
