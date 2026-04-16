'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/context/AuthContext';
import { ROLES } from '@iter/shared';
import DashboardLayout from '@/components/DashboardLayout';
import getApi from '@/services/api';
import studentService, { Student } from '@/services/studentService';
import Loading from '@/components/Loading';
import { toast } from 'sonner';
import ConfirmDialog from '@/components/ConfirmDialog';
import Avatar from '@/components/Avatar';
import DataTable, { Column } from '@/components/ui/DataTable';

export default function StudentsCRUD() {
  const t = useTranslations('Center.Students');
  const tc = useTranslations('Common');
  
  const { user, loading: authLoading } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({ fullName: '', lastName: '', idalu: '', grade: '' });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(t("all_courses"));
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
  const params = useParams();
  const locale = params?.locale || 'ca';

  useEffect(() => {
    if (!authLoading && (!user || user.role.name !== ROLES.COORDINATOR)) {
      router.push(`/${locale}/login`);
      return;
    }
    if (user) loadStudents();
  }, [user, authLoading, router, locale]);

  const loadStudents = async () => {
    try {
      const data = await studentService.getAll();
      setStudents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(a => {
    const matchesSearch = !searchQuery ||
      a.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.idalu.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCourse = selectedCourse === t("all_courses") || a.grade === selectedCourse;

    return matchesSearch && matchesCourse;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCourse]);

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const uniqueCourses = Array.from(new Set(students.map(a => a.grade))).filter(Boolean).sort();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingStudent) {
        await studentService.update(editingStudent.studentId, formData);
        toast.success(tc("save_success"));
      } else {
        await studentService.create(formData);
        toast.success(tc("save_success"));
      }
      setIsModalOpen(false);
      setEditingStudent(null);
      setFormData({ fullName: '', lastName: '', idalu: '', grade: '' });
      loadStudents();
    } catch (err: unknown) {
      toast.error((err as Error).message || tc("error_loading"));
    }
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({ 
      fullName: student.fullName || '', 
      lastName: student.lastName || '', 
      idalu: student.idalu || '', 
      grade: student.grade || '' 
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
          await studentService.delete(id);
          loadStudents();
          toast.success(tc("delete_success"));
        } catch (err) {
          toast.error(tc("delete_error"));
        }
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const columns: Column<Student>[] = [
    {
      header: "ID",
      render: (a) => <span className="table-id">{a.studentId}</span>,
      width: 60,
      align: 'center'
    },
    {
      header: "",
      render: (a) => (
        <Avatar
          url={a.photoUrl}
          name={`${a.fullName} ${a.lastName}`}
          id={a.studentId}
          type="student"
          size="sm"
        />
      ),
      width: 50,
      align: 'center'
    },
    {
      header: "Nom",
      render: (a) => <span className="table-primary">{a.fullName}</span>,
      width: 150
    },
    {
      header: "Cognoms",
      render: (a) => <span className="table-primary">{a.lastName}</span>,
      width: 180
    },
    {
      header: "IDALU",
      render: (a) => (
        <span className="table-id font-bold">{a.idalu}</span>
      ),
      width: 120,
      align: 'center'
    },
    {
      header: "Curs",
      render: (a) => (
        <span className="table-tag-blue">
          {a.grade}
        </span>
      ),
      width: 120,
      align: 'center'
    },
    {
      header: tc('actions'),
      align: 'right',
      render: (a) => (
        <div className="flex justify-end items-center gap-4">
          <button onClick={(e) => { e.stopPropagation(); handleEdit(a); }} className="text-[12px] font-medium text-consorci-darkBlue hover:underline transition-colors">{tc('edit')}</button>
          <button onClick={(e) => { e.stopPropagation(); handleDelete(a.studentId); }} className="text-text-muted hover:text-red-500 transition-all">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      )
    }
  ];

  const headerActions = (
    <button
      onClick={() => { setEditingStudent(null); setFormData({ fullName: '', lastName: '', idalu: '', grade: '' }); setIsModalOpen(true); }}
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
          <label className="block text-[11px] font-bold text-text-muted px-1 uppercase tracking-wider">Cercar</label>
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

        <div className="lg:w-64">
          <label className="block text-[11px] font-bold text-text-muted px-1 uppercase tracking-wider">Curs</label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full px-4 py-3 bg-background-subtle border border-border-subtle focus:border-consorci-darkBlue focus:ring-0 text-sm font-medium text-text-primary appearance-none transition-all"
          >
            <option value={t("all_courses")}>{t("all_courses")}</option>
            {uniqueCourses.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={() => { setSearchQuery(""); setSelectedCourse(t("all_courses")); }}
            className="w-full lg:w-auto px-6 py-3 text-[12px] font-medium text-text-muted hover:text-text-primary transition-all border border-transparent h-[46px]"
          >
            {tc('clear_filters')}
          </button>
        </div>
      </div>

      <DataTable
        data={paginatedStudents}
        columns={columns}
        loading={loading}
        emptyMessage={tc('no_results')}
        pagination={{
          currentPage,
          totalPages,
          onPageChange: setCurrentPage,
          totalItems: filteredStudents.length,
          itemName: tc('students').toLowerCase()
        }}
      />

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-background-surface w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in slide-in-from-bottom-4 duration-500 border border-border-subtle">
            {/* Header */}
            <div className="px-10 py-8 border-b border-border-subtle flex justify-between items-start sticky top-0 bg-background-surface z-10">
              <div>
                <h3 className="text-xl font-medium text-text-primary tracking-tight">
                  {editingStudent ? t('edit_title') : t('add')}
                </h3>
                <p className="text-[12px] font-medium text-text-muted mt-2">
                  {editingStudent ? t('edit_subtitle') : t('add_subtitle')}
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
              {editingStudent && (
                <div className="p-10 border-b border-border-subtle flex flex-col items-center gap-6">
                  <Avatar
                    url={editingStudent.photoUrl}
                    name={`${editingStudent.fullName} ${editingStudent.lastName}`}
                    id={editingStudent.studentId}
                    type="student"
                    size="xl"
                  />
                  <label className="cursor-pointer bg-background-subtle border border-border-subtle px-6 py-2 text-[11px] font-medium text-text-primary hover:bg-background-surface transition-all active:scale-95">
                    {t('change_photo')}
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={async (e) => {
                        if (e.target.files?.[0]) {
                          const file = e.target.files[0];
                          const formData = new FormData();
                          formData.append('foto', file);
                          try {
                            const api = getApi();
                            const res = await api.post(`/upload/profile/student/${editingStudent.studentId}`, formData, {
                              headers: { 'Content-Type': 'multipart/form-data' }
                            });
                            toast.success(t('photo_success'));
                            loadStudents();
                            setEditingStudent({ ...editingStudent, photoUrl: res.data.photoUrl });
                          } catch (err: unknown) {
                            toast.error(t('photo_error'));
                          }
                        }
                      }}
                    />
                  </label>
                </div>
              )}

              <form onSubmit={handleSubmit} id="student-form" className="p-10 space-y-8">
                <div className="space-y-2">
                  <label className="block text-[12px] font-medium text-text-primary px-1">{t('form_name')}</label>
                  <input
                    type="text" value={formData.fullName}
                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-4 py-3 bg-background-subtle border border-border-subtle text-sm font-medium text-text-primary focus:border-consorci-darkBlue outline-none transition-all appearance-none" required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[12px] font-medium text-text-primary px-1">{t('form_surnames')}</label>
                  <input
                    type="text" value={formData.lastName}
                    onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-4 py-3 bg-background-subtle border border-border-subtle text-sm font-medium text-text-primary focus:border-consorci-darkBlue outline-none transition-all appearance-none" required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[12px] font-medium text-text-primary px-1">{t('form_idalu')}</label>
                  <input
                    type="text" value={formData.idalu}
                    onChange={e => setFormData({ ...formData, idalu: e.target.value })}
                    className="w-full px-4 py-3 bg-background-subtle border border-border-subtle text-sm font-medium text-text-primary focus:border-consorci-darkBlue outline-none transition-all font-mono appearance-none" required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[12px] font-medium text-text-primary px-1">{t('form_course')}</label>
                  <input
                    type="text" value={formData.grade}
                    onChange={e => setFormData({ ...formData, grade: e.target.value })}
                    className="w-full px-4 py-3 bg-background-subtle border border-border-subtle text-sm font-medium text-text-primary focus:border-consorci-darkBlue outline-none transition-all appearance-none" required
                  />
                </div>
              </form>
            </div>

            <div className="p-10 border-t border-border-subtle flex gap-4 bg-background-surface">
              <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-[13px] font-medium text-text-muted hover:text-text-primary hover:underline transition-colors">{tc('cancel')}</button>
              <button type="submit" form="student-form" className="flex-1 py-3 bg-consorci-darkBlue text-white text-[13px] font-medium transition-all hover:bg-black active:scale-[0.98]">{t('save_btn')}</button>
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
