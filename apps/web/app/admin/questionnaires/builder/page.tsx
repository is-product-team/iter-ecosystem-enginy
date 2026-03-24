'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { THEME } from '@iter/shared';
import DashboardLayout from '@/components/DashboardLayout';
import getApi from '@/services/api';
import { toast } from 'sonner';

export default function QuestionnaireBuilderPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        titol: '',
        destinatari: 'ALUMNE',
        preguntes: [
            { enunciat: '', tipus_resposta: 'Likert_1_5', opcions: [] as string[] }
        ]
    });

    const addQuestion = () => {
        setForm({
            ...form,
            preguntes: [...form.preguntes, { enunciat: '', tipus_resposta: 'Likert_1_5', opcions: [] }]
        });
    };

    const removeQuestion = (index: number) => {
        setForm({
            ...form,
            preguntes: form.preguntes.filter((_, i) => i !== index)
        });
    };

    const updateQuestion = (index: number, field: string, value: any) => {
        const newPreguntes = [...form.preguntes];
        (newPreguntes[index] as any)[field] = value;
        setForm({ ...form, preguntes: newPreguntes });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.titol.trim() || form.preguntes.some(p => !p.enunciat.trim())) {
            toast.error("Si us plau, emplena tots els camps.");
            return;
        }

        setLoading(true);
        try {
            const api = getApi();
            await api.post('/questionaris/model', form);
            toast.success("Model de qüestionari creat amb èxit.");
            router.push('/admin/questionaris');
        } catch (err) {
            toast.error("Error al crear el qüestionari.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout
            title="Constructor de Qüestionaris"
            subtitle="Crea formularis dinàmics per a centres, docents o alumnat."
        >
            <div className="w-full pb-20">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Configuració Bàsica */}
                    <div className="bg-white p-10 border shadow-sm space-y-8">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-6">Configuració General</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-400">Títol del Qüestionari</label>
                                <input
                                    type="text"
                                    value={form.titol}
                                    onChange={(e) => setForm({ ...form, titol: e.target.value })}
                                    placeholder="Ex: Enquesta de Satisfacció Taller 2024"
                                    className="w-full border-b-2 p-4 text-xl font-bold outline-none focus:border-blue-900 transition-all"
                                />
                            </div>
                            <div className="space-y-4">
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-400">Destinatari</label>
                                <select
                                    value={form.destinatari}
                                    onChange={(e) => setForm({ ...form, destinatari: e.target.value })}
                                    className="w-full border-b-2 p-4 text-sm font-bold bg-white outline-none focus:border-blue-900"
                                >
                                    <option value="ALUMNE">Alumnat</option>
                                    <option value="PROFESSOR">Docent</option>
                                    <option value="CENTRE">Centre Referent</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Preguntes */}
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Preguntes ({form.preguntes.length})</h3>
                            <button
                                type="button"
                                onClick={addQuestion}
                                className="bg-black text-white px-6 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-blue-900 transition-all shadow-md"
                            >
                                + Afegir Pregunta
                            </button>
                        </div>

                        {form.preguntes.map((q, idx) => (
                            <div key={idx} className="bg-white p-8 border shadow-sm relative group animate-in fade-in slide-in-from-bottom-4 duration-300">
                                <button
                                    type="button"
                                    onClick={() => removeQuestion(idx)}
                                    className="absolute top-4 right-4 text-gray-200 hover:text-red-500 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div className="md:col-span-2 space-y-4">
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400">Enunciat de la Pregunta {idx + 1}</label>
                                        <input
                                            type="text"
                                            value={q.enunciat}
                                            onChange={(e) => updateQuestion(idx, 'enunciat', e.target.value)}
                                            placeholder="Què vols preguntar?"
                                            className="w-full border-b p-2 font-bold outline-none focus:border-blue-900 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400">Tipus de Resposta</label>
                                        <select
                                            value={q.tipus_resposta}
                                            onChange={(e) => updateQuestion(idx, 'tipus_resposta', e.target.value)}
                                            className="w-full border-b p-2 text-xs font-bold bg-white outline-none focus:border-blue-900"
                                        >
                                            <option value="Likert_1_5">Escala 1-5 (Likert)</option>
                                            <option value="Likert_1_10">Escala 1-10</option>
                                            <option value="Multiple">Opció Múltiple</option>
                                            <option value="Oberta">Text Lliure</option>
                                        </select>
                                    </div>
                                </div>

                                {q.tipus_resposta === 'Multiple' && (
                                    <div className="mt-6 p-6 bg-gray-50 border-l-2 border-blue-900 animate-in zoom-in-95 duration-200">
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4">Opcions (separades per comes)</label>
                                        <input
                                            type="text"
                                            value={q.opcions.join(',')}
                                            onChange={(e) => updateQuestion(idx, 'opcions', e.target.value.split(','))}
                                            placeholder="Opció 1, Opció 2, Opció 3..."
                                            className="w-full bg-transparent border-b p-2 text-xs outline-none focus:border-blue-900"
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="pt-8">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-900 text-white py-6 font-black uppercase text-xs tracking-[0.3em] shadow-2xl hover:bg-black active:scale-95 transition-all disabled:opacity-50"
                        >
                            {loading ? 'S\'està creant...' : 'Publicar Model de Qüestionari'}
                        </button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
