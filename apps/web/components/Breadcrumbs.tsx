'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { THEME } from '@iter/shared';

const Breadcrumbs: React.FC = () => {
  const pathname = usePathname();
  
  // No mostrar breadcrumbs en la raíz o en login
  if (pathname === '/' || pathname === '/login') return null;

  const pathSegments = pathname.split('/').filter(Boolean);
  
  // Mapping of segments to readable names
  const segmentMap: Record<string, string> = {
    admin: 'Home',
    center: 'Home',
    workshops: 'Workshops',
    centers: 'Centers',
    requests: 'Requests',
    phases: 'Phases',
    calendar: 'Calendar',
    perfil: 'Profile',
    students: 'Students',
    teachers: 'Teachers',
    assignments: 'Assignments',
    sessions: 'Sessions',
    notifications: 'Notifications'
  };

  return (
    <div className="mb-10 w-full">
      <nav className="flex items-center space-x-2 text-[11px] font-bold uppercase tracking-widest" aria-label="Breadcrumb">
        {pathSegments.map((segment, index) => {
          const path = `/${pathSegments.slice(0, index + 1).join('/')}`;
          const isLast = index === pathSegments.length - 1;
          const label = segmentMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);

          return (
            <React.Fragment key={path}>
              {index > 0 && (
                <span className="text-text-muted mx-2">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M9 5l7 7-7 7" />
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
