'use client';

import React from 'react';
import { Search, X, ChevronDown, LucideIcon, Layers } from 'lucide-react';

interface FilterSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  icon?: LucideIcon;
}

export function FilterSelect({ label, value, onChange, options, icon: Icon }: FilterSelectProps) {
  return (
    <div className="group relative flex items-center h-full w-full bg-background-subtle">
      {Icon && <Icon className="absolute left-3 w-3.5 h-3.5 text-text-muted group-focus-within:text-consorci-lightBlue transition-colors" />}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full h-full bg-transparent outline-none text-[12px] font-medium text-text-primary appearance-none cursor-pointer transition-all pr-8 ${Icon ? 'pl-9' : 'pl-3'}`}
      >
        <option value="">{label}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 w-3.5 h-3.5 text-text-muted pointer-events-none group-hover:text-text-primary transition-colors" />
    </div>
  );
}

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchInput({ value, onChange, placeholder }: SearchInputProps) {
  return (
    <div className="group relative flex items-center h-full w-full bg-background-subtle">
      <Search className="absolute left-3 w-3.5 h-3.5 text-text-muted group-focus-within:text-consorci-lightBlue transition-colors" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "Search..."}
        className="w-full h-full bg-transparent pl-9 pr-3 py-3 outline-none text-[12px] font-medium text-text-primary placeholder:text-text-muted transition-all"
      />
    </div>
  );
}

interface DataTableToolbarProps {
  title?: string;
  icon?: React.ReactNode;
  resultsCount?: number;
  itemName?: string;
  actions?: React.ReactNode;
  search?: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  };
  filters?: React.ReactNode;
  onClear?: () => void;
  groups?: {
    value: string;
    onChange: (value: string) => void;
    options: { label: string; value: string }[];
  };
}

export default function DataTableToolbar({
  title,
  icon,
  resultsCount,
  itemName = 'items',
  actions,
  search,
  filters,
  onClear,
  groups
}: DataTableToolbarProps) {
  return (
    <div className="flex flex-col w-full border-t border-l border-r border-border-subtle bg-background-surface transition-all animate-in fade-in duration-500">
      {/* Header Bar */}
      {(title || actions || resultsCount !== undefined) && (
        <div className="flex items-center justify-between px-4 py-4 border-b border-border-subtle">
          <div className="flex items-center gap-3">
            {icon && <div className="text-consorci-darkBlue">{icon}</div>}
            {title && <h2 className="text-lg font-bold text-text-primary uppercase tracking-tight">{title}</h2>}
          </div>
          
          <div className="flex items-center gap-6">
            {resultsCount !== undefined && (
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em]">
                  {resultsCount} {itemName}
                </span>
              </div>
            )}
            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </div>
        </div>
      )}

      {/* Filter Grid */}
      {(search || filters || onClear) && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:flex xl:items-stretch w-full">
          {search && (
            <div className="xl:flex-1 border-b lg:border-r border-border-subtle h-[48px]">
              <SearchInput 
                value={search.value} 
                onChange={search.onChange} 
                placeholder={search.placeholder} 
              />
            </div>
          )}
          
          {filters && React.Children.map(filters, (child, index) => (
            <div key={index} className="xl:flex-1 border-b lg:border-r border-border-subtle h-[48px]">
              {child}
            </div>
          ))}

          {groups && (
            <div className="xl:flex-1 border-b lg:border-r border-border-subtle h-[48px]">
              <FilterSelect
                label="Agrupar per..."
                value={groups.value}
                onChange={groups.onChange}
                options={groups.options}
                icon={Layers}
              />
            </div>
          )}

          {onClear && (
            <div className="flex-none border-b border-border-subtle h-[48px]">
              <button
                onClick={onClear}
                className="flex items-center justify-center gap-2 px-6 h-full w-full bg-background-subtle hover:bg-background-surface text-[10px] font-bold text-text-muted hover:text-red-500 uppercase tracking-[0.2em] transition-all group"
              >
                <X className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </div>
          )}
          
          {/* Fillers for Grid alignment on Desktop if needed */}
          <div className="hidden xl:block flex-1 border-b border-border-subtle bg-background-subtle/30"></div>
        </div>
      )}
    </div>
  );
}
