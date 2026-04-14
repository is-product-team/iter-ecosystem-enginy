import React from 'react';
import { useTranslations } from 'next-intl';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  currentItemsCount: number;
  itemName?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  currentItemsCount,
  itemName
}) => {
  const t = useTranslations('Common');
  const itemsLabel = itemName || t('items');
  if (totalPages <= 1) return null;

  return (
    <div className="bg-background-subtle/50 border-t border-border-subtle p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
      <div className="text-[10px] font-black uppercase text-text-muted tracking-widest">
        {t('showing')} <span className="text-consorci-darkBlue dark:text-consorci-lightBlue">{currentItemsCount}</span> {t('of')} <span className="text-consorci-darkBlue dark:text-consorci-lightBlue">{totalItems}</span> {itemName}
        {t('showing')} <span className="text-consorci-darkBlue dark:text-consorci-lightBlue">{currentItemsCount}</span> {t('of')} <span className="text-consorci-darkBlue dark:text-consorci-lightBlue">{totalItems}</span> {itemName}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={`px-4 py-2 text-[12px] font-medium border border-border-subtle transition-all outline-none ${currentPage === 1
            ? 'opacity-30 cursor-not-allowed'
            : 'text-text-primary bg-background-surface hover:bg-background-subtle active:scale-[0.98]'}`}
        >
          {t('previous')}
        </button>
        <div className="px-4 py-2 bg-background-surface border border-border-subtle text-[10px] font-bold text-consorci-darkBlue dark:text-consorci-lightBlue tracking-[0.2em]">
          {t('page')} {currentPage} {t('of')} {totalPages}
          {t('page')} {currentPage} {t('of')} {totalPages}
        </div>
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 text-[12px] font-medium border border-border-subtle transition-all outline-none ${currentPage === totalPages
            ? 'opacity-30 cursor-not-allowed'
            : 'text-text-primary bg-background-surface hover:bg-background-subtle active:scale-[0.98]'}`}
        >
          {t('next')}
        </button>
      </div>
    </div>
  );
};

export default Pagination;
