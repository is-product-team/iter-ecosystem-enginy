'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
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
import { useTranslations } from 'next-intl';

export default function TeachersCRUD() {
  const t = useTranslations('TeachersPage');
  const tCommon = useTranslations('Common');

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
  const t = useTranslations('Center.Teachers');
  const tc = useTranslations('Common');
  const ta = useTranslations('Auth.login');

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
    if (!authLoading && (!user || user.role.name !== ROLES.COORDINATOR)) {
      router.push(`/${locale}/login`);
      return;
    }
    if (user) loadTeachers();
  }, [user, authLoading, router]);

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
        toast.success(tc("save_success"));
      } else {
        await teacherService.create(formData);
        toast.success(tc("save_success"));
      }
      setIsModalOpen(false);
      setEditingTeacher(null);
      setFormData({ name: '', contact: '', password: '' });
      loadTeachers();
    } catch (err: unknown) {
      toast.error((err as Error).message || tc("error_loading"));
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
      title: t('delete_title'),
      message: t('delete_confirm'),
      isDestructive: true,
      onConfirm: async () => {
        try {
          await teacherService.delete(id);
          loadTeachers();
          toast.success(tc("delete_success"));
        } catch (err) {
          toast.error(tc("delete_error"));
        }
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
  };
  const headerActions = (
    <button
      onClick={() => { setEditingTeacher(null); setFormData({ name: '', contact: '', password: '' }); setIsModalOpen(true); }}
      className="bg-consorci-darkBlue text-white px-6 py-3 font-medium text-[13px] transition-all hover:bg-black active:scale-[0.98] flex items-center gap-2"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" /></svg>
      {t('add')}
    </button>
  );

  return (
    <DashboardLayout
      title={t('title')}
      subtitle={t('description')}
      actions={headerActions}
    >
      {/* Filters Panel */}
      <div className="mb-8 flex flex-col lg:flex-row gap-6 bg-white border border-gray-200 p-8">
        <div className="flex-1">
          <label className="block text-[12px] font-medium text-text-primary mb-3">{t('search_placeholder')}</label>
          <div className="relative">
            <input
              type="text"
              placeholder={tc('search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-background-subtle border border-border-subtle focus:border-consorci-darkBlue focus:ring-0 text-sm font-medium text-text-primary placeholder:text-text-muted transition-all"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-4 top-3.5 h-5 w-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className="flex items-end">
          <button
            onClick={() => setSearchQuery("")}
            className="w-full lg:w-auto px-6 py-3 text-[12px] font-medium text-text-muted hover:text-text-primary transition-all border border-transparent h-[46px]"
          >
            {tc('clear_filters')}
          </button>
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="bg-background-surface border border-border-subtle overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-background-subtle border-b border-border-subtle">
                    <th className="px-6 py-4 text-[12px] font-medium text-text-primary">{t('table_name')}</th>
                    <th className="px-6 py-4 text-[12px] font-medium text-text-primary">{t('table_email')}</th>
                    <th className="px-6 py-4 text-[12px] font-medium text-text-primary text-right">{tc('actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
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
                            <div className="text-sm font-medium text-text-primary tracking-tight">{p.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm font-medium text-text-muted">{p.contact}</span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex justify-end items-center gap-4">
                          <button onClick={() => handleEdit(p)} className="text-[12px] font-medium text-consorci-darkBlue hover:underline transition-colors">{tc('edit')}</button>
                          <button onClick={() => handleDelete(p.teacherId)} className="text-text-muted hover:text-red-500 transition-all">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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
                <p className="text-text-primary font-medium text-sm">{tc('no_results')}</p>
                <p className="text-text-muted text-[12px] font-medium mt-2">{tc('try_other_terms')}</p>
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
            itemName={tc('teachers').toLowerCase()}
          />
        </>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-background-surface w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in slide-in-from-bottom-4 duration-500 border border-border-subtle">
            {/* Header */}
            <div className="px-10 py-8 border-b border-border-subtle flex justify-between items-start sticky top-0 bg-background-surface z-10">
              <div>
                <h3 className="text-xl font-medium text-text-primary tracking-tight">
                  {editingTeacher ? t('edit_title') : t('add')}
                </h3>
                <p className="text-[12px] font-medium text-text-muted mt-2">
                  {editingTeacher ? t('edit_subtitle') : t('add_subtitle')}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-text-muted hover:text-text-primary transition-colors mt-1"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {editingTeacher && (
                <div className="p-10 border-b border-border-subtle flex flex-col items-center gap-6">
                  <Avatar
                    url={editingTeacher.user?.photoUrl}
                    name={editingTeacher.name}
                    id={editingTeacher.user?.userId || editingTeacher.teacherId}
                    type="user"
                    size="xl"
                  />
                  <label className="cursor-pointer bg-background-subtle border border-border-subtle px-6 py-2 text-[11px] font-medium text-text-primary hover:bg-background-surface transition-all active:scale-95">
                    {t('change_photo')}
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
                            const apiInstance = getApi();
                            const res = await apiInstance.post(`/upload/profile/user/${editingTeacher.user.userId}`, formData, {
                              headers: { 'Content-Type': 'multipart/form-data' }
                            });
                            toast.success(t("photo_success"));
                            loadTeachers();
                            // Update local state for immediate feedback
                            setEditingTeacher({
                              ...editingTeacher,
                              user: { ...editingTeacher.user, photoUrl: res.data.photoUrl }
                            } as Teacher);
                          } catch (err) {
                            toast.error(t("photo_error"));
                          }
                        } else if (!editingTeacher.user?.userId) {
                          toast.error(t("no_user_photo_error"));
                        }
                      }}
                    />
                  </label>
                </div>
              )}

              <form onSubmit={handleSubmit} id="teacher-form" className="p-10 space-y-8">
                <div className="space-y-2">
                  <label className="block text-[12px] font-medium text-text-primary px-1">{t('form_name')}</label>
                  <input
                    type="text" value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-background-subtle border border-border-subtle text-sm font-medium text-text-primary focus:border-consorci-darkBlue outline-none transition-all appearance-none" required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[12px] font-medium text-text-primary px-1">{t('form_email')}</label>
                  <input
                    type="email" value={formData.contact}
                    onChange={e => setFormData({ ...formData, contact: e.target.value })}
                    className="w-full px-4 py-3 bg-background-subtle border border-border-subtle text-sm font-medium text-text-primary focus:border-consorci-darkBlue outline-none transition-all appearance-none"
                    placeholder="example@center.cat"
                    required
                  />
                </div>

                {!editingTeacher && (
                  <div className="space-y-2">
                    <label className="text-[12px] font-medium text-text-primary px-1 flex justify-between">
                      {ta('password')}
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-consorci-darkBlue hover:underline font-medium"
                      >
                        {showPassword ? tc('hide') : tc('show')}
                      </button>
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      placeholder={t('password_placeholder')}
                      className="w-full px-4 py-3 bg-background-subtle border border-border-subtle text-sm font-medium text-text-primary focus:border-consorci-darkBlue outline-none transition-all appearance-none"
                      required={!editingTeacher}
                    />
                  </div>
                )}
              </form>
            </div>

            <div className="p-10 border-t border-border-subtle flex gap-4 bg-background-surface">
              <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-[13px] font-medium text-text-muted hover:text-text-primary hover:underline transition-colors">{tc('cancel')}</button>
              <button type="submit" form="teacher-form" className="flex-1 py-3 bg-consorci-darkBlue text-white text-[13px] font-medium transition-all hover:bg-black active:scale-[0.98]">{t('save_btn')}</button>
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
