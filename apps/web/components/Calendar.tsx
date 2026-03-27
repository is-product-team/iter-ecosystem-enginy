'use client';

import React, { useState, useMemo } from 'react';


export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  endDate?: string;
  type: 'milestone' | 'deadline' | 'assignment' | 'session';
  description?: string;
  metadata?: Record<string, string>;
}

interface CalendarProps {
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
}

const Calendar: React.FC<CalendarProps> = ({ events, onEventClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const monthName = currentDate.toLocaleString('en-US', { month: 'long' });
  const year = currentDate.getFullYear();

  const daysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const firstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(year, currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, currentDate.getMonth() + 1, 1));

  const calendarDays = useMemo(() => {
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

    // Padding for next month
    while (days.length % 7 !== 0) {
      days.push({ day: null, date: null });
    }

    return days;
  }, [currentDate, year]);

  const getEventsForDay = (dateStr: string) => {
    return events.filter(event => {
      const eStart = event.date.split('T')[0];
      const eEnd = (event.endDate || event.date).split('T')[0];
      return dateStr >= eStart && dateStr <= eEnd;
    });
  };

  const selectedDayEvents = getEventsForDay(selectedDate);

  const getEventColor = (type: string) => {
    switch (type) {
      case 'milestone': return '#6366F1'; // Indigo
      case 'deadline': return '#EF4444'; // Red
      case 'assignment': return '#3B82F6'; // Blue
      case 'session': return '#10B981'; // Green
      default: return '#9CA3AF'; // Gray
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Calendar Grid */}
      <div className="flex-1 bg-white border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-[#00426B] uppercase tracking-tight">
              {monthName} <span className="text-[#4197CB]">{year}</span>
            </h2>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={prevMonth}
              className="p-2 hover:bg-gray-100 border border-gray-200 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#00426B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button 
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 border border-gray-200 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#00426B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 border-t border-l border-gray-100">
          {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(d => (
            <div key={d} className="py-3 bg-gray-50 border-r border-b border-gray-100 text-center">
              <span className="text-[10px] font-black text-gray-400 tracking-widest">{d}</span>
            </div>
          ))}
          
          {calendarDays.map((dateObj, idx) => {
            const isSelected = dateObj.date === selectedDate;
            const isToday = dateObj.date === new Date().toISOString().split('T')[0];
            const dayEvents = dateObj.date ? getEventsForDay(dateObj.date) : [];

            return (
              <div 
                key={idx}
                onClick={() => dateObj.date && setSelectedDate(dateObj.date)}
                className={`min-h-[100px] p-2 border-r border-b border-gray-100 transition-all cursor-pointer hover:bg-blue-50/30 ${
                  isSelected ? 'bg-blue-50/50' : ''
                } ${!dateObj.date ? 'bg-gray-25/50' : ''}`}
              >
                {dateObj.day && (
                  <div className="flex flex-col h-full">
                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                        isToday ? 'bg-[#00426B] text-white' : isSelected ? 'text-[#00426B] font-black' : 'text-gray-400'
                      }`}>
                        {dateObj.day}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 overflow-hidden">
                      {dayEvents.map((e, ei) => (
                        <div 
                          key={ei}
                          className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm truncate text-white uppercase tracking-tighter"
                          style={{ backgroundColor: getEventColor(e.type) }}
                          title={e.title}
                        >
                          {e.title}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Agenda Detail */}
      <div className="lg:w-96 flex flex-col gap-6">
        <div className="bg-white border border-gray-200 p-8 shadow-sm h-full">
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-6">
            Events for {new Date(selectedDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
          </h3>
          
          <div className="flex flex-col gap-4">
            {selectedDayEvents.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-gray-300 text-xs font-medium italic">No scheduled activity</p>
              </div>
            ) : (
              selectedDayEvents.map(event => (
                <div 
                  key={event.id}
                  onClick={() => onEventClick && onEventClick(event)}
                  className="group p-4 border border-gray-100 hover:border-[#0775AB] hover:shadow-md transition-all cursor-pointer bg-gray-50/50"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-1.5 h-6" style={{ backgroundColor: getEventColor(event.type) }}></div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{event.type}</span>
                  </div>
                  <h4 className="text-sm font-black text-[#00426B] uppercase tracking-tight group-hover:text-[#0775AB] transition-colors">
                    {event.title}
                  </h4>
                  {event.description && (
                    <p className="text-[10px] text-gray-500 mt-2 font-medium line-clamp-2">
                      {event.description}
                    </p>
                  )}
                  {event.metadata?.time && (
                    <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-[#4197CB]">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {event.metadata.time}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
