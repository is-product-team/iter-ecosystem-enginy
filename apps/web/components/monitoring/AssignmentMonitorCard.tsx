'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { Assignment } from '@/services/assignmentService';

interface AssignmentMonitorCardProps {
  assignment: Assignment;
  onCloseClick?: (assignment: Assignment) => void;
}

export const AssignmentMonitorCard: React.FC<AssignmentMonitorCardProps> = ({ assignment, onCloseClick }) => {
  const t = useTranslations('Center.Monitoring.Assignments');
  const tAssig = useTranslations('AssignmentWorkshopsPage');
  const locale = useLocale();
  
  const sessions = assignment.sessions || [];
  const totalSessions = sessions.length;
  const sessionsWithAttendance = sessions.filter(s => s.attendance && s.attendance.length > 0);
  const sessionsCompleted = sessionsWithAttendance.length;
  const progress = totalSessions > 0 ? Math.round((sessionsCompleted / totalSessions) * 100) : 0;

  // Calculate Weighted Status
  let stats = { present: 0, absent: 0, late: 0, total: 0 };
  let weightedScore = 0;
  const enrollments = assignment.enrollments || [];
  
  enrollments.forEach(e => {
    e.attendance?.forEach((a: any) => {
      stats.total++;
      if (a.status === 'PRESENT') {
        stats.present++;
        weightedScore += 1.0; // 100%
      } else if (a.status === 'ABSENT') {
        stats.absent++;
        weightedScore += 0.0; // 0%
      } else if (a.status === 'LATE') {
        stats.late++;
        weightedScore += 0.75; // 75% penalty for lateness
      }
    });
  });

  const attendancePercentage = stats.total > 0 
    ? Math.round((weightedScore / stats.total) * 100) 
    : 100;
  
  const getHealthColor = (pct: number) => {
    if (pct >= 90) return 'text-consorci-green';
    if (pct >= 75) return 'text-consorci-yellow';
    return 'text-consorci-pinkRed';
  };

  const canBeClosed = assignment.status === 'IN_PROGRESS' && progress >= 100;

  return (
    <div className="group relative bg-white transition-all duration-300 hover:shadow-xl hover:shadow-consorci-darkBlue/5 flex flex-col h-full border border-neutral-200 hover:border-consorci-darkBlue overflow-hidden">
      
      <div className="p-6 flex flex-col h-full flex-1">
        {/* Header - Minimal */}
        <div className="flex justify-between items-start mb-4">
            <div className="flex-1 mr-2">
                <h4 className="text-lg font-light text-black tracking-tight leading-snug truncate" title={assignment.workshop?.title}>
                    {assignment.workshop?.title || 'Workshop'}
                </h4>
                <span className="text-[9px] font-normal text-consorci-darkBlue uppercase tracking-widest">
                    Mod {assignment.workshop?.modality} • {assignment.status.replace('_', ' ')}
                </span>
            </div>
        </div>

        {/* Main Data Row - Compact Split with Weighted Percentage */}
        <div className="flex items-center justify-between py-4 border-y border-neutral-50 mb-4">
            <div className="flex items-baseline gap-1">
                <span className={`text-5xl font-light tracking-tighter tabular-nums ${getHealthColor(attendancePercentage)}`}>
                    {attendancePercentage}
                </span>
                <span className="text-base font-normal text-black">%</span>
            </div>
            
            <div className="flex gap-4 border-l border-neutral-100 pl-6">
                <StatItemMini label={t('present')} value={stats.present} color="text-consorci-green" />
                <StatItemMini label={t('late')} value={stats.late} color="text-consorci-yellow" />
                <StatItemMini label={t('absent')} value={stats.absent} color="text-consorci-pinkRed" />
            </div>
        </div>

        {/* Progress Section - Tight */}
        <div className="mb-4">
            <div className="flex justify-between items-center mb-1.5">
                <span className="text-[9px] font-normal text-neutral-400 uppercase tracking-widest">{t('progress')}</span>
                <span className="text-[10px] font-normal text-black">{sessionsCompleted}/{totalSessions}</span>
            </div>
            <div className="w-full h-1 bg-neutral-100 overflow-hidden rounded-full">
                <div 
                    className="h-full bg-consorci-darkBlue transition-all duration-700" 
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
        </div>

        {/* Status / Alerts - Inline */}
        {sessions.some(s => !s.staff || s.staff.length === 0) && (
            <div className="flex items-center gap-1.5 mb-4">
                <div className="h-1 w-1 rounded-full bg-consorci-pinkRed"></div>
                <span className="text-[9px] font-normal text-consorci-pinkRed uppercase tracking-tight">{t('staff_needed')}</span>
            </div>
        )}

        {/* Actions - Combined Row */}
        <div className="mt-auto flex items-center gap-2">
            {canBeClosed && onCloseClick && (
                <button 
                    onClick={() => onCloseClick(assignment)}
                    className="flex-1 py-3 bg-consorci-darkBlue text-white text-[9px] font-normal uppercase tracking-[0.15em] hover:bg-black transition-all"
                >
                    {tAssig('close_section.confirm_btn')}
                </button>
            )}
            
            <Link 
                href={`/${locale}/center/sessions?assignmentId=${assignment.assignmentId}`}
                className={`group/link flex items-center justify-between border-b border-black/10 hover:border-consorci-darkBlue py-2.5 transition-all ${canBeClosed ? 'px-2' : 'w-full'}`}
            >
                <span className="text-[9px] font-normal text-consorci-darkBlue uppercase tracking-[0.15em]">{t('view_details')}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-2 text-consorci-darkBlue transition-transform group-hover/link:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
            </Link>
        </div>
      </div>
    </div>
  );
};

const StatItemMini = ({ label, value, color }: { label: string, value: number, color: string }) => (
    <div className="text-center">
        <p className={`text-lg font-light tabular-nums leading-none mb-1 ${value > 0 ? color : 'text-neutral-200'}`}>{value}</p>
        <p className="text-[8px] font-normal text-neutral-400 uppercase tracking-tighter">{label}</p>
    </div>
);
