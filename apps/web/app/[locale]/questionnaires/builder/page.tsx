'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import getApi from '@/services/api';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

export default function QuestionnaireBuilderPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const t = useTranslations('Questionnaires');
    const tc = useTranslations('Common');

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
            toast.error(tc("fill_all_fields"));
            return;
        }

        setLoading(true);
        try {
            const api = getApi();
            await api.post('/questionnaires/model', form);
            toast.success(t("builder.save_success"));
            router.push('/admin/questionnaires');
        } catch (err) {
            toast.error(t("builder.save_error"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout
            title={t('builder.title')}
            subtitle={t('subtitle')}
        >
            <div className="w-full pb-20">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Configuration */}
                    <div className="bg-background-surface p-12 border border-border-subtle space-y-10">
                        <h3 className="text-[13px] font-medium text-consorci-darkBlue uppercase tracking-wider opacity-80 mb-8">{t('builder.general_config')}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-4">
                                <label className="block text-[13px] font-medium text-text-primary px-1">{t('builder.form_title')}</label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    placeholder={t('builder.placeholder_title')}
                                    className="w-full border-b border-border-subtle p-5 text-2xl font-medium outline-none focus:border-consorci-darkBlue transition-all bg-transparent"
                                />
                            </div>
                            <div className="space-y-4">
                                <label className="block text-[13px] font-medium text-text-primary px-1">{t('builder.target_audience')}</label>
                                <select
                                    value={form.target}
                                    onChange={(e) => setForm({ ...form, target: e.target.value })}
                                    className="w-full border-b border-border-subtle p-5 text-[15px] font-medium bg-transparent outline-none focus:border-consorci-darkBlue appearance-none"
                                >
                                    <option value="STUDENT">{t('builder.audience.student')}</option>
                                    <option value="TEACHER">{t('builder.audience.teacher')}</option>
                                    <option value="CENTER">{t('builder.audience.center')}</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Questions */}
                    <div className="space-y-8">
                        <div className="flex justify-between items-center">
                            <h3 className="text-[13px] font-medium text-text-muted uppercase tracking-wider opacity-60">{t('builder.questions_title', { count: form.questions.length })}</h3>
                            <button
                                type="button"
                                onClick={addQuestion}
                                className="bg-consorci-darkBlue text-white px-6 py-2.5 text-[13px] font-medium transition-all hover:bg-black active:scale-[0.98]"
                            >
                                + {t('builder.add_question')}
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
                                        <label className="block text-[12px] font-medium text-text-muted px-1">{t('builder.question_text', { number: idx + 1 })}</label>
                                        <input
                                            type="text"
                                            value={q.text}
                                            onChange={(e) => updateQuestion(idx, 'text', e.target.value)}
                                            placeholder={t('builder.placeholder_question')}
                                            className="w-full border-b border-border-subtle p-3 font-medium text-[16px] outline-none focus:border-consorci-darkBlue transition-all bg-transparent"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="block text-[12px] font-medium text-text-muted px-1">{t('builder.response_type')}</label>
                                        <select
                                            value={q.response_type}
                                            onChange={(e) => updateQuestion(idx, 'response_type', e.target.value)}
                                            className="w-full border-b border-border-subtle p-3 text-[14px] font-medium bg-transparent outline-none focus:border-consorci-darkBlue appearance-none"
                                        >
                                            <option value="Likert_1_5">{t('builder.types.likert_5')}</option>
                                            <option value="Likert_1_10">{t('builder.types.likert_10')}</option>
                                            <option value="Multiple">{t('builder.types.multiple')}</option>
                                            <option value="Open">{t('builder.types.open')}</option>
                                        </select>
                                    </div>
                                </div>

                                {q.response_type === 'Multiple' && (
                                    <div className="mt-10 p-8 bg-background-subtle border border-border-subtle animate-in zoom-in-95 duration-200">
                                        <label className="block text-[12px] font-medium text-text-muted mb-4 px-1">{t('builder.options_label')}</label>
                                        <input
                                            type="text"
                                            value={q.options.join(',')}
                                            onChange={(e) => updateQuestion(idx, 'options', e.target.value.split(','))}
                                            placeholder={t('builder.placeholder_options')}
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
                            {loading ? tc('loading') : t('builder.publish')}
                        </button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
