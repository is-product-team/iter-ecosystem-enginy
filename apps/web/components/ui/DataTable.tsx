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
}

interface DataTableProps<T> {
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

const TableSkeleton = ({ columns, rows = 5, showIndex = false }: { columns: Column<any>[], rows?: number, showIndex?: boolean }) => {
  return (
    <>
      {[...Array(rows)].map((_, rowIndex) => (
        <tr key={rowIndex} className="border-b border-border-subtle animate-pulse">
          {showIndex && (
            <td className="px-4 py-3 border-r border-border-subtle w-12">
               <div className="h-4 bg-background-subtle rounded-sm w-4 mx-auto opacity-60"></div>
            </td>
          )}
          {columns.map((column, colIndex) => (
            <td key={colIndex} className={`px-4 py-3 border-r border-border-subtle last:border-r-0`}>
              <div className={`h-4 bg-background-subtle rounded-sm w-full opacity-60`}></div>
            </td>
          ))}
        </tr>
      ))}
    </>
  );
};

export default function DataTable<T>({
  data,
  columns,
  loading,
  emptyMessage = 'No results found',
  pagination,
  rowClassName = '',
  onRowClick,
  variant = 'default',
  showIndex = false
}: DataTableProps<T>) {
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };

  return (
    <div className={`bg-background-surface border border-border-subtle ${variant === 'simple' ? '' : 'border-t-2 border-t-consorci-darkBlue'} overflow-hidden transition-all duration-300`}>
      <div className="premium-table-container">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 z-10 bg-background-subtle border-b border-border-subtle">
            <tr>
              {showIndex && (
                <th className="px-4 py-2.5 text-[10px] font-bold text-text-muted uppercase tracking-[0.15em] border-r border-border-subtle w-12 text-center bg-background-subtle">
                  #
                </th>
              )}
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`px-4 py-2.5 text-[10px] font-bold text-text-muted uppercase tracking-[0.15em] border-r border-border-subtle last:border-r-0 bg-background-subtle ${
                    alignClasses[column.align || 'center']
                  } ${column.headerClassName || ''}`}
                >
                  <div className={`flex items-center gap-2 ${(!column.align || column.align === 'center') ? 'justify-center' : column.align === 'right' ? 'justify-end' : ''}`}>
                    {column.icon && <span className="opacity-70">{column.icon}</span>}
                    {column.header}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {loading ? (
              <TableSkeleton columns={columns} showIndex={showIndex} />
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
                    className={`border-l-2 border-l-transparent hover:border-l-consorci-darkBlue hover:bg-background-subtle/30 even:bg-background-subtle/5 transition-all duration-300 group ${
                      onRowClick ? 'cursor-pointer' : ''
                    } ${customRowClass}`}
                  >
                    {showIndex && (
                      <td className="px-4 py-3 text-[12px] font-medium text-text-muted border-r border-border-subtle text-center">
                        {rowIndex + 1}
                      </td>
                    )}
                    {columns.map((column, colIndex) => (
                      <td
                        key={colIndex}
                        className={`px-4 py-3 text-[13px] font-medium text-text-primary border-r border-border-subtle last:border-r-0 ${
                          alignClasses[column.align || 'center']
                        } ${column.cellClassName || ''}`}
                      >
                        {column.render
                          ? column.render(item)
                          : column.accessor
                          ? (item[column.accessor] as React.ReactNode)
                          : null}
                      </td>
                    ))}
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
        />
      )}
    </div>
  );
}
