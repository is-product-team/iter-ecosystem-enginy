'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import getApi from '@/services/api';
import { toast } from 'sonner';
import Loading from '@/components/Loading';

export default function PublicSurveyPage() {
    const t = useTranslations('PublicSurvey');
    const [email, setEmail] = useState('');
    const [step, setStep] = useState<'IDENTIFY' | 'SURVEY' | 'SUCCESS'>('IDENTIFY');
    const [loading, setLoading] = useState(false);
    const [surveyData, setSurveyData] = useState<any>(null);
    const [formData, setFormData] = useState({
        workshopClarity: 10,
        materialQuality: 10,
        learningInterest: 10,
        supportRating: 10,
        experienceRating: 10,
        teacherRating: 10,
        vocationalImpact: 'SI',
        keyLearnings: '',
    });

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        try {
            const api = getApi();
            const res = await api.get(`/public/surveys/verify?email=${email}`);
            setSurveyData(res.data);
            setStep('SURVEY');
        } catch (err: any) {
            console.error(err);
            const msg = err.response?.data?.message || t('error_no_survey');
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const api = getApi();
            await api.post('/public/surveys/submit', {
                ...formData,
                enrollmentId: surveyData.enrollmentId
            });
            setStep('SUCCESS');
            toast.success(t('submit_success'));
        } catch (err) {
            console.error(err);
            toast.error(t('submit_error'));
        } finally {
            setLoading(false);
        }
    };

    const RatingScale = ({ label, field, value }: { label: string; field: string; value: number }) => (
        <div className="py-6 border-b border-gray-100 last:border-0">
            <div className="mb-4">
                <label className="text-sm font-semibold text-gray-700">{label}</label>
            </div>
            <div className="flex justify-between items-center gap-2 max-w-lg">
                <span className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">Gens</span>
                <div className="flex gap-1 sm:gap-2 flex-1 justify-center">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <button
                            key={num}
                            type="button"
                            onClick={() => setFormData(p => ({ ...p, [field]: num }))}
                            className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full text-xs font-bold transition-all border-2 flex items-center justify-center ${
                                value === num 
                                    ? 'bg-[#00426B] border-[#00426B] text-white shadow-lg' 
                                    : 'bg-white border-gray-200 text-gray-400 hover:border-[#00426B] hover:text-[#00426B]'
                            }`}
                        >
                            {num}
                        </button>
                    ))}
                </div>
                <span className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">Molt</span>
            </div>
        </div>
    );

    if (step === 'IDENTIFY') {
        return (
            <div className="min-h-screen bg-gray-50 font-['Inter',_sans-serif] flex flex-col items-center justify-center p-6">
                <div className="w-full max-w-lg">
                    <div className="h-2 w-full bg-[#00426B] rounded-t-lg shadow-sm"></div>
                    <div className="bg-white p-10 rounded-b-lg shadow-sm border border-gray-200 border-t-0 space-y-8">
                        <div className="text-center space-y-2">
                            <h1 className="text-3xl font-extrabold text-[#00426B] tracking-tight">{t('title')}</h1>
                            <p className="text-sm text-gray-400 font-medium">{t('subtitle')}</p>
                        </div>

                        <form onSubmit={handleVerify} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">{t('email_label')}</label>
                                <input 
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full p-3 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#00426B]/10 focus:border-[#00426B] outline-none transition-all"
                                    placeholder={t('email_placeholder')}
                                    required
                                />
                            </div>
                            <button 
                                disabled={loading}
                                className="w-full py-3 bg-[#00426B] text-white text-sm font-bold rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
                            >
                                {loading && <Loading size="mini" white />}
                                {loading ? t('verifying') : t('verify_button')}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    if (step === 'SUCCESS') {
        return (
            <div className="min-h-screen bg-gray-50 font-['Inter',_sans-serif] flex items-center justify-center p-6">
                <div className="max-w-md w-full">
                    <div className="h-2 w-full bg-green-500 rounded-t-lg shadow-sm"></div>
                    <div className="bg-white p-12 rounded-b-lg shadow-sm border border-gray-200 border-t-0 text-center">
                        <div className="w-16 h-16 bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-6 rounded-full">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">{t('success_title')}</h2>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            {t('success_message')}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-['Inter',_sans-serif] py-12 px-6">
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="relative">
                    <div className="h-2 w-full bg-[#00426B] rounded-t-lg shadow-sm absolute top-0 left-0"></div>
                    <div className="bg-white pt-8 pb-10 px-8 rounded-lg shadow-sm border border-gray-200">
                        <h2 className="text-2xl font-bold text-gray-800 mb-1">{surveyData.workshopTitle}</h2>
                        <p className="text-sm text-gray-500">{t('subtitle_with_name', { name: surveyData.fullName })}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 pb-20">
                    <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="text-xs font-black text-[#00426B] uppercase tracking-widest mb-6 border-b border-gray-50 pb-4">{t('section_quality')}</h3>
                        <RatingScale label={t('label_interest')} field="learningInterest" value={formData.learningInterest} />
                        <RatingScale label={t('label_clarity')} field="workshopClarity" value={formData.workshopClarity} />
                        <RatingScale label={t('label_material')} field="materialQuality" value={formData.materialQuality} />
                        <RatingScale label={t('label_support')} field="supportRating" value={formData.supportRating} />
                    </div>

                    <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="text-xs font-black text-[#00426B] uppercase tracking-widest mb-6 border-b border-gray-50 pb-4">{t('section_experience')}</h3>
                        <RatingScale label={t('label_overall')} field="experienceRating" value={formData.experienceRating} />
                        <RatingScale label={t('label_teacher')} field="teacherRating" value={formData.teacherRating} />
                    </div>

                    <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="text-xs font-black text-[#00426B] uppercase tracking-widest mb-6 border-b border-gray-50 pb-4">{t('section_vocational')}</h3>
                        <div className="space-y-4">
                            <label className="text-sm font-semibold text-gray-700">{t('label_future')}</label>
                            <div className="space-y-2">
                                {[
                                    { id: 'SI', label: t('opt_future_yes') },
                                    { id: 'NO', label: t('opt_future_no') },
                                    { id: 'CONSIDERANT', label: t('opt_future_maybe') }
                                ].map((opt) => (
                                    <label key={opt.id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer transition-all">
                                        <input 
                                            type="radio" 
                                            name="vocationalImpact"
                                            value={opt.id}
                                            checked={formData.vocationalImpact === opt.id}
                                            onChange={(e) => setFormData(p => ({ ...p, vocationalImpact: e.target.value }))}
                                            className="w-4 h-4 text-[#00426B] border-gray-300 focus:ring-[#00426B]"
                                        />
                                        <span className="text-sm text-gray-600">{opt.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
                        <div className="space-y-4">
                            <label className="text-sm font-semibold text-gray-700">{t('label_comments')}</label>
                            <textarea 
                                value={formData.keyLearnings}
                                onChange={(e) => setFormData(p => ({ ...p, keyLearnings: e.target.value }))}
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 outline-none focus:bg-white focus:border-[#00426B] transition-all min-h-[100px] resize-none"
                                placeholder={t('footer_note')}
                            />
                        </div>
                    </div>

                    <div className="flex justify-between items-center gap-4">
                        <p className="text-xs text-gray-400">{t('footer_note')}</p>
                        <button 
                            disabled={loading}
                            className="px-8 py-3 bg-[#00426B] text-white text-sm font-bold rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                            {loading && <Loading size="mini" white />}
                            {loading ? t('submitting') : t('submit_button')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
