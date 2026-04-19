import React from 'react';
import { useTranslations } from 'next-intl';
import Button from './ui/Button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  currentItemsCount: number;
  itemName?: string;
  variant?: 'default' | 'database';
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  currentItemsCount,
  itemName,
  variant = 'default'
}) => {
  const t = useTranslations('Common');
  if (totalPages <= 1 && variant !== 'database') return null;

  if (variant === 'database') {
    return (
      <div className="border-t border-border-subtle h-10 px-4 flex items-center justify-between gap-4 bg-transparent text-[11px] font-medium text-text-muted">
        <div className="flex items-center gap-1">
          {t('showing')} <span className="text-text-primary px-1">{((currentPage - 1) * 10) + 1}-{Math.min(currentPage * 10, totalItems)}</span> 
          {t('of')} <span className="text-text-primary px-1">{totalItems}</span> 
          {itemName || t('items')}
        </div>
        <div className="flex items-center gap-4">
          <Button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            variant="subtle"
            size="sm"
            className="!p-1 h-auto border-none"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-text-primary font-bold">{currentPage}</span>
            <span className="opacity-40">/</span>
            <span>{totalPages}</span>
          </div>
          <Button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            variant="subtle"
            size="sm"
            className="!p-1 h-auto border-none"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background-subtle/50 border-t border-border-subtle p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
      <div className="text-[10px] font-black uppercase text-text-muted tracking-widest">
        {t('showing')} <span className="text-consorci-darkBlue dark:text-consorci-lightBlue">{currentItemsCount}</span> {t('of')} <span className="text-consorci-darkBlue dark:text-consorci-lightBlue">{totalItems}</span> {itemName}
      </div>
      <div className="flex items-center gap-2">
        <Button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          variant="outline"
          size="sm"
          className="bg-background-surface hover:!bg-background-subtle"
        >
          {t('previous')}
        </Button>
        <div className="px-4 py-2 bg-background-surface border border-border-subtle text-[10px] font-bold text-consorci-darkBlue dark:text-consorci-lightBlue tracking-[0.2em] h-[34px] flex items-center">
          {t('page')} {currentPage} {t('of')} {totalPages}
        </div>
        <Button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          variant="outline"
          size="sm"
          className="bg-background-surface hover:!bg-background-subtle"
        >
          {t('next')}
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
