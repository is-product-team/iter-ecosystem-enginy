'use client';

import React, { useState, useEffect } from 'react';
import { CalendarEvent } from './ui/Calendar';
import getApi from '@/services/api';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { format } from 'date-fns';
import { enUS, ca, es, arSA } from 'date-fns/locale';

const dateLocales: Record<string, any> = {
  en: enUS,
  ca: ca,
  es: es,
  ar: arSA,
};

const NextEventsWidget: React.FC = () => {
  const t = useTranslations('Widgets.NextEvents');
  const locale = useLocale();
  const dateLocale = dateLocales[locale] || enUS;
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
        const upcoming = (response.data || [])
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
    <div className="animate-pulse flex space-x-4 p-4 bg-background-surface border border-border-subtle h-40">
      <div className="flex-1 space-y-4 py-1">
        <div className="h-4 bg-background-subtle w-3/4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-background-subtle"></div>
          <div className="h-4 bg-background-subtle w-5/6"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-background-surface border border-border-subtle p-6 flex flex-col h-full relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
        <svg className="h-20 w-20" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>

      <h3 className="text-xs font-medium text-text-muted mb-6 flex items-center justify-between">
        {t('title')}
        <button
          onClick={() => router.push('/calendar')}
          className="text-consorci-darkBlue hover:text-consorci-lightBlue font-medium tracking-normal flex items-center gap-1"
        >
          {t('view_all')} <span className="text-[10px]">→</span>
        </button>
      </h3>

      {events.length > 0 ? (
        <div className="space-y-4 flex-1">
          {events.map((event) => (
            <div key={event.id} className="flex items-center gap-4 group/item cursor-default">
              <div className="flex flex-col items-center justify-center w-12 h-12 bg-background-subtle border border-border-subtle group-hover/item:border-consorci-darkBlue transition-colors">
                <span className="text-[10px] font-medium text-text-muted group-hover/item:text-consorci-darkBlue leading-none mb-1 capitalize">
                  {format(new Date(event.date), 'MMM', { locale: dateLocale }).replace('.', '')}
                </span>
                <span className="text-sm font-semibold text-text-primary group-hover/item:text-consorci-darkBlue leading-none">
                  {new Date(event.date).getDate()}
                </span>
              </div>
              <div className="flex-1 overflow-hidden">
                <h4 className="text-sm font-medium text-text-primary truncate transition-colors">{event.title}</h4>
                <p className="text-[10px] font-medium text-text-muted">
                  {event.type === 'milestone' ? t('program_milestone') : event.type === 'deadline' ? t('deadline') : t('workshop')}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <p className="text-text-muted text-xs font-medium">{t('no_events')}</p>
        </div>
      )}
    </div>
  );
};

export default NextEventsWidget;
