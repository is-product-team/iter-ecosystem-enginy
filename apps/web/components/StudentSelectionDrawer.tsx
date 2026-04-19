'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import studentService, { Student } from '@/services/studentService';
import { Enrollment } from '@/services/assignmentService';
import Loading from '@/components/Loading';
import Avatar from '@/components/Avatar';
import Button from '@/components/ui/Button';

interface StudentSelectionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (selectedIds: number[]) => Promise<void>;
  initialSelectedIds: number[];
  maxSeats: number;
}

export default function StudentSelectionDrawer({
  isOpen,
  onClose,
  onSave,
  initialSelectedIds,
  maxSeats
}: StudentSelectionDrawerProps) {
  const t = useTranslations('Center.Students');
  const tCommon = useTranslations('Common');
  
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>(initialSelectedIds);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSelectedIds(initialSelectedIds);
      fetchStudents();
    }
  }, [isOpen, initialSelectedIds]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await studentService.getAll();
      setStudents(res || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleStudent = (idStudent: number) => {
    setSelectedIds(prev => {
      const isSelected = prev.includes(idStudent);
      if (!isSelected && prev.length >= maxSeats) {
        return prev;
      }
      return isSelected
        ? prev.filter(i => i !== idStudent)
        : [...prev, idStudent];
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(selectedIds);
      onClose();
    } catch (error) {
      console.error('Error saving selection:', error);
    } finally {
      setSaving(false);
    }
  };

  const filteredStudents = students.filter(s =>
    s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.idalu.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Drawer Content */}
      <div className="relative w-full max-w-lg bg-background-surface border-l border-border-subtle shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-8 border-b border-border-subtle bg-background-subtle flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium text-text-primary tracking-tight">{t('selection_drawer.title')}</h3>
            <p className="text-[12px] font-medium text-text-muted mt-1">
              {t('selection_drawer.selected', { count: selectedIds.length, total: maxSeats })}
            </p>
          </div>
          <Button
            variant="subtle"
            size="sm"
            onClick={onClose}
            className="text-text-muted hover:!text-red-500 !p-1"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </Button>
        </div>

        <div className="p-8 border-b border-border-subtle bg-background-surface">
          <div className="relative">
            <input 
              type="text"
              placeholder={t('search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-background-subtle border border-border-subtle text-sm font-medium text-text-primary focus:border-consorci-darkBlue outline-none transition-all"
            />
            <svg className="absolute left-3.5 top-3.5 h-4 w-4 text-text-muted opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading ? (
            <div className="py-20 flex justify-center"><Loading /></div>
          ) : filteredStudents.length === 0 ? (
            <div className="py-20 text-center text-text-muted text-[13px]">{tCommon('no_results')}</div>
          ) : (
            filteredStudents.map(student => {
              const isSelected = selectedIds.includes(student.studentId);
              const isDisabled = !isSelected && selectedIds.length >= maxSeats;
              
              return (
                <div 
                  key={student.studentId}
                  onClick={() => !isDisabled && toggleStudent(student.studentId)}
                  className={`flex items-center gap-4 p-4 border transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-consorci-darkBlue/5 border-consorci-darkBlue/20' 
                      : isDisabled 
                        ? 'opacity-40 cursor-not-allowed border-border-subtle' 
                        : 'bg-background-surface border-border-subtle hover:bg-background-subtle'
                  }`}
                >
                  <div className={`w-5 h-5 border-2 flex items-center justify-center transition-all ${
                    isSelected ? 'bg-consorci-darkBlue border-consorci-darkBlue text-white' : 'bg-background-surface border-border-subtle'
                  }`}>
                    {isSelected && <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" /></svg>}
                  </div>
                  <Avatar url={student.photoUrl} name={student.fullName} size="sm" type="student" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-text-primary truncate">{student.fullName} {student.lastName}</p>
                    <p className="text-[10px] font-medium text-text-muted">{student.idalu} • {student.grade}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="p-8 bg-background-subtle border-t border-border-subtle flex gap-4">
          <Button 
            onClick={onClose}
            variant="outline"
            fullWidth
            disabled={saving || loading}
          >
            {tCommon('cancel')}
          </Button>
          <Button 
            onClick={handleSave}
            variant="primary"
            fullWidth
            loading={saving}
          >
            {saving ? tCommon('loading') : tCommon('save')}
          </Button>
        </div>
      </div>
    </div>
  );
}
