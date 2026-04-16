'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { evaluationService } from '@/services/evaluationService';
import { useTranslations } from 'next-intl';
import Loading from '@/components/Loading';

export default function AdminReportsPage() {
    const [metrics, setMetrics] = useState<unknown>(null);
    const [loading, setLoading] = useState(true);
    const t = useTranslations('Reports');
    const tc = useTranslations('Common');

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const res = await evaluationService.getReports();
                setMetrics(res.data);
            } catch (err) {
                console.error("Error fetching report metrics:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchMetrics();
    }, []);

    if (loading) {
        return <Loading fullScreen message={t('loading_data') || "Loading reports..."} />;
    }

    const { generalAvg, impactDistribution, workshopsCount, totalEnrollments, topWorkshops } = (metrics as { 
        generalAvg: { experienceRating: number, teacherRating: number }, 
        impactDistribution: { vocationalImpact: string, _count: { _all: number } }[],
        workshopsCount?: number,
        totalEnrollments?: number,
        topWorkshops?: { name: string, score: number }[]
    }) || { generalAvg: { experienceRating: 0, teacherRating: 0 }, impactDistribution: [], workshopsCount: 0, totalEnrollments: 0, topWorkshops: [] };

    return (
        <DashboardLayout
            title={t('title')}
            subtitle={t('subtitle')}
        >
            <div className="w-full pb-20 space-y-12">

                {/* General Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div className="bg-background-surface p-10 border border-border-subtle flex flex-col items-center justify-center text-center">
                        <span className="text-[13px] font-medium text-text-muted mb-4 uppercase tracking-wider">{t('student_exp')}</span>
                        <span className="text-4xl font-medium text-text-primary">{(generalAvg?.experienceRating || 0).toFixed(1)}</span>
                        <div className="w-full mt-6 h-1.5 bg-background-subtle overflow-hidden">
                            <div className="h-full bg-consorci-darkBlue dark:bg-consorci-lightBlue" style={{ width: `${(generalAvg?.experienceRating || 0) * 10}%` }}></div>
                        </div>
                    </div>
                    <div className="bg-background-surface p-10 border border-border-subtle flex flex-col items-center justify-center text-center">
                        <span className="text-[13px] font-medium text-text-muted mb-4 uppercase tracking-wider">{t('teacher_sat')}</span>
                        <span className="text-4xl font-medium text-text-primary">{(generalAvg?.teacherRating || 0).toFixed(1)}</span>
                        <div className="w-full mt-6 h-1.5 bg-background-subtle overflow-hidden">
                            <div className="h-full bg-consorci-darkBlue dark:bg-consorci-lightBlue" style={{ width: `${(generalAvg?.teacherRating || 0) * 10}%` }}></div>
                        </div>
                    </div>
                    
                    <div className="bg-background-surface p-10 border border-border-subtle flex flex-col items-center justify-center text-center">
                        <span className="text-[13px] font-medium text-text-muted mb-4 uppercase tracking-wider">{t('workshops_completed')}</span>
                        <span className="text-4xl font-medium text-text-primary">{workshopsCount || 0}</span>
                        <p className="text-[12px] font-medium text-text-muted mt-4 opacity-80">{t('total_active') || 'Total active'}</p>
                    </div>
                    <div className="bg-background-surface p-10 border border-border-subtle flex flex-col items-center justify-center text-center">
                        <span className="text-[13px] font-medium text-text-muted mb-4 uppercase tracking-wider">{t('student_part')}</span>
                        <span className="text-4xl font-medium text-text-primary">{totalEnrollments || 0}</span>
                        <p className="text-[12px] font-medium text-consorci-darkBlue mt-4 opacity-80">{t('total_enrollments')}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Vocational Impact */}
                    <div className="lg:col-span-2 bg-background-surface p-12 border border-border-subtle">
                        <h3 className="text-[17px] font-medium text-text-primary mb-12 tracking-tight">{t('vocational_dist')}</h3>
                        {impactDistribution.length === 0 ? (
                            <div className="py-20 text-center text-text-muted italic">{tc('no_data') || 'No data available'}</div>
                        ) : (
                            <div className="space-y-10">
                                {impactDistribution.map((item: { vocationalImpact: string, _count: { _all: number } }) => {
                                    const total = impactDistribution.reduce((acc: number, curr: { _count: { _all: number } }) => acc + curr._count._all, 0);
                                    const percent = (item._count._all / total) * 100;
                                    const labels: Record<string, string> = {
                                        'SI': t('impact_labels.si'),
                                        'NO': t('impact_labels.no'),
                                        'CONSIDERANT': t('impact_labels.considerant')
                                    };
                                    return (
                                        <div key={item.vocationalImpact} className="space-y-4">
                                            <div className="flex justify-between items-center text-[13px] font-medium">
                                                <span className="text-text-primary">{labels[item.vocationalImpact] || item.vocationalImpact}</span>
                                                <span className="text-consorci-darkBlue">{percent.toFixed(0)}% ({item._count._all})</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-background-subtle overflow-hidden">
                                                <div
                                                    className={`h-full transition-all duration-1000 ${
                                                        item.vocationalImpact === 'SI' ? 'bg-green-500' :
                                                        item.vocationalImpact === 'CONSIDERANT' ? 'bg-consorci-darkBlue' : 'bg-text-muted opacity-20'
                                                    }`}
                                                    style={{ width: `${percent}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Top Workshops */}
                    <div className="bg-background-subtle p-12 border border-border-subtle flex flex-col">
                        <h3 className="text-[17px] font-medium text-text-primary mb-12 tracking-tight">{t('top_rated')}</h3>
                        <div className="space-y-8 flex-1">
                            {topWorkshops && topWorkshops.length > 0 ? (
                                topWorkshops.map((ws, i) => (
                                    <div key={i} className="flex justify-between items-center border-b border-border-subtle pb-5">
                                        <span className="text-[13px] font-medium text-text-primary">{ws.name}</span>
                                        <span className="text-consorci-darkBlue font-medium text-[13px]">{ws.score.toFixed(1)}</span>
                                    </div>
                                ))
                            ) : (
                                <div className="py-10 text-center text-text-muted italic text-[13px]">{tc('no_data') || 'No data'}</div>
                            )}
                        </div>
                        <button className="mt-12 w-full py-4 bg-consorci-darkBlue text-white font-medium text-[13px] hover:bg-black transition-all active:scale-[0.98]">{t('download_pdf')}</button>
                    </div>
                </div>

                {/* Quality Alert */}
                <div className="p-8 bg-red-500/5 border border-red-500/20 flex gap-8 items-center">
                    <div className="w-12 h-12 bg-red-600 text-white flex items-center justify-center shrink-0">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    </div>
                    <div>
                        <h4 className="text-[13px] font-medium text-red-700 mb-1">{t('low_rating_alerts')}</h4>
                        <p className="text-[13px] text-red-900/60 font-medium">{t('low_rating_msg')}</p>
                    </div>
                    <button className="ml-auto bg-red-600 text-white px-8 py-3.5 text-[13px] font-medium hover:bg-black transition-all active:scale-[0.98]">{t('view_details')}</button>
                </div>

            </div>
        </DashboardLayout>
    );
}
