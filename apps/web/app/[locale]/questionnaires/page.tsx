'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { evaluationService } from '@/services/evaluationService';
import Pagination from "@/components/Pagination";
import Loading from '@/components/Loading';

export default function AdminQuestionnairesPage() {
    const [models, setModels] = useState<{ modelId: string, name: string, target: string, _count?: { questions: number } }[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchModels = async () => {
            try {
                const res = await evaluationService.getModels();
                setModels(res.data);
            } catch (err) {
                console.error("Error fetching questionnaire models:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchModels();
    }, []);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;
    const totalPages = Math.ceil(models.length / itemsPerPage);
    const paginatedModels = models.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    if (loading) {
        return (
            <Loading fullScreen message="Loading questionnaires..." />
        );
    }

    return (
        <DashboardLayout
            title="Questionnaire Management"
            subtitle="Manage dynamic form models and view responses."
        >
            <div className="w-full pb-20">
                <div className="flex justify-between items-center mb-10">
                    <h2 className="text-xl font-black uppercase tracking-tighter text-gray-800">Available Models</h2>
                    <button
                        onClick={() => router.push('/admin/questionnaires/builder')}
                        className="bg-blue-900 text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg flex items-center gap-3 active:scale-95"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                        New Questionnaire
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {models.length === 0 ? (
                        <div className="col-span-full bg-white p-20 border-2 border-dashed border-gray-100 text-center">
                            <p className="text-gray-400 italic mb-6">No questionnaire models have been created yet.</p>
                            <button onClick={() => router.push('/admin/questionnaires/builder')} className="text-blue-900 font-black uppercase text-xs tracking-widest hover:underline">Start now</button>
                        </div>
                    ) : (
                        paginatedModels.map((m) => (
                            <div key={m.modelId} className="bg-white p-8 border shadow-sm hover:shadow-xl transition-all group flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <span className={`px-3 py-1 text-[8px] font-black uppercase tracking-widest ${m.target === 'STUDENT' ? 'bg-blue-100 text-blue-700' :
                                            m.target === 'TEACHER' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'
                                            }`}>
                                            {m.target}
                                        </span>
                                        <span className="text-[10px] text-gray-300 font-bold">#{m.modelId}</span>
                                    </div>
                                    <h3 className="text-lg font-black text-blue-900 mb-2 uppercase tracking-tighter group-hover:text-black transition-colors">{m.name}</h3>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-6">{m._count?.questions || 0} Questions</p>
                                </div>

                                <div className="flex gap-4">
                                    <button className="flex-1 py-3 bg-gray-50 text-gray-500 font-black uppercase text-[10px] tracking-widest hover:bg-gray-100 transition-all border">Edit</button>
                                    <button className="flex-1 py-3 bg-black text-white font-black uppercase text-[10px] tracking-widest hover:bg-blue-900 transition-all shadow-md">View Results</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    totalItems={models.length}
                    currentItemsCount={paginatedModels.length}
                    itemName="questionnaires"
                />

                {/* Help section */}
                <div className="mt-16 bg-blue-50 p-8 border-l-4 border-blue-900">
                    <div className="flex gap-4">
                        <div className="w-10 h-10 bg-blue-900 text-white flex items-center justify-center rounded-full shrink-0">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <div>
                            <h4 className="text-sm font-black text-blue-900 uppercase tracking-tighter mb-2">How do questionnaires work?</h4>
                            <p className="text-xs text-blue-800/80 leading-relaxed font-bold italic uppercase tracking-tighter">
                                Dynamic questionnaires can be sent to participants once the execution phase is finished. The data obtained automatically feeds the Evaluation Dashboard for Consortium administrators.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
