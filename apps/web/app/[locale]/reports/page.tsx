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
            <div className="flex min-h-screen justify-center items-center">
                <div className="animate-spin h-10 w-10 border-b-2 border-primary"></div>
            </div>
        );
    }

    const { general_avg, impact_distribution } = (metrics as { 
        general_avg: { valoracio_experiencia: number, valoracio_docent: number }, 
        impact_distribution: { impacte_vocacional: string, _count: { _all: number } }[] 
    }) || { general_avg: { valoracio_experiencia: 0, valoracio_docent: 0 }, impact_distribution: [] };

    return (
        <DashboardLayout
            title="Evaluation Dashboard"
            subtitle="Analyze the quality and impact of the Enginy Program."
        >
            <div className="w-full pb-20 space-y-12">

                {/* General Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div className="bg-white p-8 border shadow-sm flex flex-col items-center justify-center text-center">
                        <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-4">Student Experience</span>
                        <span className="text-5xl font-black text-blue-900">{(general_avg?.valoracio_experiencia || 0).toFixed(1)}</span>
                        <div className="w-full mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-900" style={{ width: `${(general_avg?.valoracio_experiencia || 0) * 10}%` }}></div>
                        </div>
                    </div>
                    <div className="bg-white p-8 border shadow-sm flex flex-col items-center justify-center text-center">
                        <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-4">Teacher Satisfaction</span>
                        <span className="text-5xl font-black text-blue-900">{(general_avg?.valoracio_docent || 0).toFixed(1)}</span>
                        <div className="w-full mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-900" style={{ width: `${(general_avg?.valoracio_docent || 0) * 10}%` }}></div>
                        </div>
                    </div>
                    {/* Mocks for additional metrics */}
                    <div className="bg-white p-8 border shadow-sm flex flex-col items-center justify-center text-center">
                        <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-4">Workshops Completed</span>
                        <span className="text-5xl font-black text-gray-900">84%</span>
                        <p className="text-[10px] font-black uppercase text-green-600 mt-2">+5% vs 2023</p>
                    </div>
                    <div className="bg-white p-8 border shadow-sm flex flex-col items-center justify-center text-center">
                        <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-4">Student Participation</span>
                        <span className="text-5xl font-black text-gray-900">1240</span>
                        <p className="text-[10px] font-black uppercase text-blue-600 mt-2">Total enrollments</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Vocational Impact */}
                    <div className="lg:col-span-2 bg-white p-10 border shadow-sm">
                        <h3 className="text-xs font-black uppercase tracking-widest text-blue-600 mb-10">Vocational Impact Distribution</h3>
                        <div className="space-y-6">
                            {impact_distribution.map((item: { impacte_vocacional: string, _count: { _all: number } }) => {
                                const total = impact_distribution.reduce((acc: number, curr: { _count: { _all: number } }) => acc + curr._count._all, 0);
                                const percent = (item._count._all / total) * 100;
                                const labels: Record<string, string> = {
                                    'SI': 'Has chosen a professional branch',
                                    'NO': 'Has not changed their opinion',
                                    'CONSIDERANT': 'Is considering it right now'
                                };
                                return (
                                    <div key={item.impacte_vocacional} className="space-y-2">
                                        <div className="flex justify-between items-center text-sm font-bold">
                                            <span className="text-gray-700">{labels[item.impacte_vocacional] || item.impacte_vocacional}</span>
                                            <span className="text-blue-900">{percent.toFixed(0)}% ({item._count._all})</span>
                                        </div>
                                        <div className="w-full h-8 bg-gray-50 border-2 overflow-hidden flex">
                                            <div
                                                className={`h-full transition-all duration-1000 ${item.impacte_vocacional === 'SI' ? 'bg-green-500' :
                                                    item.impacte_vocacional === 'CONSIDERANT' ? 'bg-blue-600' : 'bg-gray-200'
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
                    <div className="bg-black text-white p-10 shadow-2xl flex flex-col">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-10">Top Rated Workshops</h3>
                        <div className="space-y-8 flex-1">
                            {[
                                { name: '3D Printing', score: 4.8 },
                                { name: 'LEGO Robotics', score: 4.7 },
                                { name: 'Web Design', score: 4.5 },
                                { name: 'Electronics', score: 4.3 }
                            ].map((t, i) => (
                                <div key={i} className="flex justify-between items-center border-b border-white/10 pb-4">
                                    <span className="text-sm font-black italic">{t.name}</span>
                                    <span className="text-blue-400 font-black">{t.score}</span>
                                </div>
                            ))}
                        </div>
                        <button className="mt-12 w-full py-4 bg-white text-black font-black uppercase text-[10px] tracking-widest hover:bg-blue-400 transition-all">Download PDF Summary</button>
                    </div>
                </div>

                {/* Quality Alert */}
                <div className="p-8 bg-red-50 border-2 border-red-600 shadow-[8px_8px_0px_0px_rgba(220,38,38,0.1)] flex gap-6 items-center">
                    <div className="w-12 h-12 bg-red-600 text-white rounded-full flex items-center justify-center shrink-0">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    </div>
                    <div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-red-700 mb-1">Low Rating Alerts</h4>
                        <p className="text-sm text-red-900/60 font-bold uppercase tracking-tighter italic">2 Workshops show satisfaction below 3.5. Review with the reference center is recommended.</p>
                    </div>
                    <button className="ml-auto bg-red-600 text-white px-6 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg">View Details</button>
                </div>

            </div>
        </DashboardLayout>
    );
}
