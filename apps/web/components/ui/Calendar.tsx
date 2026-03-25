'use client';

import React, { useState, useMemo } from 'react';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  endDate?: string;
  type: 'milestone' | 'deadline' | 'assignment' | 'session';
  description?: string;
  metadata?: {
    hora?: string;
    centre?: string;
    id_assignacio?: number;
    [key: string]: unknown;
  };
  colorClass?: string;
}

interface CalendarProps {
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onRangeChange?: (start: Date, end: Date) => void;
  isLoading?: boolean;
}

const Calendar: React.FC<CalendarProps> = ({ events, onEventClick, onRangeChange, isLoading }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const monthName = format(currentDate, 'MMMM', { locale: ca });
  const year = currentDate.getFullYear();

  // Notify parent on range change
  useEffect(() => {
    const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
    onRangeChange?.(start, end);
  }, [currentDate]);

  const prevMonth = () => setCurrentDate(new Date(year, currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, currentDate.getMonth() + 1, 1));

  const calendarWeeks = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });

    const weeks = [];
    let currentIter = start;

    while (currentIter <= end) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        week.push({
          day: currentIter.getDate(),
          date: format(currentIter, 'yyyy-MM-dd'),
          isCurrentMonth: currentIter.getMonth() === currentDate.getMonth(),
        });
        currentIter = new Date(currentIter.getTime() + 24 * 60 * 60 * 1000);
      }
      weeks.push(week);
    }
    return weeks;
  }, [currentDate, year]);

  const getEventStyles = (type: string) => {
    switch (type) {
      case 'milestone': return '#00426B';
      case 'deadline': return '#E10051';
      case 'assignment': return '#4197CB';
      case 'session': return '#EAB308';
      default: return '#9CA3AF';
    }
  };

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const selectedDayEvents = useMemo(() => {
    return events.filter(event => {
      const eStart = event.date.split('T')[0];
      const eEnd = (event.endDate || event.date).split('T')[0];
      return selectedDateStr >= eStart && selectedDateStr <= eEnd;
    });
  }, [selectedDateStr, events]);

  return (
    <div className="flex flex-col xl:flex-row bg-background-surface border border-border-subtle overflow-hidden font-sans min-h-[700px]">
      {/* Calendar Section */}
      <div className="flex-1 flex flex-col border-r border-border-subtle">
        {/* Header */}
        <div className="flex items-center justify-between p-8 bg-background-surface border-b border-border-subtle">
          <div className="flex items-center gap-4">
            <h2 className="text-4xl font-bold tracking-tight capitalize text-text-primary flex items-baseline gap-3">
              {monthName} <span className="text-text-muted font-bold tracking-tight">{year}</span>
            </h2>
            {isLoading && (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-consorci-lightBlue border-t-transparent"></div>
            )}
          </div>
          <div className="flex bg-background-subtle p-1.5 gap-1.5 border border-border-subtle">
            <button onClick={prevMonth} className="w-10 h-10 flex items-center justify-center hover:bg-background-surface transition-colors text-text-muted">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button onClick={() => setCurrentDate(new Date())} className="px-6 h-10 bg-background-surface border border-border-subtle text-[10px] font-bold uppercase tracking-widest text-text-primary">
              Avui
            </button>
            <button onClick={nextMonth} className="w-10 h-10 flex items-center justify-center hover:bg-background-surface transition-colors text-text-muted">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Weekdays */}
        <div className="grid grid-cols-7 border-b border-border-subtle bg-background-subtle">
          {['dl', 'dt', 'dc', 'dj', 'dv', 'ds', 'dg'].map(d => (
            <div key={d} className="py-4 text-center">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">{d}</span>
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="flex flex-col bg-background-surface">
          {calendarWeeks.map((week, weekIdx) => {
            const firstDayOfWeek = week[0].date;
            const lastDayOfWeek = week[6].date;

            const weekEvents: (CalendarEvent & { start: number; span: number; continuesBefore: boolean; continuesAfter: boolean; isPhase: boolean })[] = [];
            if (firstDayOfWeek && lastDayOfWeek) {
              events.forEach(event => {
                const eStart = event.date.split('T')[0];
                const eEnd = (event.endDate || event.date).split('T')[0];
                if (eStart <= lastDayOfWeek && eEnd >= firstDayOfWeek) {
                  const startIdx = week.findIndex(d => d.date >= eStart);
                  const actualStart = startIdx === -1 ? 0 : startIdx;
                  const endIdx = week.findIndex(d => d.date >= eEnd);
                  const actualEnd = endIdx === -1 ? 6 : endIdx;
                  weekEvents.push({
                    ...event,
                    start: actualStart,
                    span: actualEnd - actualStart + 1,
                    continuesBefore: eStart < firstDayOfWeek,
                    continuesAfter: eEnd > lastDayOfWeek,
                  });
                }
              });

              // Track assignment
              const tracks: (CalendarEvent & { start: number; span: number; continuesBefore: boolean; continuesAfter: boolean; isPhase: boolean })[][] = [];
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
                <div key={weekIdx} className="grid grid-cols-7 relative border-b border-border-subtle last:border-b-0 min-h-[140px]">
                  {week.map((dateObj, dayIdx) => (
                    <div
                      key={dayIdx}
                      onClick={() => setSelectedDate(new Date(dateObj.date))}
                      className={`relative p-3 border-r border-border-subtle last:border-r-0 cursor-pointer hover:bg-background-subtle/30 transition-colors ${!dateObj.isCurrentMonth ? 'bg-background-subtle/20 opacity-50' : ''
                        } ${dateObj.date === format(selectedDate, 'yyyy-MM-dd') ? 'bg-consorci-lightBlue/5' : ''}`}
                    >
                      <span className={`text-[12px] font-black tracking-tighter ${dateObj.date === format(new Date(), 'yyyy-MM-dd') ? 'text-consorci-lightBlue' : 'text-text-muted'
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
                            className={`absolute h-full pointer-events-auto flex items-center px-4 transition-colors hover:bg-opacity-90 active:opacity-80 group/event ${event.colorClass || getEventStyles(event.type)}`}
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
