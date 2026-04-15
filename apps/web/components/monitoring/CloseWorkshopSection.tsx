'use client';

import React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { toast } from 'sonner';
import getApi from '@/services/api';
import { Assignment } from '@/services/assignmentService';

interface CloseWorkshopSectionProps {
  assignment: Assignment;
  onSuccess?: () => void;
}

export const CloseWorkshopSection: React.FC<CloseWorkshopSectionProps> = ({ assignment, onSuccess }) => {
  const t = useTranslations('AssignmentWorkshopsPage');
  const locale = useLocale();
  const id = assignment.assignmentId;

  const handleClose = async () => {
    const pendingEvaluations = assignment.enrollments?.filter(e => !e.evaluations || e.evaluations.length === 0).length || 0;
    
    if (pendingEvaluations > 0) {
      toast.error(t('close_section.pending_evals_error', { count: pendingEvaluations }));
      return;
    }

    if (!confirm(t('close_section.confirm_dialog'))) return;

    try {
      const api = getApi();
      await api.post(`/assignments/${id}/close`);
      toast.success(t('close_section.success'));
      if (onSuccess) {
        onSuccess();
      } else {
        window.location.reload();
      }
    } catch (_e: any) {
      const message = _e.response?.data?.error || t('close_section.error');
      toast.error(message);
    }
  };

  return (
    <div className="p-8 flex flex-col gap-8 shadow-sm border bg-indigo-50 border-indigo-100 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h4 className="text-lg font-black uppercase text-indigo-700">{t('close_section.title')}</h4>
          <p className="text-xs text-gray-600 mt-1 max-w-xl">{t('close_section.desc')}</p>
        </div>
        <button
          onClick={handleClose}
          className="px-8 py-4 bg-indigo-600 text-white text-[11px] font-black uppercase tracking-widest shadow-xl hover:bg-indigo-700 transition active:scale-[0.98]"
        >
          {t('close_section.confirm_btn')}
        </button>
      </div>

      <div className="border-t border-indigo-100 pt-6">
        <h5 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-4">Certification Summary</h5>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {assignment.enrollments?.map((ins: any) => {
            const total = assignment.sessions?.length || 0;
            const attended = ins.attendance?.filter((a: any) => a.status === 'PRESENT' || a.status === 'LATE').length || 0;
            const pct = total > 0 ? Math.round((attended / total) * 100) : 0;
            const hasEvaluation = ins.evaluations && ins.evaluations.length > 0;
            const willGetCert = pct >= 80 && hasEvaluation;
            
            return (
              <div key={ins.enrollmentId} className="bg-white/50 p-4 border border-indigo-100 flex items-center justify-between">
                <div>
                  <p className="text-[12px] font-bold text-gray-900">{ins.student.fullName}</p>
                  <p className="text-[10px] text-gray-500">{pct}% attendance</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {!hasEvaluation ? (
                    <span className="text-[8px] font-black uppercase bg-orange-100 text-orange-600 px-1.5 py-0.5 whitespace-nowrap">Need Eval</span>
                  ) : willGetCert ? (
                    <span className="text-[8px] font-black uppercase bg-green-100 text-green-600 px-1.5 py-0.5 whitespace-nowrap">Will Certify</span>
                  ) : (
                    <span className="text-[8px] font-black uppercase bg-gray-100 text-gray-500 px-1.5 py-0.5 whitespace-nowrap">No Cert</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
