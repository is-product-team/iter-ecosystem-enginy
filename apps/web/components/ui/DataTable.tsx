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
    <div className="bg-background-surface border border-border-subtle overflow-hidden">
      <div className="premium-table-container">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-background-subtle/50 border-b border-border-subtle">
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`px-8 py-5 text-[11px] font-bold text-text-muted uppercase tracking-widest ${
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
              <tr>
                <td colSpan={columns.length} className="px-8 py-12">
                  <Loading size="md" />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-8 py-20 text-center"
                >
                  <p className="text-text-muted text-xs font-black uppercase tracking-widest">
                    {emptyMessage}
                  </p>
                </td>
              </tr>
            ) : (
              data.map((item, rowIndex) => {
                const customRowClass = typeof rowClassName === 'function' ? rowClassName(item) : rowClassName;
                return (
                  <tr
                    key={rowIndex}
                    onClick={() => onRowClick?.(item)}
                    className={`hover:bg-background-subtle/30 transition-colors group ${
                      onRowClick ? 'cursor-pointer' : ''
                    } ${customRowClass}`}
                  >
                    {columns.map((column, colIndex) => (
                      <td
                        key={colIndex}
                        className={`px-8 py-6 ${
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
