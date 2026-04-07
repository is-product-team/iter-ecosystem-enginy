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
                    <div className="bg-background-surface p-12 border border-border-subtle space-y-10">
                        <h3 className="text-[13px] font-medium text-consorci-darkBlue uppercase tracking-wider opacity-80 mb-8">General configuration</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-4">
                                <label className="block text-[13px] font-medium text-text-primary px-1">Questionnaire title</label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    placeholder="Ex: Workshop Satisfaction Survey 2026"
                                    className="w-full border-b border-border-subtle p-5 text-2xl font-medium outline-none focus:border-consorci-darkBlue transition-all bg-transparent"
                                />
                            </div>
                            <div className="space-y-4">
                                <label className="block text-[13px] font-medium text-text-primary px-1">Target audience</label>
                                <select
                                    value={form.target}
                                    onChange={(e) => setForm({ ...form, target: e.target.value })}
                                    className="w-full border-b border-border-subtle p-5 text-[15px] font-medium bg-transparent outline-none focus:border-consorci-darkBlue appearance-none"
                                >
                                    <option value="STUDENT">Students</option>
                                    <option value="TEACHER">Teachers</option>
                                    <option value="CENTER">Reference Center</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Questions */}
                    <div className="space-y-8">
                        <div className="flex justify-between items-center">
                            <h3 className="text-[13px] font-medium text-text-muted uppercase tracking-wider opacity-60">QUESTIONS ({form.questions.length})</h3>
                            <button
                                type="button"
                                onClick={addQuestion}
                                className="bg-consorci-darkBlue text-white px-6 py-2.5 text-[13px] font-medium transition-all hover:bg-black active:scale-[0.98]"
                            >
                                + Add question
                            </button>
                        </div>

                        {form.questions.map((q, idx) => (
                            <div key={idx} className="bg-background-surface p-10 border border-border-subtle relative group animate-in fade-in slide-in-from-bottom-4 duration-300">
                                <button
                                    type="button"
                                    onClick={() => removeQuestion(idx)}
                                    className="absolute top-6 right-6 text-text-muted opacity-30 hover:opacity-100 hover:text-red-500 transition-all"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                                    <div className="md:col-span-2 space-y-4">
                                        <label className="block text-[12px] font-medium text-text-muted px-1">QUESTION TEXT {idx + 1}</label>
                                        <input
                                            type="text"
                                            value={q.text}
                                            onChange={(e) => updateQuestion(idx, 'text', e.target.value)}
                                            placeholder="What do you want to ask?"
                                            className="w-full border-b border-border-subtle p-3 font-medium text-[16px] outline-none focus:border-consorci-darkBlue transition-all bg-transparent"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="block text-[12px] font-medium text-text-muted px-1">RESPONSE TYPE</label>
                                        <select
                                            value={q.response_type}
                                            onChange={(e) => updateQuestion(idx, 'response_type', e.target.value)}
                                            className="w-full border-b border-border-subtle p-3 text-[14px] font-medium bg-transparent outline-none focus:border-consorci-darkBlue appearance-none"
                                        >
                                            <option value="Likert_1_5">Scale 1-5 (Likert)</option>
                                            <option value="Likert_1_10">Scale 1-10</option>
                                            <option value="Multiple">Multiple Choice</option>
                                            <option value="Open">Free Text</option>
                                        </select>
                                    </div>
                                </div>

                                {q.response_type === 'Multiple' && (
                                    <div className="mt-10 p-8 bg-background-subtle border border-border-subtle animate-in zoom-in-95 duration-200">
                                        <label className="block text-[12px] font-medium text-text-muted mb-4 px-1">OPTIONS (SEPARATED BY COMMAS)</label>
                                        <input
                                            type="text"
                                            value={q.options.join(',')}
                                            onChange={(e) => updateQuestion(idx, 'options', e.target.value.split(','))}
                                            placeholder="Option 1, Option 2, Option 3..."
                                            className="w-full bg-transparent border-b border-border-subtle p-3 text-[14px] font-medium outline-none focus:border-consorci-darkBlue"
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="pt-12">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-consorci-darkBlue text-white py-5 font-medium text-[15px] hover:bg-black active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Publish questionnaire model'}
                        </button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
