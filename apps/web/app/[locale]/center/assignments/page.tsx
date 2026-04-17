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
import { toast } from 'sonner';
import ConfirmDialog from '@/components/ConfirmDialog';
import DataTable, { Column } from '@/components/ui/DataTable';
import DataTableToolbar, { FilterSelect } from '@/components/ui/DataTableToolbar';

export default function AssignmentsPage() {
  const t = useTranslations('AssignmentsPage');
  const tCommon = useTranslations('Common');

  const [user, setUser] = useState<User | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

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

      // Fetch assignments
      if (currentUser.centerId) {
        try {
          const [resAssig, resPhases] = await Promise.all([
            assignmentService.getByCenter(currentUser.centerId),
            phaseService.getAll()
          ]);
          if (isMounted) {
            setAssignments(resAssig);
            setPhases(resPhases);
          }
        } catch (err) {
          console.error(err);
        } finally {
          if (isMounted) setLoading(false);
        }
      } else {
        if (isMounted) setLoading(false);
      }
    };

    init();
    return () => { isMounted = false; };
  }, [router, locale]);

  const isPhaseActive = (phaseName: string) => {
    const phase = phases.find(f => f.name === phaseName);
    return phase ? phase.isActive : false;
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
      header: "ID",
      render: (a) => <span className="table-id">{a.assignmentId}</span>,
      width: 60,
      align: 'center'
    },
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
          a.status === 'VALIDATED' ? 'table-tag-green' :
          a.status === 'DATA_ENTRY' ? 'table-tag-orange' :
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
        <button
          onClick={(e) => { e.stopPropagation(); router.push(`/center/assignments/${a.assignmentId}`); }}
          className="bg-consorci-darkBlue text-white py-2 px-6 text-[12px] font-medium transition-all hover:bg-black active:scale-[0.98] whitespace-nowrap"
        >
          {t('manage_btn')}
        </button>
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
            />
          }
        />

        <DataTable
          data={filteredAssignments}
          columns={columns}
          loading={loading}
          emptyMessage={t('no_assignments')}
          tableId="center_assignments"
          hideTopBorder
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
              <button
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
                className="px-8 py-4 bg-[#F26178] text-white font-medium text-[13px] transition-all hover:bg-black active:scale-[0.98]"
              >
                {t('report_btn')}
              </button>
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
