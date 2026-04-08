'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import DashboardLayout from '@/components/DashboardLayout';
import { useEffect } from 'react';
import Loading from '@/components/Loading';

export default function AdminDashboardPage() {
  const t = useTranslations('Dashboards.admin');
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale || 'ca';

  useEffect(() => {
    if (!authLoading && (!user || user.role.name !== 'ADMIN')) {
      router.push(`/${locale}/login`);
    }
  }, [user, authLoading, router, locale]);

  if (authLoading || !user) {
    return (
      <Loading fullScreen message="Authenticating administrator..." />
    );
  }

  const sections = [
    {
      title: t('sections.workshops.title'),
      description: t('sections.workshops.description'),
      path: `/${locale}/workshops`,
      phase: 'General',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      color: 'blue'
    },
    {
      title: t('sections.centers.title'),
      description: t('sections.centers.description'),
      path: `/${locale}/centers`,
      phase: 'General',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      color: 'red'
    },
    {
      title: t('sections.phases.title'),
      description: t('sections.phases.description'),
      path: `/${locale}/phases`,
      phase: 'Configuration',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: 'purple'
    },
    {
      title: t('sections.stats.title'),
      description: t('sections.stats.description'),
      path: `/${locale}/stats`,
      phase: 'Global',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: 'green'
    },
    {
      title: t('sections.requests.title'),
      description: t('sections.requests.description'),
      path: `/${locale}/requests`,
      phase: 'Phase 1',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'orange'
    },
    {
      title: t('sections.verifications.title'),
      description: t('sections.verifications.description'),
      path: `/${locale}/verifications`,
      phase: 'Phase 2',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'pink'
    }
  ];

  return (
    <DashboardLayout
      title={t('title')}
      subtitle={t('subtitle')}
    >
      <div className="flex justify-center w-full pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full">
          {sections.map((section) => (
            <div
              key={section.path}
              onClick={() => router.push(section.path)}
              className="group bg-background-surface p-8 md:p-10 border border-border-subtle cursor-pointer transition-all duration-300 hover:border-consorci-actionBlue hover:shadow-xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-background-subtle -mr-8 -mt-8 rotate-45 group-hover:bg-consorci-actionBlue transition-colors duration-300"></div>

              <div className={`w-16 h-16 bg-background-subtle flex items-center justify-center mb-8 border border-border-subtle group-hover:bg-consorci-darkBlue group-hover:text-white transition-all duration-300`}>
                <div className={`text-consorci-darkBlue group-hover:text-white`}>
                  {section.icon}
                </div>
              </div>
              <h3 className="text-xl font-medium text-text-primary mb-3 uppercase tracking-tight">{section.title}</h3>
              <p className="text-xs text-text-muted font-medium leading-relaxed uppercase tracking-wider">{section.description}</p>

              <div className="mt-8 flex items-center">
                <div className="flex items-center text-consorci-actionBlue font-bold text-[10px] uppercase tracking-[0.2em] group-hover:translate-x-2 transition-transform">
                  {section.phase}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
