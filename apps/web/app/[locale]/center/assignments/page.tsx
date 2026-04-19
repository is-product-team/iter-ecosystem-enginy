'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { getUser, User } from '@/lib/auth';
import { PHASES, ROLES } from '@iter/shared';
import DashboardLayout from '@/components/DashboardLayout';
import assignmentService, { Assignment } from '@/services/assignmentService';
import phaseService, { Phase } from '@/services/phaseService';
import getApi from '@/services/api';
import Loading from '@/components/Loading';
import Button from '@/components/ui/Button';
import { toast } from 'sonner';
import ConfirmDialog from '@/components/ConfirmDialog';
import DataTable, { Column } from '@/components/ui/DataTable';
import DataTableToolbar, { FilterSelect } from '@/components/ui/DataTableToolbar';
import { ListChecks } from 'lucide-react';

export default function AssignmentsPage() {
  const t = useTranslations('AssignmentsPage');
  const tCommon = useTranslations('Common');

  const [user, setUser] = useState<User | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [groupBy, setGroupBy] = useState<string | null>(null);

  // Dialog states
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    isDestructive?: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { },
  });

  const router = useRouter();
  const params = useParams();
  const locale = params?.locale || 'ca';

  const fetchData = async () => {
    const currentUser = getUser();
    if (!currentUser) return;

    if (currentUser.centerId) {
      try {
        const [resAssig, resPhases] = await Promise.all([
          assignmentService.getByCenter(currentUser.centerId),
          phaseService.getAll()
        ]);
        setAssignments(resAssig);
        setPhases(resPhases);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      const currentUser = getUser();
      if (!isMounted) return;

      if (!currentUser || currentUser.role.name !== ROLES.COORDINATOR) {
        router.push(`/${locale}/login`);
        return;
      }

      setUser(currentUser);
      await fetchData();
    };

    init();
    return () => { isMounted = false; };
  }, [router, locale]);

  const isPhaseActive = (phaseName: string) => {
    const phase = phases.find(f => f.name === phaseName);
    return phase ? phase.isActive : false;
  };

  const handleCloseAssignment = async (id: number) => {
    setConfirmConfig({
      isOpen: true,
      title: t('close_confirm_title'),
      message: t('close_confirm_msg'),
      isDestructive: true,
      onConfirm: async () => {
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        setProcessingId(id);
        try {
          const api = getApi();
          await api.post(`/assignments/${id}/close`);
          toast.success(t('close_success'));
          await fetchData();
        } catch (err: any) {
          console.error(err);
          toast.error(err.response?.data?.error || t('close_error'));
        } finally {
          setProcessingId(null);
        }
      }
    });
  };

  const handleBulkDownload = async (id: number) => {
    setProcessingId(id);
    try {
      const api = getApi();
      const response = await api.get(`/certificates/download-bulk/${id}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificats_taller_${id}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(tCommon('success_download'));
    } catch (err) {
      console.error(err);
      toast.error(t('download_error'));
    } finally {
      setProcessingId(null);
    }
  };

  const filteredAssignments = assignments.filter(a => {
    const matchesSearch = !searchQuery ||
      a.workshop?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.center?.name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "All" || a.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const columns: Column<Assignment>[] = [
    {
      header: "Taller",
      render: (a) => (
        <span className="table-primary">{a.workshop?.title}</span>
      ),
      width: 250
    },
    {
      header: "Centre",
      render: (a) => (
        <span className="table-primary">{a.center?.name || t('not_assigned')}</span>
      ),
      width: 200
    },
    {
      header: "Planificació",
      render: (a) => (
        <div className="table-detail">
          {a.startDate ? new Date(a.startDate).toLocaleDateString() : '—'}
        </div>
      ),
      width: 120,
      align: 'center'
    },
    {
      header: "Estat",
      render: (a) => (
        <span className={
          a.status === 'COMPLETED' ? 'table-tag-green' :
            a.status === 'IN_PROGRESS' ? 'table-tag-orange' :
              'table-tag-muted'
        }>
          {tCommon(`statuses.${a.status}`)}
        </span>
      ),
      width: 120,
      align: 'center'
    },
    {
      header: t('table_actions'),
      align: 'right',
      render: (a) => (
        <div className="flex justify-end gap-3">
          <Button
            onClick={(e) => { e.stopPropagation(); router.push(`/center/assignments/${a.assignmentId}`); }}
            variant="outline"
            size="sm"
          >
            {t('manage_btn')}
          </Button>

          {/* Phase 4: Closure Actions */}
          {isPhaseActive(PHASES.CLOSURE) && a.status === 'IN_PROGRESS' && (
            <Button
              onClick={(e) => { e.stopPropagation(); handleCloseAssignment(a.assignmentId); }}
              disabled={processingId === a.assignmentId}
              variant="primary"
              size="sm"
              loading={processingId === a.assignmentId}
            >
              {t('close_group_btn')}
            </Button>
          )}

          {/* Phase 4: Download Actions */}
          {a.status === 'COMPLETED' && (
            <Button
              onClick={(e) => { e.stopPropagation(); handleBulkDownload(a.assignmentId); }}
              disabled={processingId === a.assignmentId}
              variant="primary"
              size="sm"
              loading={processingId === a.assignmentId}
              icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>}
            >
              {t('download_bulk_btn')}
            </Button>
          )}
        </div>
      )
    }
  ];

  if (!user) return null;

  return (
    <DashboardLayout
      title={t('title')}
      subtitle={t('subtitle')}
    >
      <div className="w-full">
        <DataTableToolbar
          search={{
            value: searchQuery,
            onChange: setSearchQuery,
            placeholder: t('search_placeholder')
          }}
          onClear={() => { setSearchQuery(""); setStatusFilter("All"); }}
          filters={
            <FilterSelect
              label={tCommon('status')}
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { label: tCommon('all_statuses'), value: "All" },
                { label: t('in_progress'), value: "IN_PROGRESS" },
                { label: t('completed'), value: "COMPLETED" },
              ]}
              icon={ListChecks}
            />
          }
          groups={{
            value: groupBy || '',
            onChange: setGroupBy,
            options: [
              { label: tCommon('status'), value: 'status' }
            ]
          }}
        />

        <DataTable
          data={filteredAssignments}
          columns={columns}
          loading={loading}
          emptyMessage={tCommon('no_results')}
          getRowId={a => a.assignmentId}
          tableId="center_assignments"
          hideTopBorder
          groupBy={groupBy}
          onGroupByChange={setGroupBy}
        />

        {/* Incidents Section (Only available in Phase 3) */}
        {isPhaseActive(PHASES.EXECUTION) && (
          <section className="mt-16 bg-background-surface p-10 border border-border-subtle">
            <h3 className="text-xl font-medium text-text-primary mb-3">{t('incidents_title')}</h3>
            <p className="text-[13px] font-medium text-text-muted mb-8">
              {t('incidents_subtitle')}
            </p>

            <div className="flex gap-4">
              <input
                id="incident-input"
                type="text"
                placeholder={t('incident_placeholder')}
                className="flex-1 px-4 py-4 bg-background-subtle border border-border-subtle text-sm font-medium text-text-primary focus:border-consorci-darkBlue outline-none transition-all appearance-none"
              />
              <Button
                onClick={async () => {
                  const input = document.getElementById('incident-input') as HTMLInputElement;
                  if (!input.value) return;
                  const api = getApi();
                  await api.post('/assignments/incidents', {
                    centerId: (user as any).centerId,
                    description: input.value
                  });
                  input.value = '';
                  toast.success(t('incident_success'));
                }}
                variant="danger"
                size="md"
                className="!px-8"
              >
                {t('report_btn')}
              </Button>
            </div>
          </section>
        )}
      </div>
      <ConfirmDialog
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
        isDestructive={confirmConfig.isDestructive}
      />
    </DashboardLayout>
  );
}
