'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

const Breadcrumbs: React.FC = () => {
  const pathname = usePathname();
  const t = useTranslations('Common');

  // No mostrar breadcrumbs en la raíz o en login
  if (pathname === '/' || pathname === '/login') return null;

  const pathSegments = pathname.split('/').filter(Boolean);
  // Remove locale segment from segments if present
  const localePrefixes = ['ca', 'es', 'en', 'ar'];
  const segments = pathSegments.filter(s => !localePrefixes.includes(s));

  // Mapping of segments to translation keys
  const segmentMap: Record<string, string> = {
    admin: 'home',
    center: 'home',
    student: 'home',
    workshops: 'workshops',
    centers: 'centers',
    requests: 'requests',
    phases: 'phases',
    calendar: 'calendar',
    profile: 'profile',
    students: 'students',
    teachers: 'teachers',
    assignments: 'assignments',
    sessions: 'sessions',
    notifications: 'notifications',
    dashboard: 'home'
  };

  return (
    <div className="mb-10 w-full">
      <nav className="flex items-center space-x-2 text-[12px] font-normal" aria-label="Breadcrumb">
        {segments.map((segment, index) => {
          const path = `/${pathSegments.slice(0, pathSegments.indexOf(segment) + 1).join('/')}`;
          const isLast = index === segments.length - 1;
          const labelKey = segmentMap[segment];
          const label = labelKey ? t(labelKey) : segment.charAt(0).toUpperCase() + segment.slice(1);

          return (
            <React.Fragment key={path}>
              ...
              {index > 0 && (
                <span className="text-text-muted mx-2">
                  <svg className="w-3 h-3 text-text-muted/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              )}
              {isLast ? (
                <span className="text-text-muted">
                  {label}
                </span>
              ) : (
                <Link
                  href={path}
                  className="text-consorci-darkBlue hover:text-consorci-actionBlue transition-colors"
                >
                  {label}
                </Link>
              )}
            </React.Fragment>
          );
        })}
      </nav>
      <div className="h-px bg-border-subtle w-full mt-4" />
    </div>
  );

};

export default Breadcrumbs;
