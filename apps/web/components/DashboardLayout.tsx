'use client';

import React from 'react';
import Navbar from './Navbar';
import Breadcrumbs from './Breadcrumbs';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  title,
  subtitle,
  actions
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-background-page">
      <Navbar />

      <main className="flex-1 max-w-[1440px] mx-auto w-full py-8 md:py-16 flex flex-col items-start">

        {(title || actions) && (
          <header className="w-full mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 py-2 container-responsive">
            <div className="">
              {title && (
                <h2 className="text-3xl font-bold text-text-primary tracking-tight uppercase">
                  {title}
                </h2>
              )}
              {subtitle && <div className="mt-2 text-consorci-lightBlue text-[11px] font-bold uppercase tracking-[0.1em]">{subtitle}</div>}
            </div>

            {actions && (
              <div className="flex items-center gap-3">
                {actions}
              </div>
            )}
          </header>
        )}

        <div className="w-full container-responsive">
          {children}
        </div>
      </main>

    </div>
  );
};


export default DashboardLayout;
