"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useAuth } from "@/context/AuthContext";
import { THEME, ROLES } from "@iter/shared";
import WorkshopIcon from "../../../components/WorkshopIcon";
import DashboardLayout from "../../../components/DashboardLayout";
import CreateWorkshopModal from "../../../components/CreateWorkshopModal";
import Loading from "@/components/Loading";
import { toast } from "sonner";
import ConfirmDialog from "@/components/ConfirmDialog";
import Pagination from "@/components/Pagination";
import workshopService, { Workshop } from "@/services/workshopService";
import DataTable, { Column } from "@/components/ui/DataTable";
import DataTableToolbar, { FilterSelect } from "@/components/ui/DataTableToolbar";

export default function WorkshopAdminPage() {
  const t = useTranslations('Admin.Workshops');
  const tc = useTranslations('Common');
  const tForm = useTranslations('Forms');

  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [editingWorkshop, setEditingWorkshop] = useState<Workshop | null>(null);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSector, setSelectedSector] = useState(tc("all_sectors"));
  const [selectedModality, setSelectedModality] = useState(tc("all_modalities"));
  const [groupBy, setGroupBy] = useState<string | null>(null);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
  };

  const handleSectorChange = (val: string) => {
    setSelectedSector(val);
  };

  const handleModalityChange = (val: string) => {
    setSelectedModality(val);
  };
  const [isCreateModalVisible, setCreateModalVisible] = useState(false);

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

  const fetchWorkshops = useCallback(async () => {
    try {
      const data = await workshopService.getAll();
      setWorkshops(data);
      setError(null);
    } catch (err) {
      setError(t("load_error"));
      console.error(err);
    }
  }, [t]);

  useEffect(() => {
    if (!authLoading && (!user || user.role.name !== ROLES.ADMIN)) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      if (user && user.role.name === ROLES.ADMIN) {
        await fetchWorkshops();
      }
      if (isMounted) setLoading(false);
    };
    init();
    return () => { isMounted = false; };
  }, [fetchWorkshops, user]);

  const uniqueSectors = useMemo(() => {
    const sectors = Array.from(new Set(workshops.map(w => w.sector))).filter(Boolean);
    return [tc("all_sectors"), ...sectors.sort()];
  }, [workshops, tc]);

  const uniqueModalities = useMemo(() => {
    const modalities = Array.from(new Set(workshops.map(w => w.modality))).filter(Boolean);
    return [tc("all_modalities"), ...modalities.sort()];
  }, [workshops, tc]);

  useEffect(() => {
    if (workshops.length > 0) {
      if (selectedSector !== tc("all_sectors") && !uniqueSectors.includes(selectedSector)) {
        setSelectedSector(tc("all_sectors"));
      }
      if (selectedModality !== tc("all_modalities") && !uniqueModalities.includes(selectedModality)) {
        setSelectedModality(tc("all_modalities"));
      }
    }
  }, [workshops, uniqueSectors, uniqueModalities, selectedSector, selectedModality, tc]);

  const filteredWorkshops = useMemo(() => {
    return workshops.filter((workshop) => {
      const matchesSearch = !searchQuery || workshop.title?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSector = selectedSector === tc("all_sectors") || workshop.sector === selectedSector;
      const matchesModality = selectedModality === tc("all_modalities") || workshop.modality === selectedModality;
      return matchesSearch && matchesSector && matchesModality;
    });
  }, [workshops, searchQuery, selectedSector, selectedModality, tc]);

  const handleWorkshopSaved = (savedWorkshop: Workshop) => {
    setWorkshops((prev) => {
      const exists = prev.find((w) => w._id === savedWorkshop._id);
      if (exists) {
        return prev.map((w) => (w._id === savedWorkshop._id ? savedWorkshop : w));
      }
      return [savedWorkshop, ...prev];
    });
    setEditingWorkshop(null);
    toast.success(t("save_success"));
  };

  const handleEdit = (workshop: Workshop) => {
    setEditingWorkshop(workshop);
    setCreateModalVisible(true);
  };

  const handleDelete = (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: t('delete_title'),
      message: t('delete_confirm'),
      isDestructive: true,
      onConfirm: async () => {
        try {
          await workshopService.delete(id);
          setWorkshops((prev) => prev.filter((w) => w._id !== id));
          toast.success(t("delete_success"));
        } catch (err) {
          toast.error(t("delete_error"));
        }
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const columns: Column<Workshop>[] = [
    {
      header: "Taller",
      render: (workshop) => <span className="table-primary">{workshop.title}</span>,
      width: 250
    },
    {
      header: "Sector",
      render: (workshop) => <span className="table-tag-muted">{workshop.sector}</span>,
      width: 150
    },
    {
      header: "Modalitat",
      render: (workshop) => (
        <span className={
          workshop.modality === 'A' ? 'table-tag-green' :
          workshop.modality === 'B' ? 'table-tag-orange' :
          'table-tag-blue'
        }>
          {workshop.modality}
        </span>
      ),
      width: 100,
      align: 'center'
    },
    {
      header: "Hores",
      render: (workshop) => <span className="table-detail">{workshop.technicalDetails?.durationHours ?? 0}h</span>,
      width: 80,
      align: 'center'
    },
    {
      header: "Places",
      render: (workshop) => <span className="table-detail">{workshop.technicalDetails?.maxPlaces ?? 0}</span>,
      width: 80,
      align: 'center'
    },
    {
      header: "Descripció",
      render: (workshop) => (
        <span className="table-detail italic">
          {workshop.technicalDetails?.description || "-"}
        </span>
      ),
      width: 500
    },
    {
      header: t("table_actions"),
      align: 'right',
      render: (workshop) => (
        <div className="flex justify-end items-center gap-4">
          <button
            onClick={(e) => { e.stopPropagation(); handleEdit(workshop); }}
            className="text-[13px] font-medium text-consorci-darkBlue hover:text-text-primary transition-colors"
          >
            {tc("edit")}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDelete(workshop._id); }}
            className="text-text-muted hover:text-red-600 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      )
    }
  ];

  if (authLoading || !user || user.role.name !== ROLES.ADMIN) {
    return <Loading fullScreen message={tc("authenticating")} />;
  }

  const headerActions = (
    <button
      onClick={() => {
        setEditingWorkshop(null);
        setCreateModalVisible(true);
      }}
      className="flex items-center gap-2 px-6 py-3 bg-consorci-darkBlue text-white text-[13px] font-medium transition-all hover:bg-black active:scale-[0.98]"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
      </svg>
      {t("new_workshop")}
    </button>
  );

  return (
    <DashboardLayout
      title={t("management_title")}
      subtitle={t("management_subtitle")}
      actions={headerActions}
    >
      <DataTableToolbar
        search={{
          value: searchQuery,
          onChange: setSearchQuery,
          placeholder: tc('search_placeholder')
        }}
        onClear={() => {
          setSearchQuery("");
          setSelectedSector(tc("all_sectors"));
          setSelectedModality(tc("all_modalities"));
        }}
        filters={
          <>
            <FilterSelect
              label={tc("sector")}
              value={selectedSector}
              onChange={setSelectedSector}
              options={uniqueSectors.map(s => ({ label: s, value: s }))}
            />
            <FilterSelect
              label={tc("modality")}
              value={selectedModality}
              onChange={setSelectedModality}
              options={uniqueModalities.map(m => ({ label: m, value: m }))}
            />
          </>
        }
        groups={{
          value: groupBy || '',
          onChange: setGroupBy,
          options: [
            { label: 'Sector', value: 'sector' },
            { label: 'Modalitat', value: 'modality' }
          ]
        }}
      />

      {/* Workshops Table */}
      {error ? (
        <div className="bg-red-50 border-l-4 border-red-500 p-6 mb-10">
          <p className="text-red-700 font-bold text-sm">{error}</p>
        </div>
      ) : (
        <DataTable
          data={filteredWorkshops}
          columns={columns}
          loading={loading}
          emptyMessage={tc("no_results")}
          getRowId={p => p._id}
          hideTopBorder
          groupBy={groupBy}
          onGroupByChange={setGroupBy}
        />
      )}

      <CreateWorkshopModal
        visible={isCreateModalVisible}
        onClose={() => {
          setCreateModalVisible(false);
          setEditingWorkshop(null);
        }}
        onWorkshopCreated={handleWorkshopSaved}
        initialData={editingWorkshop}
      />
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
