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

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleSectorChange = (val: string) => {
    setSelectedSector(val);
    setCurrentPage(1);
  };

  const handleModalityChange = (val: string) => {
    setSelectedModality(val);
    setCurrentPage(1);
  };
  const [isCreateModalVisible, setCreateModalVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  const totalPages = Math.ceil(filteredWorkshops.length / itemsPerPage);
  const paginatedWorkshops = filteredWorkshops.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
      {/* Filters Panel */}
      <div className="mb-10 flex flex-col lg:flex-row gap-8 bg-background-surface border border-border-subtle p-10">
        {/* Text Search */}
        <div className="flex-1">
          <label className="block text-[13px] font-medium text-text-primary mb-3">{tc("search_by_title")}</label>
          <div className="relative">
            <input
              type="text"
              placeholder={tc("search_placeholder")}
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-background-subtle border border-border-subtle focus:border-consorci-darkBlue outline-none text-sm font-medium text-text-primary placeholder:text-text-muted transition-all"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-4 top-4 h-4.5 w-4.5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Sector Filter */}
        <div className="lg:w-64">
          <label className="block text-[13px] font-medium text-text-primary mb-3">{tc("filter_by_sector")}</label>
          <select
            value={selectedSector}
            onChange={(e) => handleSectorChange(e.target.value)}
            className="w-full px-4 py-3.5 bg-background-subtle border border-border-subtle focus:border-consorci-darkBlue outline-none text-sm font-medium text-text-primary appearance-none"
          >
            {uniqueSectors.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Modality Filter */}
        <div className="lg:w-64">
          <label className="block text-[11px] font-medium text-text-primary mb-3">{tc("filter_by_modality")}</label>
          <select
            value={selectedModality}
            onChange={(e) => handleModalityChange(e.target.value)}
            className="w-full px-4 py-3.5 bg-background-subtle border border-border-subtle focus:border-consorci-darkBlue outline-none text-sm font-medium text-text-primary appearance-none"
          >
            {uniqueModalities.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        {/* Action: Clear */}
        <div className="flex items-end">
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedSector(tc("all_sectors"));
              setSelectedModality(tc("all_modalities"));
            }}
            className="w-full lg:w-auto px-6 py-3 text-[13px] font-medium text-text-muted hover:text-red-500 hover:bg-red-500/5 transition-all h-[49px]"
          >
            {tc("clear_filters")}
          </button>
        </div>
      </div>

      {/* Workshops Table */}
      {loading ? (
        <Loading message={t("loading_catalog")} />
      ) : filteredWorkshops.length > 0 ? (
        <div className="bg-background-surface border border-border-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-background-subtle border-b border-border-subtle">
                  <th className="px-6 py-4 text-[12px] font-medium text-text-primary">{t("table_info")}</th>
                  <th className="px-6 py-4 text-[12px] font-medium text-text-primary">{t("table_classification")}</th>
                  <th className="px-6 py-4 text-[12px] font-medium text-text-primary">{t("table_details")}</th>
                  <th className="px-6 py-4 text-[12px] font-medium text-text-primary text-right">{t("table_actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {paginatedWorkshops.map((workshop) => (
                  <tr key={workshop._id} className="hover:bg-background-subtle transition-colors group">
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-5">
                        <div className="w-10 h-10 bg-background-subtle flex items-center justify-center text-text-primary group-hover:bg-consorci-darkBlue group-hover:text-white transition-colors border border-border-subtle">
                          <WorkshopIcon iconName={workshop.icon} className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-[15px] font-medium text-text-primary leading-tight">{workshop.title}</div>
                          <div className="text-[12px] font-medium text-text-muted mt-1 uppercase tracking-tighter opacity-70">{tc("id_label", { id: workshop._id })}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-[13px] font-medium text-text-primary">
                      <div className="flex flex-col gap-1">
                        <span className="text-consorci-darkBlue">{workshop.sector}</span>
                        <span className="text-text-muted opacity-70">{tc("modality_label", { modality: workshop.modality })}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-[13px] font-medium text-text-muted">
                          {tc("duration_label", { hours: workshop.technicalDetails?.durationHours ?? 0 })} • {tc("places_label", { count: workshop.technicalDetails?.maxPlaces ?? 0 })}
                        </div>
                        <div className="text-[12px] text-text-muted font-medium line-clamp-1 max-w-[240px] opacity-70">
                          {workshop.technicalDetails?.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex justify-end items-center gap-4">
                        <button
                          onClick={() => handleEdit(workshop)}
                          className="text-[13px] font-medium text-consorci-darkBlue hover:text-text-primary transition-colors"
                        >
                          {tc("edit")}
                        </button>
                        <button
                          onClick={() => handleDelete(workshop._id)}
                          className="p-2 text-text-muted hover:text-red-600 transition-all"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredWorkshops.length}
            currentItemsCount={paginatedWorkshops.length}
            itemName={tc("workshops").toLowerCase()}
          />
        </div>
      ) : (
        <div className="text-center py-32 bg-background-surface border border-dashed border-border-subtle">
          <div className="w-16 h-16 bg-background-subtle flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className="text-text-primary font-medium text-sm">{tc("no_results")}</p>
          <p className="text-text-muted text-[11px] font-normal mt-1">{tc("try_other_terms")}</p>
        </div>
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
