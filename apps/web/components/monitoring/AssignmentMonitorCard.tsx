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
  
  // Calculate Progress
  const today = new Date();
  const sessions = assignment.sessions || [];
  const totalSessions = sessions.length;
  const sessionsCompleted = sessions.filter(s => new Date(s.sessionDate) < today).length;
  const progress = totalSessions > 0 ? Math.round((sessionsCompleted / totalSessions) * 100) : 0;
  
  // Detect Staff Gaps
  const hasStaffGap = sessions.some(s => !s.staff || s.staff.length === 0);
  
  // Calculate Attendance Health (Simplified: Avg attendance of sessions already held)
  let attendanceHealth = 100;
  const sessionsWithAttendance = sessions.filter(s => new Date(s.sessionDate) < today);
  
  if (sessionsWithAttendance.length > 0) {
    const enrollments = assignment.enrollments || [];
    if (enrollments.length > 0) {
      let totalAttended = 0;
      let totalExpected = enrollments.length * sessionsWithAttendance.length;
      
      enrollments.forEach(e => {
        totalAttended += e.attendance?.filter((a: any) => a.status === 'PRESENT' || a.status === 'LATE').length || 0;
      });
      
      attendanceHealth = totalExpected > 0 ? Math.round((totalAttended / totalExpected) * 100) : 100;
    }
  }

  const getHealthColor = (health: number) => {
    if (health >= 90) return 'bg-consorci-green';
    if (health >= 70) return 'bg-yellow-400';
    return 'bg-consorci-pinkRed';
  };

  const getHealthLabel = (health: number) => {
    if (health >= 90) return t('attendance_ok');
    return t('attendance_warning');
  };

  // Workshop can be closed if it's in progress and all sessions are done
  const canBeClosed = assignment.status === 'IN_PROGRESS' && progress >= 100;

  return (
    <div className={`bg-background-surface border p-8 transition-all duration-300 flex flex-col h-full ${canBeClosed ? 'border-indigo-200 bg-indigo-50/10' : 'border-border-subtle hover:border-consorci-darkBlue'}`}>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h4 className="text-base font-medium text-text-primary tracking-tight mb-1">
            {assignment.workshop?.title || 'Unknown Workshop'}
          </h4>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium text-text-muted uppercase tracking-widest px-2 py-0.5 bg-background-subtle border border-border-subtle">
              {assignment.workshop?.modality}
            </span>
            <span className="text-[10px] font-medium text-white uppercase tracking-widest px-2 py-0.5 bg-consorci-darkBlue">
              {assignment.status}
            </span>
          </div>
        </div>
        <div className={`h-3 w-3 rounded-full ${getHealthColor(attendanceHealth)} shadow-sm`} title={getHealthLabel(attendanceHealth)}></div>
      </div>

      <div className="space-y-6 flex-1">
        {/* Progress Section */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-[11px] font-medium text-text-muted uppercase tracking-wider">{t('progress')}</span>
            <span className="text-[11px] font-medium text-text-primary">{sessionsCompleted} / {totalSessions} {t('sessions')}</span>
          </div>
          <div className="w-full h-1.5 bg-background-subtle rounded-none overflow-hidden border border-border-subtle">
            <div 
              className="h-full bg-consorci-darkBlue transition-all duration-500" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Health / Alert Section */}
        <div className="flex flex-col gap-2">
          {hasStaffGap && (
            <div className="flex items-center gap-2 text-[11px] font-medium text-consorci-pinkRed bg-red-50 p-2 border border-red-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {t('no_staff')}
            </div>
          )}
          
          <div className={`flex items-center gap-2 text-[11px] font-medium ${attendanceHealth < 90 ? 'text-yellow-600' : 'text-consorci-green'}`}>
             <span className={`w-2 h-2 rounded-full ${getHealthColor(attendanceHealth)}`}></span>
             {getHealthLabel(attendanceHealth)} ({attendanceHealth}%)
          </div>
        </div>
      </div>

      {/* Action area */}
      <div className="mt-8 flex flex-col gap-3">
        {canBeClosed && onCloseClick && (
          <button 
            onClick={() => onCloseClick(assignment)}
            className="w-full py-3 bg-indigo-600 text-white text-[11px] font-black uppercase tracking-widest hover:bg-indigo-700 transition active:scale-[0.98] shadow-md"
          >
            {tAssig('close_section.confirm_btn')}
          </button>
        )}
        
        <Link 
          href={`/${locale}/center/sessions?assignmentId=${assignment.assignmentId}`}
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
