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
  itemName = 'items'
}) => {
  const t = useTranslations('Common');
  if (totalPages <= 1) return null;

  return (
    <div className="bg-[#F8FAFC] border-t border-gray-100 p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
      <div className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
        {t('showing')} <span className="text-[#00426B]">{currentItemsCount}</span> {t('of')} <span className="text-[#00426B]">{totalItems}</span> {itemName}
      </div>
      <div className="flex items-center gap-2">
        <button 
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest border transition-all ${currentPage === 1 
            ? 'text-gray-200 border-gray-100 cursor-not-allowed' 
            : 'text-[#00426B] border-gray-200 hover:bg-[#EAEFF2]'}`}
        >
          {t('previous')}
        </button>
        <div className="px-4 py-2 bg-white border border-gray-200 text-[10px] font-bold text-[#00426B] tracking-[0.2em]">
          {t('page')} {currentPage} {t('of')} {totalPages}
        </div>
        <button 
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest border transition-all ${currentPage === totalPages 
            ? 'text-gray-200 border-gray-100 cursor-not-allowed' 
            : 'text-[#00426B] border-gray-200 hover:bg-[#EAEFF2]'}`}
        >
          {t('next')}
        </button>
      </div>
    </div>
  );
};

export default Pagination;
