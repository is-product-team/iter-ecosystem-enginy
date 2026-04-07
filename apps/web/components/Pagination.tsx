import React from 'react';

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
  if (totalPages <= 1) return null;

  return (
    <div className="bg-background-subtle border-t border-border-subtle p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
      <div className="text-[12px] font-medium text-text-muted">
        Showing <span className="text-text-primary">{currentItemsCount}</span> of <span className="text-text-primary">{totalItems}</span> {itemName}
      </div>
      <div className="flex items-center gap-2">
        <button 
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={`px-4 py-2 text-[12px] font-medium border border-border-subtle transition-all outline-none ${currentPage === 1 
            ? 'opacity-30 cursor-not-allowed' 
            : 'text-text-primary bg-background-surface hover:bg-background-subtle active:scale-[0.98]'}`}
        >
          Previous
        </button>
        <div className="px-4 py-2 bg-background-surface border border-border-subtle text-[12px] font-medium text-text-primary">
          Page {currentPage} of {totalPages}
        </div>
        <button 
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 text-[12px] font-medium border border-border-subtle transition-all outline-none ${currentPage === totalPages 
            ? 'opacity-30 cursor-not-allowed' 
            : 'text-text-primary bg-background-surface hover:bg-background-subtle active:scale-[0.98]'}`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
