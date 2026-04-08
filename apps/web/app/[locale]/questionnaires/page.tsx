'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { evaluationService } from '@/services/evaluationService';
import Pagination from "@/components/Pagination";
import Loading from '@/components/Loading';
import { useTranslations } from 'next-intl';

export default function AdminQuestionnairesPage() {
    const [models, setModels] = useState<{ modelId: string, name: string, target: string, _count?: { questions: number } }[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const t = useTranslations('Questionnaires');
    const tc = useTranslations('Common');

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
            <div className="flex min-h-screen justify-center items-center bg-background-surface">
                <div className="animate-spin h-8 w-8 border-b-2 border-consorci-darkBlue"></div>
            </div>
        );
    }

    return (
        <DashboardLayout
          title={t('title')}
          subtitle={t('subtitle')}
        >
          <div className="w-full pb-20 space-y-12">
            <div className="flex justify-between items-center mb-12">

                    <h2 className="text-[18px] font-medium text-text-primary tracking-tight">{t('available_models')}</h2>
                    <button
                        onClick={() => router.push('/admin/questionnaires/builder')}
                        className="bg-consorci-darkBlue text-white px-8 py-4 text-[13px] font-medium transition-all hover:bg-black active:scale-[0.98] flex items-center gap-3"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" /></svg>
                        {t('new_questionnaire')}
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {models.length === 0 ? (
                        <div className="col-span-full bg-background-surface p-24 border border-dashed border-border-subtle text-center">
                            <p className="text-text-muted font-medium mb-8">{t('no_models')}</p>
                            <button onClick={() => router.push('/admin/questionnaires/builder')} className="text-consorci-darkBlue font-medium text-[13px] hover:underline">{t('create_first')}</button>
                        </div>
                    ) : (
                        paginatedModels.map((m) => (
                            <div key={m.modelId} className="bg-background-surface p-10 border border-border-subtle hover:border-consorci-darkBlue transition-all group flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-6">
                                        <span className={`px-2.5 py-1 text-[11px] font-medium border ${
                                            m.target === 'STUDENT' ? 'border-consorci-darkBlue/20 text-consorci-darkBlue bg-consorci-darkBlue/5' :
                                            m.target === 'TEACHER' ? 'border-purple-500/20 text-purple-600 bg-purple-500/5' : 'border-orange-500/20 text-orange-600 bg-orange-500/5'
                                            }`}>
                                            {m.target}
                                        </span>
                                        <span className="text-[12px] text-text-muted font-medium opacity-50">#{m.modelId}</span>
                                    </div>
                                    <h3 className="text-[17px] font-medium text-text-primary mb-3 tracking-tight group-hover:text-consorci-darkBlue transition-colors">{m.name}</h3>
                                    <p className="text-[12px] text-text-muted font-medium mb-8">{t('questions_count', { count: m._count?.questions || 0 })}</p>
                                </div>

                                <div className="flex gap-4">
                                    <button className="flex-1 py-3.5 bg-background-subtle text-text-muted font-medium text-[13px] hover:bg-background-surface transition-all border border-border-subtle">{tc('edit')}</button>
                                    <button className="flex-1 py-3.5 bg-consorci-darkBlue text-white font-medium text-[13px] hover:bg-black transition-all active:scale-[0.98]">{t('view_results')}</button>
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
                    itemName={t('title').toLowerCase()}
                />

                {/* Help section */}
                <div className="mt-20 bg-background-subtle border border-border-subtle p-10">
                    <div className="flex gap-6 items-start">
                        <div className="w-10 h-10 bg-consorci-darkBlue text-white flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <div>
                            <h4 className="text-[15px] font-medium text-text-primary mb-3">{t('how_works_title')}</h4>
                            <p className="text-[13px] text-text-muted leading-relaxed font-medium">
                                {t('how_works_desc')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
