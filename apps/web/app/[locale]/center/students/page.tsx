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
import Button from '@/components/ui/Button';
import { toast } from 'sonner';
import ConfirmDialog from '@/components/ConfirmDialog';
import Avatar from '@/components/Avatar';
import DataTable, { Column } from '@/components/ui/DataTable';
import DataTableToolbar, { FilterSelect } from '@/components/ui/DataTableToolbar';

export default function StudentsCRUD() {
  const t = useTranslations('Center.Students');
  const tc = useTranslations('Common');
  
  const { user, loading: authLoading } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({ 
    fullName: '', 
    lastName: '', 
    idalu: '', 
    grade: '',
    dni: '',
    phone: '',
    email: '',
    gender: '',
    birthDate: '',
    emergencyContact: '',
    emergencyPhone: '',
    notes: ''
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(t("all_courses"));
  const [groupBy, setGroupBy] = useState<string | null>(null);

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
    if (user) loadStudents();
  }, [user]);

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
      setFormData({ 
        fullName: '', 
        lastName: '', 
        idalu: '', 
        grade: '',
        dni: '',
        phone: '',
        email: '',
        gender: '',
        birthDate: '',
        emergencyContact: '',
        emergencyPhone: '',
        notes: ''
      });
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
      grade: student.grade || '',
      dni: student.dni || '',
      phone: student.phone || '',
      email: student.email || '',
      gender: student.gender || '',
      birthDate: student.birthDate ? new Date(student.birthDate).toISOString().split('T')[0] : '',
      emergencyContact: student.emergencyContact || '',
      emergencyPhone: student.emergencyPhone || '',
      notes: student.notes || ''
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
      render: (a) => <span className="table-primary font-bold">{a.fullName}</span>,
      width: 150
    },
    {
      header: "Cognoms",
      render: (a) => <span className="table-primary">{a.lastName}</span>,
      width: 180
    },
    {
      header: "DNI",
      render: (a) => <span className="table-id font-bold uppercase">{a.dni || '-'}</span>,
      width: 120,
      align: 'center'
    },
    {
      header: "Telèfon",
      render: (a) => <span className="table-detail font-medium">{a.phone || '-'}</span>,
      width: 130,
      align: 'center'
    },
    {
      header: "IDALU",
      render: (a) => (
        <span className="table-id font-bold">{a.idalu}</span>
      ),
      width: 100,
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
      header: "Email",
      render: (a) => <span className="table-detail">{a.email || '-'}</span>,
      width: 200
    },
    {
      header: "Gènere",
      render: (a) => (
        <span className="table-tag-gray">
          {a.gender?.substring(0, 1) || '-'}
        </span>
      ),
      width: 80,
      align: 'center'
    },
    {
      header: "Naixement",
      render: (a) => <span className="table-id">{a.birthDate ? new Date(a.birthDate).toLocaleDateString() : '-'}</span>,
      width: 120,
      align: 'center'
    },
    {
      header: "Emergència",
      render: (a) => (
        <div className="flex flex-col">
          <span className="table-detail font-bold">{a.emergencyContact || '-'}</span>
          <span className="table-id">{a.emergencyPhone || ''}</span>
        </div>
      ),
      width: 180
    },
    {
      header: "Notes",
      render: (a) => <span className="table-id italic opacity-60 truncate block max-w-[150px]">{a.notes || '-'}</span>,
      width: 150
    },
    {
      header: tc('actions'),
      align: 'right',
      render: (a) => (
        <div className="flex justify-end items-center gap-4">
          <Button 
            onClick={(e) => { e.stopPropagation(); handleEdit(a); }} 
            variant="subtle" 
            size="sm"
          >
            {tc('edit')}
          </Button>
          <Button 
            onClick={(e) => { e.stopPropagation(); handleDelete(a.studentId); }} 
            variant="subtle" 
            size="sm"
            className="hover:!text-red-500 hover:!bg-red-50"
            title={tc('delete')}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </Button>
        </div>
      )
    }
  ];

  const headerActions = (
    <Button
      onClick={() => { 
        setEditingStudent(null); 
        setFormData({ 
          fullName: '', 
          lastName: '', 
          idalu: '', 
          grade: '',
          dni: '',
          phone: '',
          email: '',
          gender: '',
          birthDate: '',
          emergencyContact: '',
          emergencyPhone: '',
          notes: ''
        }); 
        setIsModalOpen(true); 
      }}
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
        onClear={() => {
          setSearchQuery("");
          setSelectedCourse(t("all_courses"));
        }}
        filters={
          <FilterSelect
            label="Curs"
            value={selectedCourse}
            onChange={setSelectedCourse}
            options={[
              { label: t("all_courses"), value: t("all_courses") },
              ...uniqueCourses.map(c => ({ label: c, value: c }))
            ]}
          />
        }
        groups={{
          value: groupBy || '',
          onChange: setGroupBy,
          options: [
            { label: 'Curs', value: 'grade' },
            { label: 'Gènere', value: 'gender' }
          ]
        }}
      />

      <DataTable
        data={filteredStudents}
        columns={columns}
        loading={loading}
        emptyMessage={tc('no_results')}
        getRowId={a => a.studentId}
        hideTopBorder
        groupBy={groupBy}
        onGroupByChange={setGroupBy}
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
              {editingStudent && (
                <div className="p-10 border-b border-border-subtle flex flex-col items-center gap-6">
                  <Avatar
                    url={editingStudent.photoUrl}
                    name={`${editingStudent.fullName} ${editingStudent.lastName}`}
                    id={editingStudent.studentId}
                    type="student"
                    size="xl"
                    editable
                    onUpload={(newUrl) => {
                        loadStudents();
                        setEditingStudent({ ...editingStudent, photoUrl: newUrl });
                    }}
                  />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">Clica la foto per canviar-la</p>
                </div>
              )}

              <form onSubmit={handleSubmit} id="student-form" className="p-10 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="block text-[12px] font-medium text-text-primary px-1">{t('form_idalu')}</label>
                    <input
                      type="text" value={formData.idalu}
                      onChange={e => setFormData({ ...formData, idalu: e.target.value })}
                      className="w-full px-4 py-3 bg-background-subtle border border-border-subtle text-sm font-medium text-text-primary focus:border-consorci-darkBlue outline-none transition-all font-mono appearance-none" required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[12px] font-medium text-text-primary px-1">DNI / NIE</label>
                    <input
                      type="text" value={formData.dni}
                      onChange={e => setFormData({ ...formData, dni: e.target.value })}
                      className="w-full px-4 py-3 bg-background-subtle border border-border-subtle text-sm font-medium text-text-primary focus:border-consorci-darkBlue outline-none transition-all font-mono uppercase appearance-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="block text-[12px] font-medium text-text-primary px-1">Email</label>
                    <input
                      type="email" value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-background-subtle border border-border-subtle text-sm font-medium text-text-primary focus:border-consorci-darkBlue outline-none transition-all appearance-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[12px] font-medium text-text-primary px-1">Telèfon</label>
                    <input
                      type="tel" value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-background-subtle border border-border-subtle text-sm font-medium text-text-primary focus:border-consorci-darkBlue outline-none transition-all appearance-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-2">
                    <label className="block text-[12px] font-medium text-text-primary px-1">{t('form_course')}</label>
                    <input
                      type="text" value={formData.grade}
                      onChange={e => setFormData({ ...formData, grade: e.target.value })}
                      className="w-full px-4 py-3 bg-background-subtle border border-border-subtle text-sm font-medium text-text-primary focus:border-consorci-darkBlue outline-none transition-all appearance-none" required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[12px] font-medium text-text-primary px-1">Data Naixement</label>
                    <input
                      type="date" value={formData.birthDate}
                      onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
                      className="w-full px-4 py-3 bg-background-subtle border border-border-subtle text-sm font-medium text-text-primary focus:border-consorci-darkBlue outline-none transition-all appearance-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[12px] font-medium text-text-primary px-1">Gènere</label>
                    <select
                      value={formData.gender}
                      onChange={e => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-4 py-3 bg-background-subtle border border-border-subtle text-sm font-medium text-text-primary focus:border-consorci-darkBlue outline-none transition-all appearance-none"
                    >
                      <option value="">Selecciona...</option>
                      <option value="Masc">Masculí</option>
                      <option value="Fem">Femení</option>
                      <option value="Altres">Altres</option>
                    </select>
                  </div>
                </div>

                <div className="border-t border-border-subtle pt-8">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-6">Contacte d&apos;Emergència</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="block text-[12px] font-medium text-text-primary px-1">Nom de Contacte</label>
                      <input
                        type="text" value={formData.emergencyContact}
                        onChange={e => setFormData({ ...formData, emergencyContact: e.target.value })}
                        className="w-full px-4 py-3 bg-background-subtle border border-border-subtle text-sm font-medium text-text-primary focus:border-consorci-darkBlue outline-none transition-all appearance-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[12px] font-medium text-text-primary px-1">Telèfon Emergència</label>
                      <input
                        type="tel" value={formData.emergencyPhone}
                        onChange={e => setFormData({ ...formData, emergencyPhone: e.target.value })}
                        className="w-full px-4 py-3 bg-background-subtle border border-border-subtle text-sm font-medium text-text-primary focus:border-consorci-darkBlue outline-none transition-all appearance-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[12px] font-medium text-text-primary px-1">Observacions</label>
                  <textarea
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 bg-background-subtle border border-border-subtle text-sm font-medium text-text-primary focus:border-consorci-darkBlue outline-none transition-all appearance-none resize-none"
                  />
                </div>
              </form>
            </div>

            <div className="p-10 border-t border-border-subtle flex gap-4 bg-background-surface">
              <Button type="button" onClick={() => setIsModalOpen(false)} variant="outline" className="flex-1 !py-3">{tc('cancel')}</Button>
              <Button type="submit" form="student-form" variant="primary" className="flex-1 !py-3">{t('save_btn')}</Button>
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
