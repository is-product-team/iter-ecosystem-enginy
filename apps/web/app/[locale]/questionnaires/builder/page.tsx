'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import getApi from '@/services/api';
import { toast } from 'sonner';

export default function QuestionnaireBuilderPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        title: '',
        target: 'STUDENT',
        questions: [
            { text: '', response_type: 'Likert_1_5', options: [] as string[] }
        ]
    });

    const addQuestion = () => {
        setForm({
            ...form,
            questions: [...form.questions, { text: '', response_type: 'Likert_1_5', options: [] }]
        });
    };

    const removeQuestion = (index: number) => {
        setForm({
            ...form,
            questions: form.questions.filter((_, i) => i !== index)
        });
    };

    const updateQuestion = (index: number, field: string, value: string | string[]) => {
        const newQuestions = [...form.questions];
        (newQuestions[index] as Record<string, string | string[]>)[field] = value;
        setForm({ ...form, questions: newQuestions });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title.trim() || form.questions.some(p => !p.text.trim())) {
            toast.error("Please fill in all fields.");
            return;
        }

        setLoading(true);
        try {
            const api = getApi();
            await api.post('/questionnaires/model', form);
            toast.success("Questionnaire model created successfully.");
            router.push('/admin/questionnaires');
        } catch (err) {
            toast.error("Error creating the questionnaire.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout
            title="Questionnaire Builder"
            subtitle="Create dynamic forms for centers, teachers, or students."
        >
            <div className="w-full pb-20">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Configuration */}
                    <div className="bg-white p-10 border shadow-sm space-y-8">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-6">General Configuration</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-400">Questionnaire Title</label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    placeholder="Ex: Workshop Satisfaction Survey 2026"
                                    className="w-full border-b-2 p-4 text-xl font-bold outline-none focus:border-blue-900 transition-all"
                                />
                            </div>
                            <div className="space-y-4">
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-400">Target Audience</label>
                                <select
                                    value={form.target}
                                    onChange={(e) => setForm({ ...form, target: e.target.value })}
                                    className="w-full border-b-2 p-4 text-sm font-bold bg-white outline-none focus:border-blue-900"
                                >
                                    <option value="STUDENT">Students</option>
                                    <option value="TEACHER">Teachers</option>
                                    <option value="CENTER">Reference Center</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Questions */}
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Questions ({form.questions.length})</h3>
                            <button
                                type="button"
                                onClick={addQuestion}
                                className="bg-black text-white px-6 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-blue-900 transition-all shadow-md"
                            >
                                + Add Question
                            </button>
                        </div>

                        {form.questions.map((q, idx) => (
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
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400">Question Text {idx + 1}</label>
                                        <input
                                            type="text"
                                            value={q.text}
                                            onChange={(e) => updateQuestion(idx, 'text', e.target.value)}
                                            placeholder="What do you want to ask?"
                                            className="w-full border-b p-2 font-bold outline-none focus:border-blue-900 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400">Response Type</label>
                                        <select
                                            value={q.response_type}
                                            onChange={(e) => updateQuestion(idx, 'response_type', e.target.value)}
                                            className="w-full border-b p-2 text-xs font-bold bg-white outline-none focus:border-blue-900"
                                        >
                                            <option value="Likert_1_5">Scale 1-5 (Likert)</option>
                                            <option value="Likert_1_10">Scale 1-10</option>
                                            <option value="Multiple">Multiple Choice</option>
                                            <option value="Open">Free Text</option>
                                        </select>
                                    </div>
                                </div>

                                {q.response_type === 'Multiple' && (
                                    <div className="mt-6 p-6 bg-gray-50 border-l-2 border-blue-900 animate-in zoom-in-95 duration-200">
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4">Options (separated by commas)</label>
                                        <input
                                            type="text"
                                            value={q.options.join(',')}
                                            onChange={(e) => updateQuestion(idx, 'options', e.target.value.split(','))}
                                            placeholder="Option 1, Option 2, Option 3..."
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
                            {loading ? 'Creating...' : 'Publish Questionnaire Model'}
                        </button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
