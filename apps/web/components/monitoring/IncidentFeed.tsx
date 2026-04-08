'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

interface Incident {
  id: string;
  title: string;
  description: string;
  type: string;
  createdAt: string;
  status: string;
  workshopName?: string;
}

interface IncidentFeedProps {
  incidents: Incident[];
}

export const IncidentFeed: React.FC<IncidentFeedProps> = ({ incidents }) => {
  const t = useTranslations('Center.Monitoring.Incidents');

  if (incidents.length === 0) {
    return (
      <div className="bg-background-surface border border-border-subtle p-12 text-center">
        <div className="w-16 h-16 bg-background-subtle flex items-center justify-center mx-auto mb-6 border border-border-subtle">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
           </svg>
        </div>
        <p className="text-[12px] font-medium text-text-muted uppercase tracking-widest">{t('no_incidents')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-[12px] font-medium text-text-muted uppercase tracking-widest mb-6 px-1">{t('title')}</h3>
      <div className="grid grid-cols-1 gap-4">
        {incidents.map((incident) => (
          <div key={incident.id} className="bg-background-surface border border-border-subtle p-6 hover:border-consorci-pinkRed transition-all duration-300 flex items-start gap-4 group">
            <div className="mt-1">
              <span className={`flex h-2 w-2 rounded-full ${incident.status === 'OPEN' ? 'bg-consorci-pinkRed' : 'bg-consorci-green'}`}></span>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-[13px] font-medium text-text-primary group-hover:text-consorci-pinkRed transition-colors">
                  {incident.title}
                </h4>
                <span className="text-[10px] font-medium text-text-muted">
                  {new Date(incident.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-[11px] text-text-secondary leading-relaxed mb-3 line-clamp-2">
                {incident.description}
              </p>
              {incident.workshopName && (
                <div className="inline-flex items-center px-2 py-1 bg-background-subtle border border-border-subtle text-[9px] font-medium text-text-muted uppercase tracking-wider">
                   {incident.workshopName}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
