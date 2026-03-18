'use client';

import React, { useState, useMemo } from 'react';
import { THEME } from '@iter/shared';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  endDate?: string;
  type: 'milestone' | 'deadline' | 'assignment' | 'session';
  description?: string;
  metadata?: any;
  colorClass?: string;
}

interface CalendarProps {
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
}

const Calendar: React.FC<CalendarProps> = ({ events, onEventClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const monthName = currentDate.toLocaleString('ca-ES', { month: 'long' });
  const year = currentDate.getFullYear();

  const prevMonth = () => setCurrentDate(new Date(year, currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, currentDate.getMonth() + 1, 1));

  const calendarWeeks = useMemo(() => {
    const totalDays = daysInMonth(year, currentDate.getMonth());
    const firstDay = (firstDayOfMonth(year, currentDate.getMonth()) + 6) % 7; // Adjust to Monday start
    const days = [];

    // Padding for previous month
    for (let i = 0; i < firstDay; i++) {
      days.push({ day: null, date: null });
    }

    // Days of current month
    for (let d = 1; d <= totalDays; d++) {
      const date = new Date(year, currentDate.getMonth(), d);
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      days.push({ day: d, date: dateStr });
    }

    // Padding for next month to complete the last week
    while (days.length % 7 !== 0) {
      days.push({ day: null, date: null });
    }

    // Split into weeks
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }
    return weeks;
  }, [currentDate]);

  const getEventStyles = (type: string, title: string = '') => {
    switch (type) {
      case 'milestone': 
        return 'bg-consorci-darkBlue text-white';
      case 'deadline': 
        return 'bg-consorci-pinkRed text-white';
      case 'assignment': 
        return 'bg-consorci-lightBlue text-white';
      case 'session': 
        return 'bg-consorci-yellow text-white';
      default: 
        return 'bg-gray-500 text-white';
    }
  };

  const isSameDay = (d1: string, d2: string) => d1.split('T')[0] === d2.split('T')[0];

  return (
    <div className="bg-background-surface border border-border-subtle overflow-hidden font-sans">
      {/* Header */}
      <div className="flex items-center justify-between p-12 bg-background-surface sticky top-0 z-30 border-b border-border-subtle">
        <div className="flex items-center gap-4">
          <h2 className="text-5xl font-bold tracking-tight capitalize text-text-primary flex items-baseline gap-3">
            {monthName} <span className="text-text-muted font-bold tracking-tight">{year}</span>
          </h2>
        </div>
        <div className="flex bg-background-subtle p-2 gap-2 border border-border-subtle">
          <button 
            onClick={prevMonth}
            className="w-12 h-12 flex items-center justify-center hover:bg-background-surface transition-colors text-text-muted hover:text-text-primary"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button 
            onClick={() => setCurrentDate(new Date())}
            className="px-10 h-12 bg-background-surface border border-border-subtle text-[11px] font-bold uppercase tracking-widest text-text-primary hover:bg-background-subtle transition-colors"
          >
            Avui
          </button>
          <button 
            onClick={nextMonth}
            className="w-12 h-12 flex items-center justify-center hover:bg-background-surface transition-colors text-text-muted hover:text-text-primary"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Weekdays Labels */}
      <div className="grid grid-cols-7 border-b border-border-subtle bg-background-subtle">
        {['dl', 'dt', 'dc', 'dj', 'dv', 'ds', 'dg'].map(d => (
          <div key={d} className="py-6 text-center">
            <span className="text-[11px] font-bold uppercase tracking-widest text-text-muted">
              {d}
            </span>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="flex flex-col bg-background-surface">
        {calendarWeeks.map((week, weekIdx) => {
          const firstDayOfWeek = week[0].date;
          const lastDayOfWeek = week[6].date;
          
          const weekEvents: any[] = [];
          if (firstDayOfWeek && lastDayOfWeek) {
            events.forEach(event => {
              const eStart = event.date.split('T')[0];
              const eEnd = (event.endDate || event.date).split('T')[0];
              
              if (eStart <= lastDayOfWeek && eEnd >= firstDayOfWeek) {
                const startIdx = week.findIndex(d => d.date && d.date >= eStart);
                const actualStart = startIdx === -1 ? 0 : startIdx;
                
                const endIdx = week.findIndex(d => d.date && d.date >= eEnd);
                const actualEnd = endIdx === -1 ? 6 : endIdx;
                
                weekEvents.push({
                  ...event,
                  start: actualStart,
                  span: actualEnd - actualStart + 1,
                  continuesBefore: eStart < firstDayOfWeek,
                  continuesAfter: eEnd > lastDayOfWeek,
                  isPhase: event.title.toLowerCase().includes('fase')
                });
              }
            });
          }

          // Track assignment
          const tracks: any[][] = [];
          weekEvents.sort((a, b) => b.span - a.span).forEach(event => {
            let trackIdx = 0;
            while (tracks[trackIdx] && tracks[trackIdx].some(e => 
              (event.start >= e.start && event.start < e.start + e.span) ||
              (e.start >= event.start && e.start < event.start + event.span)
            )) {
              trackIdx++;
            }
            if (!tracks[trackIdx]) tracks[trackIdx] = [];
            tracks[trackIdx].push(event);
          });

          return (
            <div key={weekIdx} className="grid grid-cols-7 relative border-b border-border-subtle last:border-b-0 min-h-[160px]">
              {/* Background Days */}
              {week.map((dateObj, dayIdx) => (
                <div 
                  key={dayIdx} 
                  className={`relative p-5 border-r border-border-subtle last:border-r-0 ${
                    dayIdx === 5 || dayIdx === 6 ? 'bg-background-subtle/50' : ''
                  }`}
                >
                  {dateObj.day && (
                    <span className={`text-[13px] font-black tracking-tight ${
                      isSameDay(new Date().toISOString(), dateObj.date!) 
                        ? 'text-consorci-lightBlue' 
                        : 'text-text-muted/60'
                    }`}>
                      {dateObj.day}
                    </span>
                  )}
                </div>
              ))}

              {/* Event Bars Overlay */}
              <div className="absolute top-12 left-0 w-full h-full pointer-events-none px-1 py-1">
                {tracks.map((track, trackIdx) => (
                  <div key={trackIdx} className="h-8 mb-2 relative w-full">
                    {track.map(event => (
                      <button
                        key={event.id}
                        onClick={() => onEventClick?.(event)}
                        className={`absolute h-full pointer-events-auto flex items-center px-4 transition-colors hover:bg-opacity-90 active:opacity-80 group/event ${event.colorClass || getEventStyles(event.type, event.title)}`}
                        style={{
                          left: `${(event.start * 100) / 7}%`,
                          width: `${(event.span * 100) / 7}%`,
                          marginLeft: event.continuesBefore ? '0' : '2px',
                          marginRight: event.continuesAfter ? '0' : '2px',
                        }}
                      >
                        <div className="flex items-center gap-2 overflow-hidden w-full">
                           <div className="w-1 h-1 bg-white/60 shrink-0"></div>
                           <span className="text-[10px] font-bold text-white truncate uppercase tracking-widest leading-none">
                             {event.title}
                           </span>
                        </div>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
