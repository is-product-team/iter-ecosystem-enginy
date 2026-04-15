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
}

const TableSkeleton = ({ columns, rows = 5 }: { columns: Column<any>[], rows?: number }) => {
  return (
    <>
      {[...Array(rows)].map((_, rowIndex) => (
        <tr key={rowIndex} className="border-b border-border-subtle last:border-0 animate-pulse">
          {columns.map((column, colIndex) => (
            <td key={colIndex} className="px-8 py-6">
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
  onRowClick
}: DataTableProps<T>) {
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };

  return (
    <div className="bg-background-surface border border-border-subtle border-t-2 border-t-consorci-darkBlue overflow-hidden transition-all duration-300">
      <div className="premium-table-container">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-background-subtle/50 border-b border-border-subtle">
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`px-8 py-5 text-[10px] font-bold text-text-muted uppercase tracking-[0.15em] ${
                    alignClasses[column.align || 'left']
                  } ${column.headerClassName || ''}`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {loading ? (
              <TableSkeleton columns={columns} />
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
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
                    className={`border-l-2 border-l-transparent hover:border-l-consorci-darkBlue hover:bg-background-subtle/30 even:bg-background-subtle/10 transition-all duration-300 group ${
                      onRowClick ? 'cursor-pointer' : ''
                    } ${customRowClass}`}
                  >
                    {columns.map((column, colIndex) => (
                      <td
                        key={colIndex}
                        className={`px-8 py-6 text-[13px] font-medium text-text-primary ${
                          alignClasses[column.align || 'left']
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
