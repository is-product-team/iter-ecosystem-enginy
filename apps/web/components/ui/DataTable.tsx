'use client';

import React from 'react';
import Loading from '@/components/Loading';
import Pagination from '@/components/Pagination';
import { ChevronUp, ChevronDown, ChevronRight, Hash } from 'lucide-react';

export interface Column<T> {
  header: string;
  accessor?: keyof T;
  render?: (item: T) => React.ReactNode;
  headerClassName?: string;
  cellClassName?: string;
  align?: 'left' | 'center' | 'right';
  icon?: React.ReactNode;
  width?: number; // Initial width in px
  sortable?: boolean;
  groupableKey?: string; // Key to use when grouping by this column
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
  getRowId?: (item: T) => string | number;
  hideTopBorder?: boolean;
  groupByOptions?: { label: string, value: string }[];
  initialSort?: { key: string, direction: 'asc' | 'desc' };
  groupBy?: string | null;
  onGroupByChange?: (key: string | null) => void;
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
  showIndex = true,
  getRowId,
  hideTopBorder = false,
  groupByOptions = [],
  initialSort,
  groupBy: externalGroupBy,
  onGroupByChange
}: DataTableProps<T>) {
  const [columnWidths, setColumnWidths] = React.useState<Record<string, number>>({});
  const [resizing, setResizing] = React.useState<string | null>(null);

  // Advanced Grid State
  const [sortConfig, setSortConfig] = React.useState<{ key: string | null, direction: 'asc' | 'desc' | null }>({
    key: initialSort?.key || null,
    direction: initialSort?.direction || null
  });
  const [internalGroupBy, setInternalGroupBy] = React.useState<string | null>(null);
  const [collapsedGroups, setCollapsedGroups] = React.useState<Set<string>>(new Set());

  const groupBy = externalGroupBy !== undefined ? externalGroupBy : internalGroupBy;
  const setGroupBy = onGroupByChange || setInternalGroupBy;

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
    right: 'text-right'
  };

  const handleSort = (key: string) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const toggleGroup = (group: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  };

  const sortedData = React.useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) return data;

    const column = columns.find(c => c.header === sortConfig.key || c.accessor === sortConfig.key);
    if (!column) return data;

    return [...data].sort((a, b) => {
      let aVal: any = column.accessor ? a[column.accessor] : null;
      let bVal: any = column.accessor ? b[column.accessor] : null;

      // Handle nulls
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      // Type-specific comparison
      if (typeof aVal === 'string') {
        return sortConfig.direction === 'asc' 
          ? aVal.localeCompare(bVal) 
          : bVal.localeCompare(aVal);
      }
      
      return sortConfig.direction === 'asc' 
        ? (aVal > bVal ? 1 : -1) 
        : (bVal > aVal ? 1 : -1);
    });
  }, [data, sortConfig, columns]);

  const groupedData = React.useMemo(() => {
    if (!groupBy) return null;

    const groups: Record<string, T[]> = {};
    sortedData.forEach(item => {
      const val = (item as any)[groupBy];
      const key = val === null || val === undefined ? 'Sense valor' : String(val);
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    return groups;
  }, [sortedData, groupBy]);

  return (
    <div className={`bg-background-surface transition-all duration-300 table-database border-l border-r border-b border-border-subtle ${hideTopBorder ? '' : 'border-t'}`}>
      <div className={`premium-table-container`}>
        <table className="w-full text-left border-separate border-spacing-0">
          <thead className="sticky top-0 z-30 bg-background-surface">
            <tr>
              {showIndex && (
                <th className="table-database-th w-10 text-center sticky left-0 z-40 bg-background-surface border-r border-border-subtle">
                  #
                </th>
              )}
              {columns.map((column, index) => {
                const width = columnWidths[column.header] || column.width;
                return (
                  <th
                    key={index}
                    onClick={() => (column.sortable !== false && column.accessor) ? handleSort(column.accessor as string) : null}
                    className={`table-database-th relative group/th select-none ${
                      (column.sortable !== false && column.accessor) ? 'cursor-pointer hover:bg-background-subtle hover:text-consorci-darkBlue' : ''
                    } ${
                      alignClasses[column.align || 'center']
                    } ${column.headerClassName || ''}`}
                    style={width ? { width: `${width}px`, minWidth: `${width}px`, maxWidth: `${width}px` } : {}}
                  >
                    <div className={`flex items-center gap-2 ${(!column.align || column.align === 'center') ? 'justify-center' : column.align === 'right' ? 'justify-end' : ''}`}>
                      {column.icon && <span className="opacity-70">{column.icon}</span>}
                      {column.header}
                      <span className="w-4 h-4 flex items-center justify-center">
                        {(sortConfig.key === column.accessor || sortConfig.key === column.header) ? (
                          sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                        ) : (
                          (column.sortable !== false && column.accessor) && <ChevronUp className="w-3 h-3 opacity-0 group-hover/th:opacity-30 transition-opacity" />
                        )}
                      </span>
                    </div>
                    {/* Resize Handle */}
                    <div 
                      onMouseDown={(e) => { e.stopPropagation(); startResize(e, column.header); }}
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
            ) : groupedData ? (
              Object.entries(groupedData).map(([groupName, groupItems]) => {
                const isCollapsed = collapsedGroups.has(groupName);
                return (
                  <React.Fragment key={groupName}>
                    {/* Group Header Row */}
                    <tr 
                      className="cursor-pointer bg-background-subtle/40 hover:bg-background-subtle select-none sticky z-10" 
                      onClick={() => toggleGroup(groupName)}
                    >
                      <td colSpan={columns.length + (showIndex ? 1 : 0)} className="px-4 py-2 border-b border-border-subtle">
                        <div className="flex items-center gap-3">
                          <div className={`transition-transform duration-200 ${isCollapsed ? '' : 'rotate-90'}`}>
                            <ChevronRight className="w-4 h-4 text-text-muted" />
                          </div>
                          <span className="text-[11px] font-black uppercase tracking-widest text-consorci-darkBlue">{groupName}</span>
                          <span className="text-[10px] font-bold text-text-muted bg-background-surface px-1.5 py-0.5 border border-border-subtle">{groupItems.length} registros</span>
                        </div>
                      </td>
                    </tr>
                    {/* Group Rows */}
                    {!isCollapsed && groupItems.map((item, groupIdx) => {
                      const customRowClass = typeof rowClassName === 'function' ? rowClassName(item) : rowClassName;
                      return (
                        <tr
                          key={groupIdx}
                          onClick={() => onRowClick?.(item)}
                          className={`table-database-row group ${onRowClick ? 'cursor-pointer' : ''} ${customRowClass}`}
                        >
                          {showIndex && (
                            <td className="table-database-td text-center text-text-muted font-medium sticky left-0 z-10 bg-background-surface border-r border-border-subtle">
                              {getRowId ? getRowId(item) : groupIdx + 1}
                            </td>
                          )}
                          {columns.map((column, colIndex) => {
                            const width = columnWidths[column.header] || column.width;
                            return (
                              <td
                                key={colIndex}
                                className={`table-database-td ${alignClasses[column.align || 'center']} ${column.cellClassName || ''}`}
                                style={width ? { width: `${width}px`, minWidth: `${width}px`, maxWidth: `${width}px` } : {}}
                              >
                                {column.render ? column.render(item) : column.accessor ? (item[column.accessor] as React.ReactNode) : null}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </React.Fragment>
                );
              })
            ) : (
              sortedData.map((item, rowIndex) => {
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
                      <td className="table-database-td text-center text-text-muted font-medium sticky left-0 z-20 bg-background-surface border-r border-border-subtle">
                        {getRowId ? getRowId(item) : rowIndex + 1}
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
