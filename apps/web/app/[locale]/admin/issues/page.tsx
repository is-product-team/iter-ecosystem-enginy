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
import DataTableToolbar from '@/components/ui/DataTableToolbar';
import { format } from 'date-fns';
import { ca, es } from 'date-fns/locale';

export default function AdminIssuesPage() {
  const t = useTranslations('Issues');
  const tCommon = useTranslations('Common');
  const { user, loading: authLoading } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

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
      setError('Error carregant les incidències');
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
    if (!searchQuery) return issues;
    const query = searchQuery.toLowerCase();
    return issues.filter(issue => 
      issue.title.toLowerCase().includes(query) || 
      issue.description.toLowerCase().includes(query) ||
      issue.center?.name.toLowerCase().includes(query) ||
      issue.issueId.toString().includes(query)
    );
  }, [issues, searchQuery]);

  const columns: Column<Issue>[] = [
    {
      header: t('table.id'),
      render: (item) => <span className="table-id">#{item.issueId}</span>,
      width: 70,
    },
    {
      header: t('table.center'),
      render: (item) => <span className="table-tag-muted">{item.center?.name || '---'}</span>,
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
            {item.priority}
          </span>
        );
      },
      width: 100,
    },
    {
      header: t('table.status'),
      render: (item) => {
        const statusColors: Record<string, string> = {
          OPEN: 'text-orange-600',
          IN_PROGRESS: 'text-blue-600',
          RESOLVED: 'text-green-600',
          CLOSED: 'text-text-muted',
        };
        return (
          <span className={`text-[10px] font-bold tracking-widest uppercase ${statusColors[item.status]}`}>
            {t(`status_${item.status.toLowerCase()}` as any)}
          </span>
        );
      },
      width: 110,
    },
    {
      header: t('table.date'),
      render: (item) => (
        <span className="table-detail">
          {format(new Date(item.createdAt), 'dd/MM/yy', { locale: dateLocale })}
        </span>
      ),
      width: 100,
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
      <div className="space-y-6">
        <DataTableToolbar
          search={{
            value: searchQuery,
            onChange: setSearchQuery,
            placeholder: tCommon('search')
          }}
          resultsCount={filteredIssues.length}
          itemName="incidències globals"
        />

        <DataTable
          data={filteredIssues}
          columns={columns}
          loading={loading}
          emptyMessage={t('no_incidents')}
          onRowClick={(item) => router.push(`/${locale}/admin/issues/${item.issueId}`)}
          rowClassName="cursor-pointer hover:bg-background-subtle transition-colors"
        />
      </div>
    </DashboardLayout>
  );
}
