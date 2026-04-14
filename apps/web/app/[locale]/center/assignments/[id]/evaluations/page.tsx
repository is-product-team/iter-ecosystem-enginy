'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { getUser, User } from '@/lib/auth';
import { ROLES } from '@iter/shared';
import DashboardLayout from '@/components/DashboardLayout';
import assignmentService, { Assignment, Enrollment } from '@/services/assignmentService';
import getApi from '@/services/api';
import Loading from '@/components/Loading';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

export default function AssignmentEvaluationsPage({ params }: { params: Promise<{ id: string }> }) {
    const t = useTranslations('AssignmentEvaluationsPage');
    const { id } = use(params);
    const [user, setUser] = useState<User | null>(null);
    const [assignment, setAssignment] = useState<Assignment | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const currentUser = getUser();
        if (!currentUser || (currentUser.role.name !== ROLES.COORDINATOR && currentUser.role.name !== ROLES.ADMIN)) {
            router.push('/login');
            return;
        }
        setUser(currentUser);

        const fetchData = async () => {
            try {
                const resAssig = await assignmentService.getById(parseInt(id));
                setAssignment(resAssig);
            } catch (error) {
                console.error("Error fetching assignment for evaluations:", error);
                toast.error(t('assignment_not_found'));
                router.push(`/${currentUser.role.name === ROLES.COORDINATOR ? 'ca/center' : 'ca'}/assignments`);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, router]);

    if (loading || !assignment) {
        return <Loading fullScreen message={t('loading_enrollments')} />;
    }

    return (
        <DashboardLayout
            title={t('page_title', { title: assignment.workshop?.title || '' })}
            subtitle={t('page_subtitle')}
        >
            <div className="w-full pb-20">
                <button
                    onClick={() => router.push(`/${user?.role.name === ROLES.COORDINATOR ? 'ca/center' : 'ca'}/assignments`)}
                    className="mb-8 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    {t('back_to_assignments')}
                </button>

                <div className="bg-white border shadow-sm overflow-hidden">
                    <div className="bg-gray-50 px-8 py-4 border-b">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">{t('list_of_enrollments')}</h3>
                    </div>

                    <div className="divide-y relative">
                        {(!assignment.enrollments || assignment.enrollments.length === 0) ? (
                            <div className="p-20 text-center">
                                <p className="text-sm text-gray-400 italic">{t('no_enrollments')}</p>
                            </div>
                        ) : (
                            assignment.enrollments.map((ins: Enrollment) => (
                                <div
                                    key={ins.enrollmentId}
                                    className="px-8 py-6 flex justify-between items-center hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className="w-12 h-12 bg-blue-900 flex items-center justify-center font-black italic text-sm text-white shadow-lg">
                                            {ins.student?.fullName?.charAt(0)}{ins.student?.lastName?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">
                                                {ins.student?.fullName} {ins.student?.lastName}
                                            </p>
                                            <p className="text-[10px] font-black uppercase tracking-tighter text-gray-400">
                                                {t('idalu')} {ins.student?.idalu}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="hidden md:block text-right">
                                            {ins.hasTeacherEvaluation ? (
                                                <span className="text-[10px] font-black uppercase px-3 py-1 bg-green-100 text-green-700">{t('status_completed')}</span>
                                            ) : (
                                                <span className="text-[10px] font-black uppercase px-3 py-1 bg-orange-100 text-orange-700">{t('status_pending')}</span>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => router.push(`/center/assignments/${id}/evaluations/${ins.enrollmentId}`)}
                                            className="bg-black hover:bg-blue-900 text-white px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-all shadow-md active:scale-95"
                                        >
                                            {ins.hasTeacherEvaluation ? t('btn_view_edit') : t('btn_evaluate')}
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="mt-8 p-6 bg-gray-100 border-l-4 border-black text-gray-600 text-xs font-bold">
                    <p className="uppercase tracking-widest mb-1">{t('instructions_title')}</p>
                    <p className="font-normal leading-relaxed">
                        {t('instructions_desc')}
                    </p>
                </div>
            </div>
        </DashboardLayout>
    );
}
