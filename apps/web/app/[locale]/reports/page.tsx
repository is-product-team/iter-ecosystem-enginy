'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { evaluationService } from '@/services/evaluationService';

export default function AdminReportsPage() {
    const [metrics, setMetrics] = useState<unknown>(null);
    const [loading, setLoading] = useState(true);

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
        return (
            <div className="flex min-h-screen justify-center items-center bg-background-surface">
                <div className="animate-spin h-8 w-8 border-b-2 border-consorci-darkBlue"></div>
            </div>
        );
    }

    const { generalAvg, impactDistribution } = (metrics as { 
        generalAvg: { experienceRating: number, teacherRating: number }, 
        impactDistribution: { vocationalImpact: string, _count: { _all: number } }[] 
    }) || { generalAvg: { experienceRating: 0, teacherRating: 0 }, impactDistribution: [] };

    return (
        <DashboardLayout
            title="Evaluation Dashboard"
            subtitle="Analyze the quality and impact of the Enginy Program."
        >
            <div className="w-full pb-20 space-y-12">

                {/* General Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div className="bg-background-surface p-10 border border-border-subtle flex flex-col items-center justify-center text-center">
                        <span className="text-[13px] font-medium text-text-muted mb-4 uppercase tracking-wider">Student Experience</span>
                        <span className="text-4xl font-medium text-text-primary">{(generalAvg?.experienceRating || 0).toFixed(1)}</span>
                        <div className="w-full mt-6 h-1.5 bg-background-subtle overflow-hidden">
                            <div className="h-full bg-consorci-darkBlue" style={{ width: `${(generalAvg?.experienceRating || 0) * 10}%` }}></div>
                        </div>
                    </div>
                    <div className="bg-background-surface p-10 border border-border-subtle flex flex-col items-center justify-center text-center">
                        <span className="text-[13px] font-medium text-text-muted mb-4 uppercase tracking-wider">Teacher Satisfaction</span>
                        <span className="text-4xl font-medium text-text-primary">{(generalAvg?.teacherRating || 0).toFixed(1)}</span>
                        <div className="w-full mt-6 h-1.5 bg-background-subtle overflow-hidden">
                            <div className="h-full bg-consorci-darkBlue" style={{ width: `${(generalAvg?.teacherRating || 0) * 10}%` }}></div>
                        </div>
                    </div>
                    {/* Mocks for additional metrics */}
                    <div className="bg-background-surface p-10 border border-border-subtle flex flex-col items-center justify-center text-center">
                        <span className="text-[13px] font-medium text-text-muted mb-4 uppercase tracking-wider">Workshops Completed</span>
                        <span className="text-4xl font-medium text-text-primary">84%</span>
                        <p className="text-[12px] font-medium text-green-600 mt-4 opacity-80">+5% vs 2023</p>
                    </div>
                    <div className="bg-background-surface p-10 border border-border-subtle flex flex-col items-center justify-center text-center">
                        <span className="text-[13px] font-medium text-text-muted mb-4 uppercase tracking-wider">Student Participation</span>
                        <span className="text-4xl font-medium text-text-primary">1240</span>
                        <p className="text-[12px] font-medium text-consorci-darkBlue mt-4 opacity-80">Total enrollments</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Vocational Impact */}
                    <div className="lg:col-span-2 bg-background-surface p-12 border border-border-subtle">
                        <h3 className="text-[17px] font-medium text-text-primary mb-12 tracking-tight">Vocational Impact Distribution</h3>
                        <div className="space-y-10">
                            {impactDistribution.map((item: { vocationalImpact: string, _count: { _all: number } }) => {
                                const total = impactDistribution.reduce((acc: number, curr: { _count: { _all: number } }) => acc + curr._count._all, 0);
                                const percent = (item._count._all / total) * 100;
                                const labels: Record<string, string> = {
                                    'SI': 'Has chosen a professional branch',
                                    'NO': 'Has not changed their opinion',
                                    'CONSIDERANT': 'Is considering it right now'
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
                    </div>

                    {/* Top Workshops */}
                    <div className="bg-background-subtle p-12 border border-border-subtle flex flex-col">
                        <h3 className="text-[17px] font-medium text-text-primary mb-12 tracking-tight">Top Rated Workshops</h3>
                        <div className="space-y-8 flex-1">
                            {[
                                { name: '3D Printing', score: 4.8 },
                                { name: 'LEGO Robotics', score: 4.7 },
                                { name: 'Web Design', score: 4.5 },
                                { name: 'Electronics', score: 4.3 }
                            ].map((t, i) => (
                                <div key={i} className="flex justify-between items-center border-b border-border-subtle pb-5">
                                    <span className="text-[13px] font-medium text-text-primary">{t.name}</span>
                                    <span className="text-consorci-darkBlue font-medium text-[13px]">{t.score}</span>
                                </div>
                            ))}
                        </div>
                        <button className="mt-12 w-full py-4 bg-consorci-darkBlue text-white font-medium text-[13px] hover:bg-black transition-all active:scale-[0.98]">Download PDF summary</button>
                    </div>
                </div>

                {/* Quality Alert */}
                <div className="p-8 bg-red-500/5 border border-red-500/20 flex gap-8 items-center">
                    <div className="w-12 h-12 bg-red-600 text-white flex items-center justify-center shrink-0">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    </div>
                    <div>
                        <h4 className="text-[13px] font-medium text-red-700 mb-1">Low rating alerts</h4>
                        <p className="text-[13px] text-red-900/60 font-medium">2 Workshops show satisfaction below 3.5. Review with the reference center is recommended.</p>
                    </div>
                    <button className="ml-auto bg-red-600 text-white px-8 py-3.5 text-[13px] font-medium hover:bg-black transition-all active:scale-[0.98]">View details</button>
                </div>

            </div>
        </DashboardLayout>
    );
}
