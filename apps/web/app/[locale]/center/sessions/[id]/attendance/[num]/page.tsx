'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ROLES } from '@iter/shared';
import DashboardLayout from '@/components/DashboardLayout';
import getApi from '@/services/api';
import Loading from '@/components/Loading';
import { toast } from 'sonner';

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

  const fetchData = async () => {
    try {
      const api = getApi();
      const res = await api.get(`/assignments/${id}/sessions/${num}`);
      setAttendance(res.data);
      if (res.data.length > 0) {
        setSessionDate(res.data[0].sessionDate);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
      toast.error('Error loading attendance list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, id, num]);

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
      toast.success('Attendance saved successfully');
      router.push(`/center/sessions/${id}`);
    } catch (error) {
      console.error('Error saving attendance:', error);
      toast.error('Error saving attendance');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) return <Loading fullScreen message="Loading attendance list..." />;

  const statusOptions = [
    { value: 'PRESENT', label: 'Present', color: 'bg-green-500', icon: 'M5 13l4 4L19 7' },
    { value: 'ABSENT', label: 'Absent', color: 'bg-red-500', icon: 'M6 18L18 6M6 6l12 12' },
    { value: 'LATE', label: 'Late', color: 'bg-orange-500', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { value: 'JUSTIFIED_ABSENCE', label: 'Justified', color: 'bg-blue-500', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
  ];

  return (
    <DashboardLayout
      title={`Session ${num} Attendance`}
      subtitle={sessionDate ? new Date(sessionDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase() : `Assignment ${id}`}
    >
      <div className="mb-8 flex justify-between items-center bg-white p-6 border border-gray-100 shadow-sm">
        <button
          onClick={() => router.back()}
          className="text-xs font-bold text-[#4197CB] hover:text-[#00426B] uppercase tracking-widest flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Sessions
        </button>

        <button
          onClick={handleSave}
          disabled={saving}
          className={`bg-[#00426B] text-white px-10 py-3 text-[11px] font-black uppercase tracking-[0.2em] hover:bg-[#0775AB] transition-all shadow-xl flex items-center gap-3 ${saving ? 'opacity-50' : ''}`}
        >
          {saving ? 'Saving...' : 'Save Attendance'}
          {!saving && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
        </button>
      </div>

      <div className="bg-white border border-gray-200 shadow-sm overflow-hidden mb-20">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-8 py-5 text-[10px] font-black text-[#00426B] uppercase tracking-widest">Student</th>
              <th className="px-8 py-5 text-[10px] font-black text-[#00426B] uppercase tracking-widest text-center">Status</th>
              <th className="px-8 py-5 text-[10px] font-black text-[#00426B] uppercase tracking-widest">Observations</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {attendance.map((record) => (
              <tr key={record.enrollmentId} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-8 py-6">
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-[#00426B] uppercase tracking-tight">
                      {record.enrollment.student.lastName}, {record.enrollment.student.fullName}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 mt-1 uppercase">IDALU: {record.enrollment.student.idalu}</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex justify-center gap-2">
                    {statusOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => handleStatusChange(record.enrollmentId, opt.value as any)}
                        title={opt.label}
                        className={`w-10 h-10 flex items-center justify-center transition-all duration-200 border-2 ${
                          record.status === opt.value
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
                </td>
                <td className="px-8 py-6">
                  <input
                    type="text"
                    value={record.observations || ''}
                    onChange={(e) => handleObservationChange(record.enrollmentId, e.target.value)}
                    placeholder="None"
                    className="w-full bg-[#F8FAFC] border-none text-[12px] font-medium text-[#00426B] placeholder:text-gray-200 focus:ring-1 focus:ring-[#0775AB] py-2 px-3"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
