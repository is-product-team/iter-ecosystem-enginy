'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ROLES } from '@iter/shared';
import DashboardLayout from '@/components/DashboardLayout';
import teacherService, { Teacher } from '@/services/teacherService';
import Loading from '@/components/Loading';
import { toast } from 'sonner';
import ConfirmDialog from '@/components/ConfirmDialog';
import Avatar from '@/components/Avatar';
import getApi from '@/services/api';
import Pagination from "@/components/Pagination";

export default function TeachersCRUD() {
  const { user, loading: authLoading } = useAuth();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [formData, setFormData] = useState({ name: '', contact: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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

  const router = useRouter();

  useEffect(() => {
    if (!authLoading && (!user || user.role.name !== ROLES.COORDINATOR)) {
      router.push('/login');
      return;
    }
    if (user) loadTeachers();
  }, [user, authLoading]);

  const loadTeachers = async () => {
    try {
      const data = await teacherService.getAll();
      setTeachers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTeachers = teachers.filter(p => {
    return !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.contact.toLowerCase().includes(searchQuery.toLowerCase());
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage);
  const paginatedTeachers = filteredTeachers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTeacher) {
        await teacherService.update(editingTeacher.teacherId, formData);
        toast.success("Teacher updated successfully.");
      } else {
        await teacherService.create(formData);
        toast.success("Teacher created successfully.");
      }
      setIsModalOpen(false);
      setEditingTeacher(null);
      setFormData({ name: '', contact: '', password: '' });
      loadTeachers();
    } catch (err: unknown) {
      toast.error((err as Error).message || "Error saving teacher.");
    }
  };

  const handleEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormData({ name: teacher.name, contact: teacher.contact, password: '' });
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Delete Teacher',
      message: 'Are you sure you want to delete this teacher? Their access to the mobile App will also be removed.',
      isDestructive: true,
      onConfirm: async () => {
        try {
          await teacherService.delete(id);
          loadTeachers();
          toast.success("Teacher deleted.");
        } catch (err) {
          toast.error("Error deleting teacher.");
        }
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
  };
  const headerActions = (
    <button
      onClick={() => { setEditingTeacher(null); setFormData({ name: '', contact: '', password: '' }); setIsModalOpen(true); }}
      className="bg-[#00426B] text-white px-6 py-3 font-black uppercase text-[10px] tracking-widest hover:bg-[#0775AB] transition-all flex items-center gap-2 shadow-lg"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
      New Teacher
    </button>
  );

  return (
    <DashboardLayout
      title="Teacher Management"
      subtitle="Manage the referring teachers of your educational center."
      actions={headerActions}
    >
      {/* Filters Panel */}
      <div className="mb-8 flex flex-col lg:flex-row gap-6 bg-white border border-gray-200 p-8">
        <div className="flex-1">
          <label className="block text-[10px] font-black text-[#00426B] uppercase tracking-[0.2em] mb-3">Search by name or contact</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Ex: Manuel Pérez, manuel@escolaurgell.cat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-[#F8FAFC] border border-gray-100 focus:border-[#0775AB] focus:ring-0 text-sm font-bold text-[#00426B] placeholder:text-gray-300 transition-all"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-4 top-3.5 h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className="flex items-end">
          <button
            onClick={() => setSearchQuery("")}
            className="w-full lg:w-auto px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all border border-transparent hover:border-red-100 h-[46px]"
          >
            Clear
          </button>
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="bg-white border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-gray-200">
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#00426B]">Teacher</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#00426B]">Contact</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#00426B] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedTeachers.map(p => (
                    <tr key={p.teacherId} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <Avatar
                            url={p.user?.photoUrl}
                            name={p.name}
                            id={p.user?.userId || p.teacherId}
                            type="user"
                            size="md"
                            email={p.user?.email}
                          />
                          <div>
                            <div className="text-sm font-black text-[#00426B] uppercase tracking-tight">{p.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm font-bold text-gray-500">{p.contact}</span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex justify-end items-center gap-2">
                          <button onClick={() => handleEdit(p)} className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#00426B] hover:bg-[#EAEFF2] transition-colors">Edit</button>
                          <button onClick={() => handleDelete(p.teacherId)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredTeachers.length === 0 && (
              <div className="p-20 text-center">
                <p className="text-[#00426B] font-black uppercase text-xs tracking-widest">No teachers found</p>
                <p className="text-gray-400 text-[10px] uppercase font-bold mt-1 tracking-widest">Try other search terms.</p>
              </div>
            )}
          </div>

          {/* Paginació */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredTeachers.length}
            currentItemsCount={paginatedTeachers.length}
            itemName="teachers"
          />
        </>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
          <div className="bg-white shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200 border border-gray-100">
            {/* Header */}
            <div className="bg-gray-50 px-8 py-5 border-b border-gray-100 flex justify-between items-center sticky top-0 z-10">
              <div>
                <h3 className="text-xl font-black text-[#00426B] uppercase tracking-tight">
                  {editingTeacher ? 'Edit Teacher' : 'New Teacher'}
                </h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                  {editingTeacher ? 'Modify teacher data' : 'Enter data for the new teacher'}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-300 hover:text-[#00426B] transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {editingTeacher && (
                <div className="p-8 bg-gray-50/50 border-b border-gray-50 flex flex-col items-center gap-4">
                  <Avatar
                    url={editingTeacher.user?.photoUrl}
                    name={editingTeacher.name}
                    id={editingTeacher.user?.userId || editingTeacher.teacherId}
                    type="user"
                    size="xl"
                    className="shadow-xl ring-4 ring-white"
                  />
                  <label className="cursor-pointer bg-white border border-gray-200 px-4 py-2 text-[9px] font-black uppercase tracking-widest text-[#00426B] hover:bg-[#00426B] hover:text-white transition-all shadow-sm active:scale-95">
                    Change Photo
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={async (e) => {
                        if (e.target.files?.[0] && editingTeacher.user?.userId) {
                          const file = e.target.files[0];
                          const formData = new FormData();
                          formData.append('photo', file);
                          try {
                            const api = getApi();
                            const res = await api.post(`/upload/profile/user/${editingTeacher.user.userId}`, formData, {
                              headers: { 'Content-Type': 'multipart/form-data' }
                            });
                            toast.success("Photo updated.");
                            loadTeachers();
                            // Update local state for immediate feedback
                            setEditingTeacher({
                              ...editingTeacher,
                              user: { ...editingTeacher.user, photoUrl: res.data.photoUrl }
                            } as Teacher);
                          } catch (err) {
                            toast.error("Error uploading photo.");
                          }
                        } else if (!editingTeacher.user?.userId) {
                          toast.error("Cannot upload photo to a teacher without a linked user.");
                        }
                      }}
                    />
                  </label>
                </div>
              )}

              <form onSubmit={handleSubmit} id="teacher-form" className="p-8 space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-[#00426B] uppercase tracking-widest mb-2">Full name</label>
                  <input
                    type="text" value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-[#F8FAFC] border border-gray-100 text-sm font-bold text-[#00426B] focus:border-[#0775AB] focus:ring-1 focus:ring-[#0775AB] outline-none transition-all" required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-[#00426B] uppercase tracking-widest mb-2">Contact info (Main Email)</label>
                  <input
                    type="email" value={formData.contact}
                    onChange={e => setFormData({ ...formData, contact: e.target.value })}
                    className="w-full px-4 py-3 bg-[#F8FAFC] border border-gray-100 text-sm font-bold text-[#00426B] focus:border-[#0775AB] focus:ring-1 focus:ring-[#0775AB] outline-none transition-all"
                    placeholder="example@center.cat"
                    required
                  />
                </div>

                {!editingTeacher && (
                  <div>
                    <label className="text-[10px] font-black text-[#00426B] uppercase tracking-widest mb-2 flex justify-between">
                      Password (App Access)
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-[#0775AB] hover:underline normal-case font-bold"
                      >
                        {showPassword ? 'Hide' : 'View'}
                      </button>
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Password for the mobile App"
                      className="w-full px-4 py-3 bg-[#F8FAFC] border border-gray-100 text-sm font-bold text-[#00426B] focus:border-[#0775AB] focus:ring-1 focus:ring-[#0775AB] outline-none transition-all"
                      required={!editingTeacher}
                    />
                    <p className="mt-2 text-[9px] text-gray-400 font-bold uppercase tracking-widest leading-tight">
                      This will be the password that the teacher will use to enter the App.
                    </p>
                  </div>
                )}
              </form>
            </div>

            <div className="bg-gray-50 px-8 py-5 border-t border-gray-100 flex gap-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
              <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors">Cancel</button>
              <button type="submit" form="teacher-form" className="flex-1 py-3 bg-[#00426B] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#0775AB] transition-all shadow-lg active:scale-95">Save Teacher</button>
            </div>
          </div>
        </div>
      )}
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
