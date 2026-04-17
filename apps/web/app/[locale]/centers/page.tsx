"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "@/context/AuthContext";
import { THEME, ROLES } from "@iter/shared";
import DashboardLayout from "../../../components/DashboardLayout";
import CreateCenterModal from "../../../components/CreateCenterModal";
import centerService, { Center } from "../../../services/centerService";
import Loading from "@/components/Loading";
import { toast } from "sonner";
import ConfirmDialog from "@/components/ConfirmDialog";
import DataTable, { Column } from "@/components/ui/DataTable";
import DataTableToolbar, { FilterSelect } from "@/components/ui/DataTableToolbar";
import Avatar from "@/components/Avatar";

export default function CentersScreen() {
  const t = useTranslations('CentersPage');
  const tCommon = useTranslations('Common');

  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale || 'ca';

  useEffect(() => {
    if (!authLoading && (!user || user.role.name !== ROLES.ADMIN)) {
      router.push(`/${locale}/login`);
    }
  }, [user, authLoading, router, locale]);

  const [editingCenter, setEditingCenter] = useState<Center | null>(null);
  const [centers, setCenters] = useState<Center[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalVisible, setModalVisible] = useState(false);

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

  const fetchCenters = useCallback(async () => {
    setLoading(true);
    try {
      const list = await centerService.getAll();
      setCenters(list);
      setError(null);
    } catch (err) {
      setError(tCommon('loading_error'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [tCommon]);

  useEffect(() => {
    if (user && user.role.name === ROLES.ADMIN) {
      fetchCenters();
    }
  }, [fetchCenters, user]);

  const filteredCenters = useMemo(() => {
    return centers.filter((center) => {
      const matchesSearch = !searchQuery ||
        center.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        center.centerCode.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearch;
    });
  }, [centers, searchQuery]);

  const handleCenterSaved = (saved: Center) => {
    setCenters((prev) => {
      const exists = prev.find((c) => c.centerId === saved.centerId);
      if (exists) {
        return prev.map((c) => (c.centerId === saved.centerId ? saved : c));
      }
      return [saved, ...prev];
    });
    setEditingCenter(null);
    toast.success(tCommon('save_success'));
  };

  const handleEdit = (center: Center) => {
    setEditingCenter(center);
    setModalVisible(true);
  };

  const handleDelete = (id: number) => {
    setConfirmConfig({
      isOpen: true,
      title: tCommon('delete_confirm_title'),
      message: tCommon('delete_confirm_msg'),
      isDestructive: true,
      onConfirm: async () => {
        try {
          await centerService.delete(id);
          setCenters((prev) => prev.filter((c) => c.centerId !== id));
          toast.success(tCommon('delete_success'));
        } catch (err) {
          toast.error(tCommon('delete_error'));
        }
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const columns: Column<Center>[] = [
    {
      header: "",
      render: (center) => <Avatar name={center.name} size="sm" type="center" />,
      width: 50,
      align: 'center'
    },
    {
      header: "Nom",
      render: (center) => <span className="table-primary">{center.name}</span>,
      width: 250
    },
    {
      header: "Codi",
      render: (center) => <span className="table-id font-bold">{center.centerCode}</span>,
      width: 120,
      align: 'center'
    },
    {
      header: "Adreça",
      render: (center) => (
        <span className="table-detail font-medium">
          {center.address || t('no_address')}
        </span>
      )
    },
    {
      header: "Email",
      render: (center) => (
        <span className="table-detail font-medium">
          {center.contactEmail || "N/A"}
        </span>
      )
    },
    {
      header: t('table_phone'),
      render: (center) => (
        <span className="text-[11px] font-medium text-text-primary">
          {center.contactPhone || "N/A"}
        </span>
      )
    },
    {
      header: tCommon('actions'),
      align: 'right',
      render: (center) => (
        <div className="flex justify-end items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); handleEdit(center); }}
            className="px-4 py-2 text-[12px] font-medium text-consorci-darkBlue hover:underline transition-colors"
          >
            {tCommon('edit')}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDelete(center.centerId); }}
            className="p-2 text-text-muted hover:text-red-600 hover:bg-red-50 transition-all"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      )
    }
  ];

  if (authLoading || !user || user.role.name !== ROLES.ADMIN) {
    return <Loading fullScreen message={tCommon('authenticating')} />;
  }

  const headerActions = (
    <button
      onClick={() => {
        setEditingCenter(null);
        setModalVisible(true);
      }}
      className="flex items-center gap-2 px-6 py-3 text-white font-medium transition-all hover:bg-black active:scale-[0.98]"
      style={{ backgroundColor: 'var(--consorci-darkBlue)' }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
      </svg>
      {t('new')}
    </button>
  );

  return (
    <DashboardLayout
      title={t('title')}
      subtitle={t('subtitle')}
      actions={headerActions}
    >
      <DataTableToolbar
        search={{
          value: searchQuery,
          onChange: setSearchQuery,
          placeholder: t('search_placeholder')
        }}
        onClear={() => {
          setSearchQuery("");
        }}
      />

      {error && (
        <div className="mb-8 bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <DataTable
        tableId="centers_admin"
        data={filteredCenters}
        columns={columns}
        loading={loading}
        emptyMessage={tCommon('no_results')}
        getRowId={p => p.centerId}
        hideTopBorder
      />

      <CreateCenterModal
        visible={isModalVisible}
        onClose={() => {
          setModalVisible(false);
          setEditingCenter(null);
        }}
        onCenterSaved={handleCenterSaved}
        initialData={editingCenter}
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
