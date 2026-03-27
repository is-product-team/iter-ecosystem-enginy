"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { THEME, ROLES } from "@iter/shared";
import workshopService, { Workshop } from "../../../services/workshopService";
import DashboardLayout from "../../../components/DashboardLayout";
import CreateWorkshopModal from "../../../components/CreateWorkshopModal";
import Loading from "@/components/Loading";
import { toast } from "sonner";
import ConfirmDialog from "@/components/ConfirmDialog";
import Pagination from "@/components/Pagination";

const SVG_ICONS: Record<string, React.ReactNode> = {
  PUZZLE: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />,
  ROBOT: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />,
  CODE: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />,
  PAINT: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />,
  FILM: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />,
  TOOLS: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />,
  LEAF: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />,
  GEAR: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z" />
};

export default function WorkshopAdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!authLoading && (!user || user.role.name !== ROLES.ADMIN)) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const [editingWorkshop, setEditingWorkshop] = useState<Workshop | null>(null);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSector, setSelectedSector] = useState("All sectors");
  const [selectedModality, setSelectedModality] = useState("All modalities");

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
    onConfirm: () => {},
  });

  const fetchWorkshops = useCallback(async () => {
    try {
      const data = await workshopService.getAll();
      setWorkshops(data);
      setError(null);
    } catch (err) {
      setError("Could not load workshops.");
      console.error(err);
    }
  }, []);

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

  const filteredWorkshops = useMemo(() => {
    return workshops.filter((workshop) => {
      const matchesSearch = !searchQuery || workshop.title?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSector = selectedSector === "All sectors" || workshop.sector === selectedSector;
      const matchesModality = selectedModality === "All modalities" || workshop.modality === selectedModality;
      return matchesSearch && matchesSector && matchesModality;
    });
  }, [workshops, searchQuery, selectedSector, selectedModality]);

  // useEffect(() => {
  //   setCurrentPage(1);
  // }, [searchQuery, selectedSector, selectedModality]);

  const totalPages = Math.ceil(filteredWorkshops.length / itemsPerPage);
  const paginatedWorkshops = filteredWorkshops.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const uniqueSectors = useMemo(() => {
    const sectors = Array.from(new Set(workshops.map(w => w.sector))).filter(Boolean);
    return ["All sectors", ...sectors.sort()];
  }, [workshops]);

  const uniqueModalities = useMemo(() => {
    const modalities = Array.from(new Set(workshops.map(w => w.modality))).filter(Boolean);
    return ["All modalities", ...modalities.sort()];
  }, [workshops]);

  const handleWorkshopSaved = (savedWorkshop: Workshop) => {
    setWorkshops((prev) => {
      const exists = prev.find((w) => w._id === savedWorkshop._id);
      if (exists) {
        return prev.map((w) => (w._id === savedWorkshop._id ? savedWorkshop : w));
      }
      return [savedWorkshop, ...prev];
    });
    setEditingWorkshop(null);
    toast.success("Workshop saved successfully.");
  };

  const handleEdit = (workshop: Workshop) => {
    setEditingWorkshop(workshop);
    setCreateModalVisible(true);
  };

  const handleDelete = (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Delete Workshop',
      message: 'Are you sure you want to delete this workshop? This action will permanently remove the workshop from the catalog.',
      isDestructive: true,
      onConfirm: async () => {
        try {
          await workshopService.delete(id);
          setWorkshops((prev) => prev.filter((w) => w._id !== id));
          toast.success("Workshop deleted successfully.");
        } catch (err) {
          toast.error("Error deleting workshop.");
        }
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  if (authLoading || !user || user.role.name !== 'ADMIN') {
    return <Loading fullScreen message="Verifying administrator permissions..." />;
  }

  const headerActions = (
    <button
      onClick={() => {
        setEditingWorkshop(null);
        setCreateModalVisible(true);
      }}
      className="flex items-center gap-2 px-6 py-3 text-white font-bold shadow-lg"
      style={{ backgroundColor: THEME.colors.primary }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
      </svg>
      New Workshop  
    </button>
  );

  return (
    <DashboardLayout 
      title="Workshops Management" 
      subtitle="Creation, editing, and supervision of the official Iter catalog."
      actions={headerActions}
    >
      {/* Filters Panel */}
      <div className="mb-8 flex flex-col lg:flex-row gap-6 bg-background-surface border border-border-subtle p-8">
        {/* Text Search */}
        <div className="flex-1">
          <label className="block text-[10px] font-bold text-text-primary uppercase tracking-[0.2em] mb-3">Search by title</label>
          <div className="relative">
            <input 
              type="text"
              placeholder="Ex: Woodwork, Robotics..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-background-subtle border border-border-subtle focus:border-consorci-actionBlue focus:ring-0 text-sm font-bold text-text-primary placeholder:text-text-muted transition-all"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-4 top-3.5 h-5 w-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Sector Filter */}
        <div className="lg:w-64">
          <label className="block text-[10px] font-bold text-text-primary uppercase tracking-[0.2em] mb-3">Filter by sector</label>
          <select 
            value={selectedSector}
            onChange={(e) => handleSectorChange(e.target.value)}
            className="w-full px-4 py-3 bg-background-subtle border border-border-subtle focus:border-consorci-actionBlue focus:ring-0 text-sm font-bold text-text-primary appearance-none"
          >
            {uniqueSectors.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Modality Filter */}
        <div className="lg:w-64">
          <label className="block text-[10px] font-bold text-text-primary uppercase tracking-[0.2em] mb-3">Filter by modality</label>
          <select 
            value={selectedModality}
            onChange={(e) => handleModalityChange(e.target.value)}
            className="w-full px-4 py-3 bg-background-subtle border border-border-subtle focus:border-consorci-actionBlue focus:ring-0 text-sm font-bold text-text-primary appearance-none"
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
              setSelectedSector("All sectors");
              setSelectedModality("All modalities");
            }}
            className="w-full lg:w-auto px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-text-muted hover:text-red-500 hover:bg-red-50 transition-all border border-transparent hover:border-red-100 h-[46px]"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Workshops Table */}
      {loading ? (
        <Loading message="Loading catalog..." />
      ) : filteredWorkshops.length > 0 ? (
        <div className="bg-background-surface border border-border-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-background-subtle border-b border-border-subtle">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-text-primary">Workshop Information</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-text-primary">Classification</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-text-primary">Details and Capacity</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-text-primary text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {paginatedWorkshops.map((workshop) => (
                  <tr key={workshop._id} className="hover:bg-background-subtle transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-background-subtle flex items-center justify-center text-text-primary group-hover:bg-consorci-darkBlue group-hover:text-white transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {SVG_ICONS[workshop.icon || "PUZZLE"] || SVG_ICONS.PUZZLE}
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm font-bold text-text-primary uppercase tracking-tight">{workshop.title}</div>
                          <div className="text-[10px] font-bold text-text-muted uppercase tracking-tighter mt-0.5">ID: {workshop._id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-[11px] font-medium text-text-secondary">
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-consorci-actionBlue uppercase">{workshop.sector}</span>
                        <span className="text-text-muted">Modality {workshop.modality}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-text-muted uppercase tracking-wide">
                          {workshop.technicalDetails?.durationHours}h • {workshop.technicalDetails?.maxPlaces} Places
                        </div>
                        <div className="text-[10px] text-text-muted font-medium line-clamp-1 max-w-[200px]">
                          {workshop.technicalDetails?.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-end items-center gap-2">
                        <button 
                          onClick={() => handleEdit(workshop)}
                          className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-consorci-darkBlue hover:bg-background-subtle transition-colors"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(workshop._id)}
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

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredWorkshops.length}
            currentItemsCount={paginatedWorkshops.length}
            itemName="workshops"
          />
        </div>
      ) : (
        <div className="text-center py-32 bg-background-surface border border-dashed border-border-subtle">
          <div className="w-16 h-16 bg-background-subtle flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className="text-text-primary font-bold uppercase text-xs tracking-widest">No workshops found</p>
          <p className="text-text-muted text-[10px] uppercase font-bold mt-1 tracking-widest">Try other search terms.</p>
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