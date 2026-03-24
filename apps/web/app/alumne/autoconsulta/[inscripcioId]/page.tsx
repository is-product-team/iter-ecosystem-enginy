'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { THEME } from '@iter/shared';
import { evaluationService } from '@/services/evaluationService';
import { toast } from 'sonner';

export default function StudentSelfEvaluationPage({ params }: { params: Promise<{ inscripcioId: string }> }) {
    const { inscripcioId } = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const [form, setForm] = useState({
        punctuality_tasks: 'Always',
        respect_material: 'Always',
        interest_learning: 'High',
        autonomy_resolution: 'Often',
        valuation_experience: 8,
        valuation_teacher: 8,
        vocational_impact: 'CONSIDERING',
        personal_improvements: '',
        key_learnings: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await evaluationService.submitAutoconsulta({
                id_inscripcio: parseInt(inscripcioId),
                ...form
            });
            setSubmitted(true);
        } catch (err) {
            toast.error("Error sending self-evaluation.");
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-background-page flex items-center justify-center p-8">
                <div className="max-w-md w-full bg-background-surface p-12 text-center border border-border-subtle shadow-xl">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
                        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter mb-4 text-consorci-darkBlue dark:text-consorci-lightBlue">Thank you for your participation!</h2>
                    <p className="text-text-secondary text-sm leading-relaxed mb-8">Your opinion helps us improve the Enginy Program. Your responses have been registered correctly.</p>
                    <button onClick={() => window.close()} className="w-full py-4 bg-black dark:bg-white text-white dark:text-black font-black uppercase text-xs tracking-widest hover:bg-consorci-darkBlue dark:hover:bg-consorci-lightBlue transition-all">Close Window</button>
                </div>
            </div>
        );
    }

    const freqOptions = ['Never', 'Rarely', 'Often', 'Always'];
    const interestOptions = ['Hardly any', 'Some', 'High', 'Very high'];

    return (
        <div className="min-h-screen bg-background-page py-12 px-4 md:px-0">
            <div className="max-w-3xl mx-auto">
                <header className="mb-12 text-center">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-consorci-actionBlue mb-4 block">Enginy Program</span>
                    <h1 className="text-4xl font-black text-consorci-darkBlue dark:text-consorci-lightBlue uppercase tracking-tighter mb-4">Student Self-Evaluation</h1>
                    <p className="text-text-secondary max-w-lg mx-auto text-sm">We want to know your experience during the workshop. Honesty and detail will help us a lot!</p>
                </header>

                <form onSubmit={handleSubmit} className="space-y-8 pb-20">
                    {/* Attitude and Behavior */}
                    <div className="bg-background-surface p-10 border border-border-subtle shadow-sm">
                        <h3 className="text-xs font-black uppercase tracking-widest text-text-muted mb-10 border-b border-border-subtle pb-4">Attitude and Behavior</h3>

                        <div className="space-y-10">
                            <div className="space-y-4">
                                <label className="block text-sm font-bold text-text-primary">Have you been punctual in the delivery of tasks?</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {freqOptions.map(opt => (
                                        <button key={opt} type="button" onClick={() => setForm({ ...form, punctuality_tasks: opt })} className={`py-4 text-[10px] font-black uppercase border-2 transition-all ${form.punctuality_tasks === opt ? 'bg-consorci-darkBlue border-consorci-darkBlue text-white' : 'bg-background-surface border-border-subtle text-text-muted hover:border-consorci-lightBlue'}`}>{opt}</button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="block text-sm font-bold text-text-primary">Have you respected the material and facilities?</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {freqOptions.map(opt => (
                                        <button key={opt} type="button" onClick={() => setForm({ ...form, respect_material: opt })} className={`py-4 text-[10px] font-black uppercase border-2 transition-all ${form.respect_material === opt ? 'bg-consorci-darkBlue border-consorci-darkBlue text-white' : 'bg-background-surface border-border-subtle text-text-muted hover:border-consorci-lightBlue'}`}>{opt}</button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="block text-sm font-bold text-text-primary">What interest have you shown in learning?</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {interestOptions.map(opt => (
                                        <button key={opt} type="button" onClick={() => setForm({ ...form, interest_learning: opt })} className={`py-4 text-[10px] font-black uppercase border-2 transition-all ${form.interest_learning === opt ? 'bg-consorci-darkBlue border-consorci-darkBlue text-white' : 'bg-background-surface border-border-subtle text-text-muted hover:border-consorci-lightBlue'}`}>{opt}</button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="block text-sm font-bold text-text-primary">Have you felt autonomous in solving problems?</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {freqOptions.map(opt => (
                                        <button key={opt} type="button" onClick={() => setForm({ ...form, autonomy_resolution: opt })} className={`py-4 text-[10px] font-black uppercase border-2 transition-all ${form.autonomy_resolution === opt ? 'bg-consorci-darkBlue border-consorci-darkBlue text-white' : 'bg-background-surface border-border-subtle text-text-muted hover:border-consorci-lightBlue'}`}>{opt}</button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Valuation and Satisfaction */}
                    <div className="bg-background-surface p-10 border border-border-subtle shadow-sm">
                        <h3 className="text-xs font-black uppercase tracking-widest text-text-muted mb-10 border-b border-border-subtle pb-4">Valuation and Satisfaction</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-4">
                                <label className="block text-sm font-bold text-text-primary">Overall experience (1-10)</label>
                                <input type="range" min="1" max="10" step="1" value={form.valuation_experience} onChange={(e) => setForm({ ...form, valuation_experience: parseInt(e.target.value) })} className="w-full accent-consorci-darkBlue" />
                                <div className="flex justify-between text-[10px] font-black text-text-muted uppercase"><span>Poor</span><span className="text-2xl text-consorci-darkBlue dark:text-consorci-lightBlue">{form.valuation_experience}</span><span>Excellent</span></div>
                            </div>
                            <div className="space-y-4">
                                <label className="block text-sm font-bold text-text-primary">Teacher quality (1-10)</label>
                                <input type="range" min="1" max="10" step="1" value={form.valuation_teacher} onChange={(e) => setForm({ ...form, valuation_teacher: parseInt(e.target.value) })} className="w-full accent-consorci-darkBlue" />
                                <div className="flex justify-between text-[10px] font-black text-text-muted uppercase"><span>Poor</span><span className="text-2xl text-consorci-darkBlue dark:text-consorci-lightBlue">{form.valuation_teacher}</span><span>Excellent</span></div>
                            </div>
                        </div>
                    </div>

                    {/* Vocational Impact */}
                    <div className="bg-background-surface p-10 border border-border-subtle shadow-sm">
                        <h3 className="text-xs font-black uppercase tracking-widest text-text-muted mb-10 border-b border-border-subtle pb-4">Vocational Impact</h3>
                        <div className="space-y-4">
                            <label className="block text-sm font-bold text-text-primary">Has it helped you decide on your professional future?</label>
                            <div className="flex flex-col gap-4">
                                {['YES', 'NO', 'CONSIDERING'].map(opt => (
                                    <button key={opt} type="button" onClick={() => setForm({ ...form, vocational_impact: opt })} className={`p-4 text-xs font-bold border-2 text-left transition-all ${form.vocational_impact === opt ? 'bg-background-subtle border-consorci-darkBlue text-consorci-darkBlue dark:text-consorci-lightBlue' : 'bg-background-surface border-border-subtle text-text-muted hover:border-consorci-lightBlue'}`}>
                                        {opt === 'YES' ? 'Yes, it has cleared my mind.' : opt === 'NO' ? 'No, I already had it clear or it\'s not for me.' : 'I am considering it right now.'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Open Feedback */}
                    <div className="bg-background-surface p-10 border border-border-subtle shadow-sm space-y-12">
                        <h3 className="text-xs font-black uppercase tracking-widest text-text-muted mb-10 border-b border-border-subtle pb-4">Open Feedback</h3>
                        <div className="space-y-4">
                            <label className="block text-sm font-bold text-text-primary">What would you change or improve from the workshop?</label>
                            <textarea value={form.personal_improvements} onChange={(e) => setForm({ ...form, personal_improvements: e.target.value })} className="w-full h-32 border-2 border-border-subtle bg-background-surface text-text-primary p-6 outline-none focus:border-consorci-darkBlue text-sm italic" placeholder="Your opinion..." />
                        </div>
                        <div className="space-y-4">
                            <label className="block text-sm font-bold text-text-primary">What are your 3 key learnings?</label>
                            <textarea value={form.key_learnings} onChange={(e) => setForm({ ...form, key_learnings: e.target.value })} className="w-full h-32 border-2 border-border-subtle bg-background-surface text-text-primary p-6 outline-none focus:border-consorci-darkBlue text-sm italic" placeholder="1. ... 2. ... 3. ..." />
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="w-full bg-consorci-darkBlue text-white py-10 font-black uppercase text-xl tracking-[0.2em] shadow-[0_20px_50px_rgba(0,66,107,0.3)] hover:bg-black active:scale-95 transition-all disabled:opacity-50">
                        {loading ? 'Sending...' : 'Submit Self-Evaluation'}
                    </button>
                </form>
            </div>
        </div>
    );
}
