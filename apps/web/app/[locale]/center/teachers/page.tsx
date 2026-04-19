'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/context/AuthContext';
import { ROLES } from '@iter/shared';
import DashboardLayout from '@/components/DashboardLayout';
import teacherService, { Teacher } from '@/services/teacherService';
import Loading from '@/components/Loading';
import Button from '@/components/ui/Button';
import { toast } from 'sonner';
import ConfirmDialog from '@/components/ConfirmDialog';
import Avatar from '@/components/Avatar';
import getApi from '@/services/api';
import DataTable, { Column } from '@/components/ui/DataTable';
import DataTableToolbar, { FilterSelect } from '@/components/ui/DataTableToolbar';

export default function TeachersCRUD() {
  const t = useTranslations('Center.Teachers');
  const tc = useTranslations('Common');
  const ta = useTranslations('Auth.login');

  const { user, loading: authLoading } = useAuth();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [formData, setFormData] = useState({ name: '', contact: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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
  }, [user, authLoading, router, locale]);

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
    setFormData({ 
      name: teacher.name || '', 
      contact: teacher.contact || '', 
      password: '' 
    });
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

  const columns: Column<Teacher>[] = [
    {
      header: "",
      render: (p) => (
        <Avatar
          url={p.user?.photoUrl}
          name={p.name}
          id={p.user?.userId || p.teacherId}
          type="user"
          size="sm"
          email={p.user?.email}
        />
      ),
      width: 50,
      align: 'center'
    },
    {
      header: "Nom",
      render: (p) => <span className="table-primary">{p.name}</span>,
      width: 250
    },
    {
      header: "Email",
      render: (p) => (
        <span className="table-detail">{p.contact}</span>
      ),
      width: 200
    },
    {
      header: tc('actions'),
      align: 'right',
      render: (p) => (
        <div className="flex justify-end items-center gap-4">
          <Button 
            onClick={(e) => { e.stopPropagation(); handleEdit(p); }} 
            variant="subtle" 
            size="sm"
          >
            {tc('edit')}
          </Button>
          <Button 
            onClick={(e) => { e.stopPropagation(); handleDelete(p.teacherId); }} 
            variant="subtle" 
            size="sm"
            className="hover:!text-red-500 hover:!bg-red-50"
            title={tc('delete')}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </Button>
        </div>
      ),
      width: 150
    }
  ];

  const headerActions = (
    <Button
      onClick={() => { setEditingTeacher(null); setFormData({ name: '', contact: '', password: '' }); setIsModalOpen(true); }}
      variant="primary"
      size="md"
      className="!px-6 !py-3"
      icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" /></svg>}
    >
      {t('add')}
    </Button>
  );

  return (
    <DashboardLayout
      title={t('title')}
      subtitle={t('description')}
      actions={headerActions}
    >
      <DataTableToolbar
        search={{
          value: searchQuery,
          onChange: setSearchQuery,
          placeholder: tc('search_placeholder')
        }}
        onClear={() => setSearchQuery("")}
      />

      <DataTable
        data={filteredTeachers}
        columns={columns}
        loading={loading}
        emptyMessage={tc('no_results')}
        getRowId={p => p.teacherId}
        hideTopBorder
      />

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
              <Button
                onClick={() => setIsModalOpen(false)}
                variant="subtle"
                size="sm"
                className="mt-1 !p-1"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </Button>
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
                    editable
                    onUpload={(newUrl) => {
                        loadTeachers();
                        setEditingTeacher({
                            ...editingTeacher,
                            user: { ...editingTeacher.user, photoUrl: newUrl }
                        } as Teacher);
                    }}
                  />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">Clica la foto per canviar-la</p>
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
              <Button type="button" onClick={() => setIsModalOpen(false)} variant="outline" className="flex-1 !py-3">{tc('cancel')}</Button>
              <Button type="submit" form="teacher-form" variant="primary" className="flex-1 !py-3">{t('save_btn')}</Button>
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
