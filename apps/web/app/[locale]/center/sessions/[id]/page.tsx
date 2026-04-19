'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { getUser, User } from '@/lib/auth';
import DashboardLayout from '@/components/DashboardLayout';
import { ROLES } from '@iter/shared';
import getApi from '@/services/api';
import Loading from '@/components/Loading';
import Button from '@/components/ui/Button';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

interface AssignmentDetail {
  workshop?: { title: string };
  teacher1?: { userId: number; user: { fullName: string } };
  teacher2?: { userId: number; user: { fullName: string } };
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
  }, [id, router, tCommon]);

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
      <div className="mb-8 p-6 bg-background-surface border border-border-subtle flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-black text-consorci-darkBlue uppercase">{t('referent_team')}</h3>
          <div className="flex gap-4 items-center">
            <div className="flex gap-2">
              <span className="text-xs font-bold text-text-muted bg-background-subtle px-3 py-1 border border-border-subtle">{assignment.teacher1?.user?.fullName || tCommon('pending')}</span>
              <span className="text-xs font-bold text-text-muted bg-background-subtle px-3 py-1 border border-border-subtle">{assignment.teacher2?.user?.fullName || tCommon('pending')}</span>
            </div>
            {assignment.teacher1?.userId && (
              <Button
                onClick={async () => {
                  try {
                    const api = getApi();
                    await api.post(`/assignments/${id}/sessions/bulk-assign`, { userId: assignment.teacher1?.userId });
                    const res = await api.get(`/assignments/${id}`);
                    setAssignment(res.data);
                    toast.success(t('bulk_assign_success') || 'Equip sincronitzat correctament');
                  } catch (error) {
                    toast.error(t('bulk_assign_error') || 'Error al sincronitzar');
                  }
                }}
                variant="primary"
                size="sm"
                className="!text-[10px] !px-4 !py-1.5 uppercase"
                icon={<svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>}
              >
                {t('sync_team_btn') || 'Sincronitzar'}
              </Button>
            )}
          </div>
        </div>
        <Button
          onClick={() => router.push('/center/sessions')}
          variant="subtle"
          size="sm"
          className="uppercase tracking-widest !text-[#4197CB] hover:!text-[#00426B]"
          icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>}
        >
          {t('back_to_list')}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
        {assignment.sessions?.map((session, idx: number) => (
          <div key={session.sessionId} className="bg-background-surface border border-border-subtle p-6 flex flex-col gap-4 group hover:border-consorci-lightBlue transition-all shadow-sm">
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-consorci-lightBlue uppercase tracking-widest">{t('session_n', { number: idx + 1 })}</span>
                <span className="text-sm font-black text-consorci-darkBlue uppercase">
                  {new Date(session.sessionDate).toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })}
                </span>
              </div>
              <div className="text-[10px] font-bold text-text-muted opacity-50">
                {session.startTime || '09:00'} - {session.endTime || '11:00'}
              </div>
            </div>

            <div className="border-t border-border-subtle pt-4 flex flex-col gap-3">
              <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest">{t('specific_team')}</span>
              <div className="flex flex-wrap gap-2 min-h-[32px]">
                {session.staff?.map((sp) => (
                  <div key={sp.userId} className="flex items-center gap-2 bg-background-subtle border border-border-subtle pl-2 pr-1 py-1 group/chip">
                    <span className="text-[10px] font-bold text-consorci-darkBlue uppercase">{sp.user?.fullName}</span>
                    <Button
                      onClick={() => handleRemoveSessionStaff(session.sessionId, sp.userId)}
                      variant="subtle"
                      size="sm"
                      className="hover:!text-red-500 !text-gray-300 !p-0.5 h-auto border-none"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                    </Button>
                  </div>
                ))}
                {(!session.staff || session.staff.length === 0) && (
                  <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 px-3 py-1 animate-pulse">
                    <svg className="w-3 h-3 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    <span className="text-[10px] text-orange-600 font-bold uppercase tracking-tight">{t('use_referent_team')}</span>
                  </div>
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
                className="w-full text-[10px] font-bold uppercase tracking-widest bg-background-subtle border-none focus:ring-1 focus:ring-consorci-darkBlue p-2 text-text-muted cursor-pointer"
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
