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
import Pagination from '@/components/Pagination';

export default function StudentsCRUD() {
  const t = useTranslations('StudentsPage');
  const tCommon = useTranslations('Common');

  const { user, loading: authLoading } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({ fullName: '', lastName: '', idalu: '', grade: '' });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("All");
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

  const router = useRouter();
  const params = useParams();
  const locale = params?.locale || 'ca';

  useEffect(() => {
    if (!authLoading && (!user || user.role.name !== ROLES.COORDINATOR)) {
      router.push(`/${locale}/login`);
      return;
    }
    if (user) loadStudents();
  }, [user, authLoading, router]);

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
    
    const matchesCourse = selectedCourse === "All" || a.grade === selectedCourse;
    
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
        toast.success(tCommon('save_success'));
      } else {
        await studentService.create(formData);
        toast.success(tCommon('save_success'));
      }
      setIsModalOpen(false);
      setEditingStudent(null);
      setFormData({ fullName: '', lastName: '', idalu: '', grade: '' });
      loadStudents();
    } catch (err: unknown) {
      toast.error(tCommon('save_error'));
    }
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({ fullName: student.fullName, lastName: student.lastName, idalu: student.idalu, grade: student.grade });
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    setConfirmConfig({
      isOpen: true,
      title: t('delete_title'),
      message: t('delete_msg'),
      isDestructive: true,
      onConfirm: async () => {
        try {
          await studentService.delete(id);
          loadStudents();
          toast.success(tCommon('delete_success'));
        } catch (err) {
          toast.error(tCommon('delete_error'));
        }
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const headerActions = (
    <button 
      onClick={() => { setEditingStudent(null); setFormData({ fullName: '', lastName: '', idalu: '', grade: '' }); setIsModalOpen(true); }}
      className="bg-[#00426B] text-white px-6 py-3 font-black uppercase text-[10px] tracking-widest hover:bg-[#0775AB] transition-all flex items-center gap-2 shadow-lg"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
      {t('new_student')}
    </button>
  );

  return (
    <DashboardLayout 
      title={t('title')} 
      subtitle={t('subtitle')}
      actions={headerActions}
    >
      {/* Filters Panel */}
      <div className="mb-8 flex flex-col lg:flex-row gap-6 bg-white border border-gray-200 p-8">
        <div className="flex-1">
          <label className="block text-[10px] font-black text-[#00426B] uppercase tracking-[0.2em] mb-3">{t('search_label')}</label>
          <div className="relative">
            <input 
              type="text"
              placeholder={t('search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-[#F8FAFC] border border-gray-100 focus:border-[#0775AB] focus:ring-0 text-sm font-bold text-[#00426B] placeholder:text-gray-300 transition-all"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-4 top-3.5 h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className="lg:w-64">
          <label className="block text-[10px] font-black text-[#00426B] uppercase tracking-[0.2em] mb-3">{t('filter_course')}</label>
          <select 
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full px-4 py-3 bg-[#F8FAFC] border border-gray-100 focus:border-[#0775AB] focus:ring-0 text-sm font-bold text-[#00426B] appearance-none"
          >
            <option value="All">{t('all_courses')}</option>
            {uniqueCourses.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button 
            onClick={() => { setSearchQuery(""); setSelectedCourse("All"); }}
            className="w-full lg:w-auto px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all border border-transparent hover:border-red-100 h-[46px]"
          >
            {tCommon('clear')}
          </button>
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : (
        <div className="bg-white border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-gray-200">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#00426B]">{t('table_info')}</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#00426B]">{t('table_idalu')}</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#00426B]">{t('table_course')}</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#00426B] text-right">{tCommon('table_actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedStudents.map(a => (
                  <tr key={a.studentId} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <Avatar 
                          url={a.photoUrl} 
                          name={`${a.fullName} ${a.lastName}`} 
                          id={a.studentId} 
                          type="student" 
                          size="md"
                        />
                        <div>
                          <div className="text-sm font-black text-[#00426B] uppercase tracking-tight">{a.fullName} {a.lastName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-[10px] font-bold text-gray-400 font-mono tracking-widest uppercase">{a.idalu}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="px-2 py-0.5 bg-[#EAEFF2] text-[#00426B] text-[10px] font-black uppercase tracking-widest border border-[#EAEFF2]">
                        {a.grade}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-end items-center gap-2">
                        <button onClick={() => handleEdit(a)} className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#00426B] hover:bg-[#EAEFF2] transition-colors">{tCommon('edit')}</button>
                        <button onClick={() => handleDelete(a.studentId)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredStudents.length === 0 && !loading && (
            <div className="p-20 text-center">
              <p className="text-[#00426B] font-black uppercase text-xs tracking-widest">{t('no_students')}</p>
              <p className="text-gray-400 text-[10px] uppercase font-bold mt-1 tracking-widest">{t('adjust_search')}</p>
            </div>
          )}

          {/* Paginació */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredStudents.length}
            currentItemsCount={paginatedStudents.length}
            itemName="students"
          />
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
          <div className="bg-white shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200 border border-gray-100">
            {/* Header */}
            <div className="bg-gray-50 px-8 py-5 border-b border-gray-100 flex justify-between items-center sticky top-0 z-10">
              <div>
                <h3 className="text-xl font-black text-[#00426B] uppercase tracking-tight">
                  {editingStudent ? t('edit_student_title') : t('create_student_title')}
                </h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                  {editingStudent ? t('modify_data') : t('enter_data')}
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
              {editingStudent && (
                <div className="p-8 bg-gray-50/50 border-b border-gray-50 flex flex-col items-center gap-4">
                  <Avatar 
                    url={editingStudent.photoUrl} 
                    name={`${editingStudent.fullName} ${editingStudent.lastName}`} 
                    id={editingStudent.studentId} 
                    type="student" 
                    size="xl"
                    className="shadow-xl ring-4 ring-white"
                  />
                  <label className="cursor-pointer bg-white border border-gray-200 px-4 py-2 text-[9px] font-black uppercase tracking-widest text-[#00426B] hover:bg-[#00426B] hover:text-white transition-all shadow-sm active:scale-95">
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
                            toast.error(t('upload_error'));
                          }
                        }
                      }}
                    />
                  </label>
                </div>
              )}

              <form onSubmit={handleSubmit} id="student-form" className="p-8 space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-[#00426B] uppercase tracking-widest mb-2">{t('name_label')}</label>
                  <input 
                    type="text" value={formData.fullName} 
                    onChange={e => setFormData({...formData, fullName: e.target.value})}
                    className="w-full px-4 py-3 bg-[#F8FAFC] border border-gray-100 text-sm font-bold text-[#00426B] focus:border-[#0775AB] focus:ring-1 focus:ring-[#0775AB] outline-none transition-all" required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-[#00426B] uppercase tracking-widest mb-2">{t('surnames_label')}</label>
                  <input 
                    type="text" value={formData.lastName} 
                    onChange={e => setFormData({...formData, lastName: e.target.value})}
                    className="w-full px-4 py-3 bg-[#F8FAFC] border border-gray-100 text-sm font-bold text-[#00426B] focus:border-[#0775AB] focus:ring-1 focus:ring-[#0775AB] outline-none transition-all" required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-[#00426B] uppercase tracking-widest mb-2">{t('idalu_label')}</label>
                  <input 
                    type="text" value={formData.idalu} 
                    onChange={e => setFormData({...formData, idalu: e.target.value})}
                    className="w-full px-4 py-3 bg-[#F8FAFC] border border-gray-100 text-sm font-bold text-[#00426B] focus:border-[#0775AB] focus:ring-1 focus:ring-[#0775AB] outline-none transition-all font-mono tracking-widest" required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-[#00426B] uppercase tracking-widest mb-2">{t('course_label')}</label>
                  <input 
                    type="text" value={formData.grade} 
                    onChange={e => setFormData({...formData, grade: e.target.value})}
                    className="w-full px-4 py-3 bg-[#F8FAFC] border border-gray-100 text-sm font-bold text-[#00426B] focus:border-[#0775AB] focus:ring-1 focus:ring-[#0775AB] outline-none transition-all" required
                  />
                </div>
              </form>
            </div>

            <div className="bg-gray-50 px-8 py-5 border-t border-gray-100 flex gap-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
              <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors">{tCommon('cancel')}</button>
              <button type="submit" form="student-form" className="flex-1 py-3 bg-[#00426B] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#0775AB] transition-all shadow-lg active:scale-95">{t('save_btn')}</button>
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
