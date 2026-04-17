'use client';

import React from 'react';

interface FilterPanelProps {
  children: React.ReactNode;
  onClear?: () => void;
  clearLabel?: string;
  gridCols?: number;
  variant?: 'default' | 'inline';
}

/**
 * @deprecated Use DataTableToolbar and FilterSelect for a more integrated, sharp-edged UI.
 */
export default function FilterPanel({
  children,
  onClear,
  clearLabel = 'Clear Filters',
  gridCols = 3,
  variant = 'default'
}: FilterPanelProps) {
  const gridClasses = {
    1: 'md:grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4'
  };

  return (
    <div className={`transition-all duration-300 ${
      variant === 'inline' ? 'p-0 border-b-0' : 'mb-6'
    }`}>
      <div className="flex flex-col xl:flex-row gap-4 items-end">
        <div className={`flex-1 w-full grid grid-cols-1 ${gridClasses[gridCols as keyof typeof gridClasses] || 'md:grid-cols-3'} gap-x-0 gap-y-0 border-t border-l border-border-subtle`}>
          {React.Children.map(children, (child) => (
            <div className="border-r border-b border-border-subtle p-3">
              {child}
            </div>
          ))}
        </div>
        
        {onClear && (
          <div className="flex w-full xl:w-auto mt-4 xl:mt-0">
            <button
              onClick={onClear}
              className="w-full xl:w-auto px-6 py-2 text-[10px] font-bold text-text-muted uppercase tracking-[0.1em] hover:text-consorci-darkBlue transition-all h-[42px] border border-border-subtle flex items-center justify-center gap-2 bg-transparent"
            >
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18M6 6v14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" />
              </svg>
              {clearLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
