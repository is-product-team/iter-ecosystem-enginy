'use client';

import { useEffect, useState, use, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/context/AuthContext';
import { ROLES } from '@iter/shared';
import DashboardLayout from '@/components/DashboardLayout';
import getApi from '@/services/api';
import Loading from '@/components/Loading';
import { toast } from 'sonner';
import DataTable, { Column } from '@/components/ui/DataTable';

interface AttendanceRecord {
  attendanceId: number;
  enrollmentId: number;
  sessionNumber: number;
  sessionDate: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'JUSTIFIED_ABSENCE';
  observations: string | null;
  enrollment: {
    student: {
      fullName: string;
      lastName: string;
      idalu: string;
    };
  };
}

export default function AttendancePage({ params }: { params: Promise<{ id: string, num: string }> }) {
  const { id, num } = use(params);
  const t = useTranslations('Center.Attendance');
  const { user, loading: authLoading } = useAuth();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sessionDate, setSessionDate] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && (!user || user.role.name !== ROLES.COORDINATOR)) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const fetchData = useCallback(async () => {
    try {
      const api = getApi();
      const res = await api.get(`/assignments/${id}/sessions/${num}`);
      setAttendance(res.data);
      if (res.data.length > 0) {
        setSessionDate(res.data[0].sessionDate);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
      toast.error(t('error_load'));
    } finally {
      setLoading(false);
    }
  }, [id, num, t]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, fetchData]);

  const handleStatusChange = (enrollmentId: number, newStatus: AttendanceRecord['status']) => {
    setAttendance(prev => prev.map(record =>
      record.enrollmentId === enrollmentId ? { ...record, status: newStatus } : record
    ));
  };

  const handleObservationChange = (enrollmentId: number, text: string) => {
    setAttendance(prev => prev.map(record =>
      record.enrollmentId === enrollmentId ? { ...record, observations: text } : record
    ));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const api = getApi();
      const payload = attendance.map(r => ({
        enrollmentId: r.enrollmentId,
        status: r.status,
        observations: r.observations
      }));

      await api.post(`/assignments/${id}/sessions/${num}`, payload);
      toast.success(t('success_save'));
      router.push(`/center/sessions/${id}`);
    } catch (error) {
      console.error('Error saving attendance:', error);
      toast.error(t('error_save'));
    } finally {
      setSaving(false);
    }
  };

  const statusOptions = [
    { value: 'PRESENT', label: t('status_present'), color: 'bg-green-500', icon: 'M5 13l4 4L19 7' },
    { value: 'ABSENT', label: t('status_absent'), color: 'bg-red-500', icon: 'M6 18L18 6M6 6l12 12' },
    { value: 'LATE', label: t('status_late'), color: 'bg-orange-500', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { value: 'JUSTIFIED_ABSENCE', label: t('status_justified'), color: 'bg-blue-500', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
  ];

  const columns: Column<AttendanceRecord>[] = [
    {
      header: t('table_student'),
      render: (record) => (
        <div className="flex flex-col">
          <span className="text-sm font-black text-[#00426B] uppercase tracking-tight">
            {record.enrollment.student.lastName}, {record.enrollment.student.fullName}
          </span>
          <span className="text-[10px] font-bold text-gray-400 mt-1 uppercase">IDALU: {record.enrollment.student.idalu}</span>
        </div>
      )
    },
    {
      header: t('table_status'),
      align: 'center',
      render: (record) => (
        <div className="flex justify-center gap-2">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleStatusChange(record.enrollmentId, opt.value as any)}
              title={opt.label}
              className={`w-10 h-10 flex items-center justify-center transition-all duration-200 border-2 ${record.status === opt.value
                  ? `${opt.color} border-transparent text-white shadow-lg scale-110`
                  : 'bg-white border-gray-100 text-gray-300 hover:border-gray-300'
                }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d={opt.icon} />
              </svg>
            </button>
          ))}
        </div>
      )
    },
    {
      header: t('table_observations'),
      render: (record) => (
        <input
          type="text"
          value={record.observations || ''}
          onChange={(e) => handleObservationChange(record.enrollmentId, e.target.value)}
          placeholder={t('observations_none')}
          className="w-full bg-[#F8FAFC] border-none text-[12px] font-medium text-[#00426B] placeholder:text-gray-200 focus:ring-1 focus:ring-[#0775AB] py-2 px-3"
        />
      )
    }
  ];

  if (authLoading || loading) return <Loading fullScreen message={t('loading')} />;

  return (
    <DashboardLayout
      title={t('title', { num })}
      subtitle={sessionDate ? new Date(sessionDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase() : `Assignment ${id}`}
    >
      <div className="mb-10 flex justify-between items-center bg-background-surface p-8 border border-border-subtle">
        <button
          onClick={() => router.back()}
          className="text-[11px] font-bold text-text-muted hover:text-consorci-darkBlue uppercase tracking-widest flex items-center gap-2 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          {t('back_to_sessions')}
        </button>

        <button
          onClick={handleSave}
          disabled={saving}
          className={`px-10 py-3.5 text-[11px] font-bold uppercase tracking-widest transition-all flex items-center gap-3 ${saving ? 'bg-background-subtle text-text-muted' : 'bg-consorci-darkBlue text-white hover:bg-black active:scale-[0.98]'}`}
        >
          {saving ? t('saving') : t('save_attendance')}
          {!saving && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
        </button>
      </div>

      <DataTable
        data={attendance}
        columns={columns}
        emptyMessage={t('no_students')}
      />
    </DashboardLayout>
  );
}
