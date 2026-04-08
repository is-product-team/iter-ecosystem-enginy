'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

const Breadcrumbs: React.FC = () => {
  const pathname = usePathname();
  const t = useTranslations('Navigation');
  
  // No mostrar breadcrumbs en la raíz o en login
  if (pathname === '/' || pathname === '/login') return null;

  const pathSegments = pathname.split('/').filter(Boolean);
  const locale = pathSegments[0];
  const isLocaleInPath = ['ca', 'es'].includes(locale);
  
  // Filter out locale from display segments but keep it for path generation
  const displaySegments = isLocaleInPath ? pathSegments.slice(1) : pathSegments;

  // Mapping of segments to translation keys
  const getLabel = (segment: string) => {
    // Treat 'admin' or 'center' as 'home' in the breadcrumb context
    if (segment === 'admin' || segment === 'center') return t('home');
    
    // Attempt to translate the segment name
    try {
      return t(segment);
    } catch {
      // Fallback to capitalized segment name if translation key is missing
      return segment.charAt(0).toUpperCase() + segment.slice(1);
    }
  };

  return (
    <div className="mb-10 w-full">
      <nav className="flex items-center space-x-2 text-[11px] font-bold uppercase tracking-widest" aria-label="Breadcrumb">
        {displaySegments.map((segment, index) => {
          // Construct path including the locale
          const path = isLocaleInPath 
            ? `/${locale}/${displaySegments.slice(0, index + 1).join('/')}`
            : `/${displaySegments.slice(0, index + 1).join('/')}`;
            
          const isLast = index === displaySegments.length - 1;
          const label = getLabel(segment);

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
