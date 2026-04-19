'use client';

import React, { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { toast } from 'sonner';
import getApi from '@/services/api';
import { Assignment } from '@/services/assignmentService';
import Button from '../ui/Button';

interface CloseWorkshopSectionProps {
  assignment: Assignment;
  onSuccess?: () => void;
}

export const CloseWorkshopSection: React.FC<CloseWorkshopSectionProps> = ({ assignment, onSuccess }) => {
  const t = useTranslations('AssignmentWorkshopsPage');
  const tc = useTranslations('Common');
  const locale = useLocale();
  const id = assignment.assignmentId;
  const [loading, setLoading] = useState(false);

  const handleClose = async () => {
    const pendingEvaluations = assignment.enrollments?.filter(e => !e.evaluations || e.evaluations.length === 0).length || 0;
    
    if (pendingEvaluations > 0) {
      toast.error(t('close_section.pending_evals_error', { count: pendingEvaluations }));
      return;
    }

    if (!confirm(t('close_section.confirm_dialog'))) return;

    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 flex flex-col gap-8 shadow-sm border bg-background-subtle border-border-subtle mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h4 className="text-lg font-black uppercase text-consorci-darkBlue">{t('close_section.title')}</h4>
          <p className="text-xs text-text-muted mt-1 max-w-xl">{t('close_section.desc')}</p>
        </div>
        <Button
          onClick={handleClose}
          variant="primary"
          size="lg"
          loading={loading}
          className="shadow-xl tracking-widest uppercase font-black"
        >
          {t('close_section.confirm_btn')}
        </Button>
      </div>

      <div className="border-t border-border-subtle pt-6">
        <h5 className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-4">{locale === 'ca' ? 'RESUM DE CERTIFICACIÓ' : 'RESUMEN DE CERTIFICACIÓN'}</h5>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {assignment.enrollments?.map((ins: any) => {
            const total = assignment.sessions?.length || 0;
            const attended = ins.attendance?.filter((a: any) => a.status === 'PRESENT' || a.status === 'LATE').length || 0;
            const pct = total > 0 ? Math.round((attended / total) * 100) : 0;
            const hasEvaluation = ins.evaluations && ins.evaluations.length > 0;
            const willGetCert = pct >= 80 && hasEvaluation;
            
            return (
              <div key={ins.enrollmentId} className="bg-background-surface p-4 border border-border-subtle flex items-center justify-between">
                <div>
                  <p className="text-[12px] font-bold text-text-primary">{ins.student.fullName}</p>
                  <p className="text-[10px] text-text-muted">{pct}% {locale === 'ca' ? 'assistència' : 'asistencia'}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {!hasEvaluation ? (
                    <span className="text-[8px] font-black uppercase bg-orange-500/10 text-orange-600 px-1.5 py-0.5 whitespace-nowrap">{tc('badges.need_eval')}</span>
                  ) : willGetCert ? (
                    <span className="text-[8px] font-black uppercase bg-consorci-green/10 text-consorci-green px-1.5 py-0.5 whitespace-nowrap">{tc('badges.will_certify')}</span>
                  ) : (
                    <span className="text-[8px] font-black uppercase bg-background-subtle text-text-muted px-1.5 py-0.5 whitespace-nowrap">{tc('badges.no_cert')}</span>
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
