"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { THEME, ROLES } from "@iter/shared";
import DashboardLayout from "../../../components/DashboardLayout";
import CreateCenterModal from "../../../components/CreateCenterModal";
import centerService, { Center } from "../../../services/centerService";
import Loading from "@/components/Loading";
import { toast } from "sonner";
import ConfirmDialog from "@/components/ConfirmDialog";
import Pagination from "@/components/Pagination";

export default function CentersScreen() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!authLoading && (!user || user.role.name !== ROLES.ADMIN)) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const [editingCenter, setEditingCenter] = useState<Center | null>(null);
  const [centers, setCenters] = useState<Center[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalVisible, setModalVisible] = useState(false);
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
    onConfirm: () => {},
  });

  const fetchCenters = useCallback(async () => {
    setLoading(true);
    try {
      const list = await centerService.getAll();
      setCenters(list);
      setError(null);
    } catch (err) {
      setError("Could not load centers.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

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

  const totalPages = Math.ceil(filteredCenters.length / itemsPerPage);
  const paginatedCenters = filteredCenters.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleCenterSaved = (saved: Center) => {
    setCenters((prev) => {
      const exists = prev.find((c) => c.centerId === saved.centerId);
      if (exists) {
        return prev.map((c) => (c.centerId === saved.centerId ? saved : c));
      }
      return [saved, ...prev];
    });
    setEditingCenter(null);
    toast.success("Center saved successfully.");
  };

  const handleEdit = (center: Center) => {
    setEditingCenter(center);
    setModalVisible(true);
  };

  const handleDelete = (id: number) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Delete Center',
      message: 'Are you sure you want to delete this center? All associated data will be deleted.',
      isDestructive: true,
      onConfirm: async () => {
        try {
          await centerService.delete(id);
          setCenters((prev) => prev.filter((c) => c.centerId !== id));
          toast.success("Center deleted successfully.");
        } catch (err) {
          toast.error("Error deleting center.");
        }
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  if (authLoading || !user || user.role.name !== ROLES.ADMIN) {
    return <Loading fullScreen message="Verifying administrator permissions..." />;
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
      New Center
    </button>
  );

  return (
    <DashboardLayout 
      title="Centers Management" 
      subtitle="Administration of educational centers participating in Iter."
      actions={headerActions}
    >
      {/* Panell de Filtres */}
      <div className="mb-8 flex flex-col lg:flex-row gap-6 bg-background-surface border border-border-subtle p-8">
        {/* Cercador */}
        <div className="flex-1">
          <label className="block text-[12px] font-medium text-text-primary mb-3">Search by name or code</label>
          <div className="relative">
            <input 
              type="text"
              placeholder="Ej: Institut Pedralbes, 08012345..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-11 pr-4 py-3 bg-background-subtle border border-border-subtle focus:border-consorci-darkBlue focus:ring-0 text-sm font-medium text-text-primary placeholder:text-text-muted transition-all"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-4 top-3.5 h-5 w-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Acció: Netejar */}
        <div className="flex items-end">
          <button 
            onClick={() => {
              setSearchQuery("");
              setCurrentPage(1);
            }}
            className="w-full lg:w-auto px-6 py-3 text-[12px] font-medium text-text-muted hover:text-text-primary transition-all border border-transparent h-[46px]"
          >
            Clear filters
          </button>
        </div>
      </div>

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

      {/* Centers Table */}
      {loading ? (
        <Loading message="Loading centers..." />
      ) : filteredCenters.length > 0 ? (
        <div className="bg-background-surface border border-border-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-background-subtle border-b border-border-subtle">
                  <th className="px-6 py-4 text-[12px] font-medium text-text-primary">Center</th>
                  <th className="px-6 py-4 text-[12px] font-medium text-text-primary">Address</th>
                  <th className="px-6 py-4 text-[12px] font-medium text-text-primary">Email</th>
                  <th className="px-6 py-4 text-[12px] font-medium text-text-primary">Phone</th>
                  <th className="px-6 py-4 text-[12px] font-medium text-text-primary text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {paginatedCenters.map((center) => (
                  <tr key={center.centerId} className="hover:bg-background-subtle transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-background-subtle flex items-center justify-center text-text-primary group-hover:bg-consorci-darkBlue group-hover:text-white transition-colors">
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-text-primary tracking-tight">{center.name}</div>
                          <div className="text-[10px] font-medium text-text-muted mt-0.5">Code: {center.centerCode}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-[11px] font-medium text-text-primary">
                      {center.address || "No address"}
                    </td>
                    <td className="px-6 py-5 text-[11px] font-medium text-text-primary">
                      {center.contactEmail || "N/A"}
                    </td>
                    <td className="px-6 py-5 text-[11px] font-medium text-text-primary">
                      {center.contactPhone || "N/A"}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-end items-center gap-2">
                        <button 
                          onClick={() => handleEdit(center)}
                          className="px-4 py-2 text-[12px] font-medium text-consorci-darkBlue hover:underline transition-colors"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(center.centerId)}
                          className="p-2 text-text-muted hover:text-red-600 hover:bg-red-50 transition-all"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginació */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredCenters.length}
            currentItemsCount={paginatedCenters.length}
            itemName="centers"
          />
        </div>
      ) : (
        <div className="text-center py-32 bg-background-surface border border-dashed border-border-subtle">
          <div className="w-16 h-16 bg-background-subtle flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className="text-text-primary font-medium text-sm">No centers found</p>
          <p className="text-text-muted text-[12px] font-medium mt-2">Try other search terms.</p>
        </div>
      )}

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
