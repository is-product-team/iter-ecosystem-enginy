'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/context/AuthContext';
import { ROLES, ISSUE_PRIORITIES, ISSUE_STATUSES, ISSUE_CATEGORIES } from '@iter/shared';
import DashboardLayout from '@/components/DashboardLayout';
import issueService, { Issue } from '@/services/issueService';
import Loading from '@/components/Loading';
import DataTable, { Column } from '@/components/ui/DataTable';
import DataTableToolbar, { FilterSelect } from '@/components/ui/DataTableToolbar';
import { format } from 'date-fns';
import { ca, es } from 'date-fns/locale';
import { AlertCircle, Clock, CheckCircle2, XCircle } from 'lucide-react';

export default function AdminIssuesPage() {
  const t = useTranslations('Issues');
  const tc = useTranslations('Common');
  const { user, loading: authLoading } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const router = useRouter();
  const params = useParams();
  const locale = params?.locale || 'ca';
  const dateLocale = locale === 'ca' ? ca : es;

  const loadIssues = useCallback(async () => {
    try {
      setLoading(true);
      const data = await issueService.getAll();
      setIssues(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && (!user || user.role.name !== ROLES.ADMIN)) {
      router.push(`/${locale}/login`);
      return;
    }

    if (user) {
      loadIssues();
    }
  }, [user, authLoading, router, locale, loadIssues]);

  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      const matchesSearch = !searchQuery || 
        issue.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        issue.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.center?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.issueId.toString().includes(searchQuery);
      
      const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || issue.priority === priorityFilter;
      const matchesCategory = categoryFilter === 'all' || issue.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
    });
  }, [issues, searchQuery, statusFilter, priorityFilter, categoryFilter]);

  const columns: Column<Issue>[] = [
    {
      header: t('table.id'),
      render: (item) => <span className="table-id">#{item.issueId}</span>,
      width: 80,
    },
    {
      header: t('table.center'),
      render: (item) => <span className="table-tag-blue font-bold">{item.center?.name || '---'}</span>,
      width: 180,
    },
    {
      header: t('table.title'),
      render: (item) => (
        <div className="flex flex-col">
          <span className="table-primary font-bold">{item.title}</span>
          <span className="text-[11px] text-text-muted line-clamp-1">{item.description}</span>
        </div>
      ),
      width: 250,
    },
    {
      header: t('table.category'),
      render: (item) => (
        <span className="table-tag-muted capitalize">
          {t(`categories.${item.category}`)}
        </span>
      ),
      width: 120,
    },
    {
      header: t('table.priority'),
      render: (item) => {
        const priorityColors: Record<string, string> = {
          LOW: 'table-tag-green',
          MEDIUM: 'table-tag-orange',
          HIGH: 'table-tag-red',
          CRITICAL: 'table-tag-purple text-white bg-consorci-pinkRed',
        };
        return (
          <span className={priorityColors[item.priority] || 'table-tag-muted'}>
            {t(`priority_${item.priority.toLowerCase()}` as any)}
          </span>
        );
      },
      width: 100,
    },
    {
      header: t('table.status'),
      render: (item) => {
        const config: Record<string, { color: string, icon: any }> = {
          OPEN: { color: 'text-blue-600', icon: AlertCircle },
          IN_PROGRESS: { color: 'text-orange-600', icon: Clock },
          RESOLVED: { color: 'text-green-600', icon: CheckCircle2 },
          CLOSED: { color: 'text-text-muted', icon: XCircle },
        };
        const { color, icon: Icon } = config[item.status] || config.OPEN;
        return (
          <div className={`flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase ${color}`}>
            <Icon size={12} strokeWidth={3} />
            {t(`status_${item.status.toLowerCase()}` as any)}
          </div>
        );
      },
      width: 130,
    },
    {
      header: t('table.date'),
      render: (item) => (
        <span className="table-detail">
          {format(new Date(item.createdAt), 'dd MMM yyyy', { locale: dateLocale })}
        </span>
      ),
      width: 120,
    },
  ];

  if (authLoading || !user) {
    return <Loading fullScreen />;
  }

  return (
    <DashboardLayout
      title={t('title')}
      subtitle={t('subtitle')}
    >
      <div className="space-y-0">
        <DataTableToolbar
          search={{
            value: searchQuery,
            onChange: setSearchQuery,
            placeholder: tc('search')
          }}
          onClear={() => {
            setSearchQuery('');
            setStatusFilter('all');
            setPriorityFilter('all');
            setCategoryFilter('all');
          }}
          filters={
            <>
              <FilterSelect
                label={t('filter_status')}
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { label: tc('all_statuses'), value: 'all' },
                  ...Object.values(ISSUE_STATUSES).map(s => ({
                    label: t(`status_${s.toLowerCase()}` as any),
                    value: s
                  }))
                ]}
                icon={Clock}
              />
              <FilterSelect
                label={t('filter_priority')}
                value={priorityFilter}
                onChange={setPriorityFilter}
                options={[
                  { label: tc('general'), value: 'all' },
                  ...Object.values(ISSUE_PRIORITIES).map(p => ({
                    label: t(`priority_${p.toLowerCase()}` as any),
                    value: p
                  }))
                ]}
                icon={AlertCircle}
              />
            </>
          }
          resultsCount={filteredIssues.length}
          itemName="incidències"
        />

        <DataTable
          data={filteredIssues}
          columns={columns}
          loading={loading}
          emptyMessage={t('no_incidents')}
          onRowClick={(item) => router.push(`/${locale}/admin/issues/${item.issueId}`)}
          rowClassName="cursor-pointer hover:bg-background-subtle transition-colors"
          hideTopBorder
        />
      </div>
    </DashboardLayout>
  );
}
