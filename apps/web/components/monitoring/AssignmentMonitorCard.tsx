'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useLocale } from 'next-intl';

interface AssignmentMonitorCardProps {
  assignment: {
    id: string;
    workshopName: string;
    modality: string;
    centerName: string;
    progress: number; // 0 to 100
    attendanceHealth: number; // 0 to 100
    hasStaffGap: boolean;
    sessionsCompleted: number;
    totalSessions: number;
    nextSessionDate: string | null;
  };
}

export const AssignmentMonitorCard: React.FC<AssignmentMonitorCardProps> = ({ assignment }) => {
  const t = useTranslations('Center.Monitoring.Assignments');
  const locale = useLocale();

  const getHealthColor = (health: number) => {
    if (health >= 100) return 'bg-consorci-green';
    if (health >= 80) return 'bg-yellow-400';
    return 'bg-consorci-pinkRed';
  };

  const getHealthLabel = (health: number) => {
    if (health >= 100) return t('attendance_ok');
    return t('attendance_warning');
  };

  return (
    <div className="bg-background-surface border border-border-subtle p-8 hover:border-consorci-darkBlue transition-all duration-300">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h4 className="text-base font-medium text-text-primary tracking-tight mb-1">
            {assignment.workshopName}
          </h4>
          <span className="text-[10px] font-medium text-text-muted uppercase tracking-widest">
            {assignment.modality}
          </span>
        </div>
        <div className={`h-3 w-3 rounded-full ${getHealthColor(assignment.attendanceHealth)} shadow-sm`} title={getHealthLabel(assignment.attendanceHealth)}></div>
      </div>

      <div className="space-y-6">
        {/* Progress Section */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-[11px] font-medium text-text-muted uppercase tracking-wider">{t('progress')}</span>
            <span className="text-[11px] font-medium text-text-primary">{assignment.sessionsCompleted} / {assignment.totalSessions}</span>
          </div>
          <div className="w-full h-1.5 bg-background-subtle rounded-none overflow-hidden border border-border-subtle">
            <div 
              className="h-full bg-consorci-darkBlue transition-all duration-500" 
              style={{ width: `${assignment.progress}%` }}
            ></div>
          </div>
        </div>

        {/* Health / Alert Section */}
        <div className="flex flex-col gap-2">
          {assignment.hasStaffGap && (
            <div className="flex items-center gap-2 text-[11px] font-medium text-consorci-pinkRed">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {t('no_staff')}
            </div>
          )}
          
          <div className={`flex items-center gap-2 text-[11px] font-medium ${assignment.attendanceHealth < 100 ? 'text-yellow-600' : 'text-consorci-green'}`}>
             <span className={`w-2 h-2 rounded-full ${getHealthColor(assignment.attendanceHealth)}`}></span>
             {getHealthLabel(assignment.attendanceHealth)} ({assignment.attendanceHealth}%)
          </div>
        </div>

        {/* Action button */}
        <Link 
          href={`/${locale}/center/sessions?assignmentId=${assignment.id}`}
          className="flex items-center justify-between w-full py-3 px-4 bg-background-subtle border border-border-subtle hover:border-consorci-darkBlue hover:bg-background-surface transition-all text-[11px] font-medium text-text-primary uppercase tracking-wider group"
        >
          {t('view_details')}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>
    </div>
  );
};
