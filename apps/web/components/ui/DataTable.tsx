'use client';

import React from 'react';
import Loading from '@/components/Loading';
import Pagination from '@/components/Pagination';

export interface Column<T> {
  header: string;
  accessor?: keyof T;
  render?: (item: T) => React.ReactNode;
  headerClassName?: string;
  cellClassName?: string;
  align?: 'left' | 'center' | 'right';
  icon?: React.ReactNode;
  width?: number; // Initial width in px
}

interface DataTableProps<T> {
  tableId?: string; // Unique ID for localStorage persistence
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyMessage?: string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalItems: number;
    itemName?: string;
  };
  rowClassName?: string | ((item: T) => string);
  onRowClick?: (item: T) => void;
  variant?: 'default' | 'simple' | 'grid';
  showIndex?: boolean;
}

const TableSkeleton = ({ columns, rows = 5, showIndex = false, columnWidths = {} }: { columns: Column<any>[], rows?: number, showIndex?: boolean, columnWidths?: Record<string, number> }) => {
  return (
    <>
      {[...Array(rows)].map((_, rowIndex) => (
        <tr key={rowIndex} className="border-b border-border-subtle animate-pulse">
          {showIndex && (
            <td className="table-database-td w-10 text-center sticky left-0 z-20 bg-background-surface">
               <div className="h-3 bg-background-subtle rounded-sm w-4 mx-auto opacity-60"></div>
            </td>
          )}
          {columns.map((column, colIndex) => {
            const width = columnWidths[column.header] || column.width;
            return (
              <td 
                key={colIndex} 
                className="table-database-td"
                style={width ? { width: `${width}px`, minWidth: `${width}px`, maxWidth: `${width}px` } : {}}
              >
                <div className={`h-3 bg-background-subtle rounded-sm w-full opacity-60`}></div>
              </td>
            );
          })}
        </tr>
      ))}
    </>
  );
};

export default function DataTable<T>({
  tableId,
  data,
  columns,
  loading,
  emptyMessage = 'No results found',
  pagination,
  rowClassName = '',
  onRowClick,
  variant = 'default',
  showIndex = true
}: DataTableProps<T>) {
  const [columnWidths, setColumnWidths] = React.useState<Record<string, number>>({});
  const [resizing, setResizing] = React.useState<string | null>(null);

  // Initialize widths from localStorage
  React.useEffect(() => {
    if (tableId) {
      const saved = localStorage.getItem(`dt_widths_${tableId}`);
      if (saved) {
        try {
          setColumnWidths(JSON.parse(saved));
        } catch (e) {
          console.error('Error loading table widths', e);
        }
      }
    }
  }, [tableId]);

  const startResize = (e: React.MouseEvent, header: string) => {
    e.preventDefault();
    setResizing(header);
    
    const startX = e.pageX;
    const startWidth = columnWidths[header] || columns.find(c => c.header === header)?.width || 150;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = Math.max(50, startWidth + (moveEvent.pageX - startX));
      setColumnWidths(prev => ({ ...prev, [header]: newWidth }));
    };

    const onMouseUp = () => {
      setResizing(null);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      
      // Save to localStorage
      if (tableId) {
        setColumnWidths(current => {
          localStorage.setItem(`dt_widths_${tableId}`, JSON.stringify(current));
          return current;
        });
      }
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };

  return (
    <div className={`bg-background-surface border border-border-subtle transition-all duration-300 table-database`}>
      <div className="premium-table-container">
        <table className="w-full text-left border-collapse border-spacing-0">
          <thead className="sticky top-0 z-30 bg-background-surface">
            <tr>
              {showIndex && (
                <th className="table-database-th w-10 text-center sticky left-0 z-40 bg-background-surface shadow-[1px_0_0_0_#e5e7eb]">
                  #
                </th>
              )}
              {columns.map((column, index) => {
                const width = columnWidths[column.header] || column.width;
                return (
                  <th
                    key={index}
                    className={`table-database-th relative group/th ${
                      alignClasses[column.align || 'center']
                    } ${column.headerClassName || ''}`}
                    style={width ? { width: `${width}px`, minWidth: `${width}px`, maxWidth: `${width}px` } : {}}
                  >
                    <div className={`flex items-center gap-2 ${(!column.align || column.align === 'center') ? 'justify-center' : column.align === 'right' ? 'justify-end' : ''}`}>
                      {column.icon && <span className="opacity-70">{column.icon}</span>}
                      {column.header}
                    </div>
                    {/* Resize Handle */}
                    <div 
                      onMouseDown={(e) => startResize(e, column.header)}
                      className={`absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-consorci-lightBlue transition-colors z-10 ${resizing === column.header ? 'bg-consorci-lightBlue' : 'bg-transparent'}`}
                    />
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="bg-background-surface">
            {loading ? (
              <TableSkeleton columns={columns} showIndex={showIndex} columnWidths={columnWidths} />
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (showIndex ? 1 : 0)}
                  className="px-8 py-32 text-center"
                >
                  <div className="flex flex-col items-center justify-center opacity-40">
                    <svg className="w-12 h-12 mb-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                    </svg>
                    <p className="text-text-muted text-[10px] font-bold uppercase tracking-[0.2em]">
                      {emptyMessage}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item, rowIndex) => {
                const customRowClass = typeof rowClassName === 'function' ? rowClassName(item) : rowClassName;
                return (
                  <tr
                    key={rowIndex}
                    onClick={() => onRowClick?.(item)}
                    className={`table-database-row group ${
                      onRowClick ? 'cursor-pointer' : ''
                    } ${customRowClass}`}
                  >
                    {showIndex && (
                      <td className="table-database-td text-center text-text-muted font-medium sticky left-0 z-20 bg-background-surface shadow-[1px_0_0_0_#e5e7eb]">
                        {rowIndex + 1}
                      </td>
                    )}
                    {columns.map((column, colIndex) => {
                      const width = columnWidths[column.header] || column.width;
                      return (
                        <td
                          key={colIndex}
                          className={`table-database-td ${
                            alignClasses[column.align || 'center']
                          } ${column.cellClassName || ''}`}
                          style={width ? { width: `${width}px`, minWidth: `${width}px`, maxWidth: `${width}px` } : {}}
                        >
                          {column.render
                            ? column.render(item)
                            : column.accessor
                            ? (item[column.accessor] as React.ReactNode)
                            : null}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {pagination && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={pagination.onPageChange}
          totalItems={pagination.totalItems}
          currentItemsCount={data.length}
          itemName={pagination.itemName}
          variant="database"
        />
      )}
    </div>
  );
}
