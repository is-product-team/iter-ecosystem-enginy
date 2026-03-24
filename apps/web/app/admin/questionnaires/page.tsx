'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { THEME } from '@iter/shared';
import DashboardLayout from '@/components/DashboardLayout';
import { evaluationService } from '@/services/evaluationService';
import Pagination from "@/components/Pagination";
import Loading from '@/components/Loading';

export default function AdminQuestionnairesPage() {
    const [models, setModels] = useState<any[]>([]);
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
            <Loading fullScreen message="Carregant qüestionaris..." />
        );
    }

    return (
        <DashboardLayout
            title="Gestió de Qüestionaris"
            subtitle="Administra els models de formularis dinàmics i visualitza les respostes."
        >
            <div className="w-full pb-20">
                <div className="flex justify-between items-center mb-10">
                    <h2 className="text-xl font-black uppercase tracking-tighter text-gray-800">Models Disponibles</h2>
                    <button
                        onClick={() => router.push('/admin/questionaris/builder')}
                        className="bg-blue-900 text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg flex items-center gap-3 active:scale-95"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                        Nou Qüestionari
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {models.length === 0 ? (
                        <div className="col-span-full bg-white p-20 border-2 border-dashed border-gray-100 text-center">
                            <p className="text-gray-400 italic mb-6">No s'han creat models de qüestionari encara.</p>
                            <button onClick={() => router.push('/admin/questionaris/builder')} className="text-blue-900 font-black uppercase text-xs tracking-widest hover:underline">Començar ara</button>
                        </div>
                    ) : (
                        paginatedModels.map((m: any) => (
                            <div key={m.id_model} className="bg-white p-8 border shadow-sm hover:shadow-xl transition-all group flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <span className={`px-3 py-1 text-[8px] font-black uppercase tracking-widest ${m.destinatari === 'ALUMNE' ? 'bg-blue-100 text-blue-700' :
                                            m.destinatari === 'DOCENT' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'
                                            }`}>
                                            {m.destinatari}
                                        </span>
                                        <span className="text-[10px] text-gray-300 font-bold">#{m.id_model}</span>
                                    </div>
                                    <h3 className="text-lg font-black text-blue-900 mb-2 uppercase tracking-tighter group-hover:text-black transition-colors">{m.titol}</h3>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-6">{m._count?.preguntes || 0} Preguntes</p>
                                </div>

                                <div className="flex gap-4">
                                    <button className="flex-1 py-3 bg-gray-50 text-gray-500 font-black uppercase text-[10px] tracking-widest hover:bg-gray-100 transition-all border">Editar</button>
                                    <button className="flex-1 py-3 bg-black text-white font-black uppercase text-[10px] tracking-widest hover:bg-blue-900 transition-all shadow-md">Veure Resultats</button>
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
                    itemName="qüestionaris"
                />

                {/* Sección de ayuda */}
                <div className="mt-16 bg-blue-50 p-8 border-l-4 border-blue-900">
                    <div className="flex gap-4">
                        <div className="w-10 h-10 bg-blue-900 text-white flex items-center justify-center rounded-full shrink-0">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <div>
                            <h4 className="text-sm font-black text-blue-900 uppercase tracking-tighter mb-2">Com funcionen els qüestionaris?</h4>
                            <p className="text-xs text-blue-800/80 leading-relaxed font-bold italic uppercase tracking-tighter">
                                Els qüestionaris dinàmics es poden enviar als participants un cop finalitzada la fase d'execució. Les dades obtingues alimenten automàticament el Dashboard d'Avaluació per als administradors del Consorcí.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
