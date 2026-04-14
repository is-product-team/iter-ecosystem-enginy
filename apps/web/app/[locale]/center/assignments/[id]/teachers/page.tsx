'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { getUser, User } from '@/lib/auth';
import { PHASES, ROLES } from '@iter/shared';
import DashboardLayout from '@/components/DashboardLayout';
import assignmentService, { Assignment } from '@/services/assignmentService';
import teacherService, { Teacher } from '@/services/teacherService';
import getApi from '@/services/api';
import Loading from '@/components/Loading';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

export default function DesignateTeachersPage({ params }: { params: Promise<{ id: string }> }) {
  const t = useTranslations('DesignateTeachersPage');
  const tCommon = useTranslations('Common');
  const { id } = use(params);
  const [user, setUser] = useState<User | null>(null);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [teacher1Id, setTeacher1Id] = useState<string>('');
  const [teacher2Id, setTeacher2Id] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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

        // Fetch phases first for gating
        const resPhases = await api.get("/phases");
        const phasesData = resPhases.data.data;
        const isPlanning = phasesData.find((f: { name: string, active: boolean }) => f.name === PHASES.PLANNING)?.active;

        if (!isPlanning) {
          toast.error(t('teacher_designation_not_active'));
          router.push(`/${currentUser.role.name === ROLES.COORDINATOR ? 'ca/center' : 'ca'}/assignments`); // Note: locale should ideally be passed, using default ca here, or standard redirect
          return;
        }

        // Fetch assignment
        const found = await assignmentService.getById(parseInt(id));

        if (!found) {
          toast.error(t('assignment_not_found'));
          router.push('/center/assignments');
          return;
        }
        setAssignment(found);
        setTeacher1Id(found.teacher1?.userId?.toString() || '');
        setTeacher2Id(found.teacher2?.userId?.toString() || '');

        // Fetch all teachers from center
        const resTeachers = await teacherService.getByCenter(currentUser.centerId || 0);
        setTeachers(resTeachers || []);
      } catch (error) {
        console.error("Error fetching designation data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, router]);

  const handleSave = async () => {
    if (!teacher1Id || !teacher2Id) {
      toast.error(t('designate_two_teachers'));
      return;
    }

    if (teacher1Id === teacher2Id) {
      toast.error(t('teachers_must_be_different'));
      return;
    }

    try {
      setLoading(true);
      const api = getApi();

      await api.patch(`/assignments/checklist/designate-teachers/${id}`, {
        teacher1Id: parseInt(teacher1Id),
        teacher2Id: parseInt(teacher2Id)
      });

      toast.success(t('teachers_designated_correctly'));
      router.push('/center/assignments');
    } catch (error) {
      toast.error(t('error_saving_designation'));
    } finally {
      setLoading(false);
    }
  };

  if (loading && !assignment) return <Loading fullScreen message={t('loading_designation')} />;

  return (
    <DashboardLayout
      title={t('page_title', { title: assignment?.workshop?.title || '' })}
      subtitle={t('page_subtitle')}
    >
      <div className="max-w-2xl mx-auto pb-20">
        <div className="bg-white border shadow-sm p-10">
          <div className="mb-10">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-8 flex items-center gap-3">
              <span className="w-6 h-px bg-gray-200"></span>
              {t('selection_of_referents')}
            </h3>

            <div className="space-y-8">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">{t('main_teacher')}</label>
                <select
                  value={teacher1Id}
                  onChange={(e) => setTeacher1Id(e.target.value)}
                  className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-600 outline-none rounded-none transition-all font-bold text-gray-800"
                >
                  <option value="">{t('select')}</option>
                  {teachers.map((p: Teacher) => (
                    <option key={p.teacherId} value={p.teacherId}>{p.name} ({p.contact})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">{t('second_teacher')}</label>
                <select
                  value={teacher2Id}
                  onChange={(e) => setTeacher2Id(e.target.value)}
                  className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-600 outline-none rounded-none transition-all font-bold text-gray-800"
                >
                  <option value="">{t('select')}</option>
                  {teachers.map((p: Teacher) => (
                    <option key={p.teacherId} value={p.teacherId}>{p.name} ({p.contact})</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
            <button
              onClick={handleSave}
              disabled={loading}
              className={`flex-1 py-5 font-black uppercase text-xs tracking-[0.2em] shadow-lg transition-all ${loading ? 'bg-gray-100 text-gray-300' : 'bg-blue-900 text-white hover:bg-black'
                }`}
            >
              {loading ? t('saving') : t('confirm_designation')}
            </button>
            <button
              onClick={() => router.back()}
              className="px-10 bg-white text-gray-400 py-5 font-black uppercase text-xs tracking-widest border border-gray-100 hover:bg-gray-50 transition-all"
            >
              {tCommon('cancel')}
            </button>
          </div>
        </div>

        <div className="mt-8 p-6 bg-orange-50 border-l-4 border-orange-500 text-orange-800 text-xs font-bold leading-relaxed">
          <p className="uppercase tracking-widest mb-2 flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
            {t('mandatory_requirement')}
          </p>
          <p>
            {t('mandatory_description')}
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
