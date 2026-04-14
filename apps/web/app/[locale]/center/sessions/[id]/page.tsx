'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { getUser, User } from '@/lib/auth';
import DashboardLayout from '@/components/DashboardLayout';
import { ROLES } from '@iter/shared';
import getApi from '@/services/api';
import Loading from '@/components/Loading';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

interface AssignmentDetail {
  workshop?: { title: string };
  teacher1?: { user: { fullName: string } };
  teacher2?: { user: { fullName: string } };
  sessions?: {
    sessionId: number;
    sessionDate: string;
    startTime?: string;
    endTime?: string;
    staff?: { userId: number; user?: { fullName: string } }[];
  }[];
}

export default function SessionManagementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const locale = useLocale();
  const [user, setUser] = useState<User | null>(null);
  const [assignment, setAssignment] = useState<AssignmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [allTeachers, setAllTeachers] = useState<{ userId: number; fullName: string }[]>([]);
  const router = useRouter();
  const t = useTranslations('Sessions');
  const tCommon = useTranslations('Common');

  useEffect(() => {
    const currentUser = getUser();
    if (!currentUser || currentUser.role.name !== ROLES.COORDINATOR) {
      router.push('/login');
      return;
    }
    setUser(currentUser);

    const fetchData = async () => {
      try {
        const api = getApi();
        const [resAssig, resProfs] = await Promise.all([
          api.get(`/assignments/${id}`),
          api.get('/teachers')
        ]);

        // Transform teachers to match the expected format if needed
        const teachers = (resProfs.data || []).map((t: any) => ({
          userId: t.userId,
          fullName: t.user?.fullName || t.name
        }));

        setAssignment(resAssig.data);
        setAllTeachers(teachers);
      } catch (error) {
        toast.error(tCommon('error_loading'));
        router.push('/center/sessions');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, router]);

  const handleAddSessionStaff = async (sessionId: number, userId: number) => {
    try {
      const api = getApi();
      await api.post(`/assignments/sessions/${sessionId}/staff`, { userId });

      const res = await api.get(`/assignments/${id}`);
      setAssignment(res.data);
      toast.success(t('teacher_added'));
    } catch (error) {
      toast.error(t('error_add_teacher'));
    }
  };

  const handleRemoveSessionStaff = async (sessionId: number, idUser: number) => {
    try {
      const api = getApi();
      await api.delete(`/assignments/sessions/${sessionId}/staff/${idUser}`);

      const res = await api.get(`/assignments/${id}`);
      setAssignment(res.data);
      toast.success(t('teacher_removed'));
    } catch (error) {
      toast.error(t('error_remove_teacher'));
    }
  };

  if (loading || !assignment) return <Loading fullScreen message={t('loading_sessions')} />;

  return (
    <DashboardLayout
      title={t('page_title', { title: assignment.workshop?.title || '' })}
      subtitle={t('page_subtitle')}
    >
      <div className="mb-8 p-6 bg-white border border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="text-lg font-black text-[#00426B] uppercase">{t('referent_team')}</h3>
          <div className="flex gap-4 mt-2">
            <span className="text-xs font-bold text-gray-500 bg-gray-50 px-3 py-1 border border-gray-100">{assignment.teacher1?.user?.fullName || tCommon('pending')}</span>
            <span className="text-xs font-bold text-gray-500 bg-gray-50 px-3 py-1 border border-gray-100">{assignment.teacher2?.user?.fullName || tCommon('pending')}</span>
          </div>
        </div>
        <button
          onClick={() => router.push('/center/sessions')}
          className="text-xs font-bold text-[#4197CB] hover:text-[#00426B] uppercase tracking-widest flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          {t('back_to_list')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
        {assignment.sessions?.map((session, idx: number) => (
          <div key={session.sessionId} className="bg-white border border-gray-200 p-6 flex flex-col gap-4 group hover:border-[#4197CB] transition-all shadow-sm">
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-[#4197CB] uppercase tracking-widest">{t('session_n', { number: idx + 1 })}</span>
                <span className="text-sm font-black text-[#00426B] uppercase">
                  {new Date(session.sessionDate).toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })}
                </span>
              </div>
              <div className="text-[10px] font-bold text-gray-300">
                {session.startTime || '09:00'} - {session.endTime || '11:00'}
              </div>
            </div>

            <div className="border-t border-gray-50 pt-4 flex flex-col gap-3">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{t('specific_team')}</span>
              <div className="flex flex-wrap gap-2 min-h-[32px]">
                {session.staff?.map((sp) => (
                  <div key={sp.userId} className="flex items-center gap-2 bg-[#F8FAFC] border border-gray-100 pl-2 pr-1 py-1 group/chip">
                    <span className="text-[10px] font-bold text-[#00426B] uppercase">{sp.user?.fullName}</span>
                    <button
                      onClick={() => handleRemoveSessionStaff(session.sessionId, sp.userId)}
                      className="hover:text-red-500 text-gray-300 transition-colors p-0.5"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
                {(!session.staff || session.staff.length === 0) && (
                  <span className="text-[10px] text-gray-300 italic font-medium">{t('use_referent_team')}</span>
                )}
              </div>
            </div>

            <div className="mt-auto pt-2">
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleAddSessionStaff(session.sessionId, parseInt(e.target.value));
                    e.target.value = "";
                  }
                }}
                className="w-full text-[10px] font-bold uppercase tracking-widest bg-gray-50 border-none focus:ring-1 focus:ring-[#00426B] p-2 text-gray-500 cursor-pointer"
                defaultValue=""
              >
                <option value="" disabled>{t('modify_teacher')}</option>
                {allTeachers?.map((p) => (
                  <option key={p.userId} value={p.userId}>{p.fullName} ({tCommon('roles.TEACHER')})</option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
