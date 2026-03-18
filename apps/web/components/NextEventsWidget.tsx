'use client';

import React, { useState, useEffect } from 'react';
import { CalendarEvent } from './ui/Calendar';
import getApi from '@/services/api';
import { useRouter } from 'next/navigation';

const NextEventsWidget: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const api = getApi();
        const response = await api.get('/calendar');
        // Filter upcoming events and sort by date
        const now = new Date();
        const upcoming = response.data
          .filter((e: CalendarEvent) => new Date(e.date) >= now)
          .sort((a: CalendarEvent, b: CalendarEvent) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(0, 3);
        setEvents(upcoming);
      } catch (error) {
        console.error('Error fetching widget events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) return (
    <div className="animate-pulse flex space-x-4 p-4 bg-white border border-gray-100 h-40">
      <div className="flex-1 space-y-4 py-1">
        <div className="h-4 bg-gray-200 w-3/4 rounded-full"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded-full"></div>
          <div className="h-4 bg-gray-200 w-5/6 rounded-full"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white border border-gray-300 p-6 flex flex-col h-full relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
        <svg className="h-20 w-20" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>

      <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6 flex items-center justify-between">
        Properes Fites
        <button
          onClick={() => router.push('/calendar')}
          className="text-consorci-darkBlue hover:text-consorci-lightBlue lowercase font-bold tracking-normal"
        >
          veure tots →
        </button>
      </h3>

      {events.length > 0 ? (
        <div className="space-y-4 flex-1">
          {events.map((event) => (
            <div key={event.id} className="flex items-center gap-4 group/item cursor-default">
              <div className="flex flex-col items-center justify-center w-12 h-12 bg-gray-50 border border-gray-100 group-hover/item:border-consorci-lightBlue group-hover/item:bg-blue-50 transition-colors">
                <span className="text-[10px] font-bold uppercase text-gray-400 group-hover/item:text-consorci-lightBlue leading-none mb-1">
                  {new Date(event.date).toLocaleDateString('ca-ES', { month: 'short' }).replace('.', '')}
                </span>
                <span className="text-sm font-bold text-gray-900 group-hover/item:text-consorci-darkBlue leading-none">
                  {new Date(event.date).getDate()}
                </span>
              </div>
              <div className="flex-1 overflow-hidden">
                <h4 className="text-sm font-bold text-gray-800 truncate group-hover/item:text-consorci-darkBlue transition-colors">{event.title}</h4>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                  {event.type === 'milestone' ? 'Hito Programa' : event.type === 'deadline' ? 'Termini' : 'Taller'}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">No hi ha esdeveniments propers</p>
        </div>
      )}
    </div>
  );
};

export default NextEventsWidget;
