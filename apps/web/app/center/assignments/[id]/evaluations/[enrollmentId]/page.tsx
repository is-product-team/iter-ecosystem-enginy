'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { getUser, User } from '@/lib/auth';
import { ROLES } from '@iter/shared';
import DashboardLayout from '@/components/DashboardLayout';
import assignmentService from '@/services/assignmentService';
import { evaluationService } from '@/services/evaluationService';
import getApi from '@/services/api';
import Loading from '@/components/Loading';
import { toast } from 'sonner';
import { Enrollment } from '@/services/assignmentService';
import ConfirmDialog from '@/components/ConfirmDialog';

interface Competence {
    competenceId: number;
    name: string;
    description: string;
    type: 'TECNICA' | 'TRANSVERSAL';
}

export default function StudentEvaluationFormPage({ params }: { params: Promise<{ id: string, enrollmentId: string }> }) {
    const { id, enrollmentId } = use(params);
    const [user, setUser] = useState<User | null>(null);
    const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
    const [competencies, setCompetencies] = useState<Competence[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const router = useRouter();

    // Form State
    const [form, setForm] = useState({
        attendancePercentage: 100,
        delayCount: 0,
        observations: '',
        competencies: [] as { competenceId: number; score: number }[]
    });

    // Voice State
    const [isListening, setIsListening] = useState(false);

    // Dialog states
    const [confirmConfig, setConfirmConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        isDestructive?: boolean;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
    });

    useEffect(() => {
        const currentUser = getUser();
        if (!currentUser || (currentUser.role.name !== ROLES.COORDINATOR && currentUser.role.name !== ROLES.ADMIN)) {
            router.push('/login');
            return;
        }
        setUser(currentUser);

        const fetchData = async () => {
            try {
                const api = getApi();
                // 1. Fetch competencies
                const resComp = await evaluationService.getCompetencies();
                setCompetencies(resComp.data);

                // 2. Fetch existing evaluation/student info
                const assignment = await assignmentService.getById(parseInt(id));

                if (!assignment) {
                    toast.error('Assignment not found.');
                    router.push('/center/assignments');
                    return;
                }

                const ins = assignment.enrollments?.find((i: Enrollment) => i.enrollmentId === parseInt(enrollmentId));
                if (!ins) {
                    toast.error('Enrollment not found.');
                    router.push(`/center/assignments/${id}/evaluations`);
                    return;
                }
                setEnrollment(ins);

                // 3. If evaluation exists, pre-fill form
                const resEval = await evaluationService.getEvaluationEnrollment(parseInt(enrollmentId));
                if (resEval.data) {
                    const evalData = resEval.data;
                    setForm({
                        attendancePercentage: evalData.attendancePercentage || 100,
                        delayCount: evalData.lateCount || 0,
                        observations: evalData.observations || '',
                        competencies: evalData.competencies?.map((c: { competenceId: number; score: number }) => ({
                            competenceId: c.competenceId,
                            score: c.score
                        })) || []
                    });
                } else {
                    // Initialize competencies with 3 (sufficient)
                    setForm(prev => ({
                        ...prev,
                        competencies: resComp.data.map((c: Competence) => ({
                            competenceId: c.competenceId,
                            score: 3
                        }))
                    }));
                }

            } catch (error) {
                console.error("Error fetching evaluation data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, enrollmentId, router]);

    const handleRatingChange = (competenceId: number, score: number) => {
        setForm(prev => ({
            ...prev,
            competencies: prev.competencies.map(c =>
                c.competenceId === competenceId ? { ...c, score } : c
            )
        }));
    };

    const startVoiceRecognition = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            toast.error("Your browser does not support voice recognition.");
            return;
        }

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = 'ca-ES';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onresult = (event: { results: { [key: number]: { [key: number]: { transcript: string } } } }) => {
            const transcript = event.results[0][0].transcript;
            setForm(prev => ({ ...prev, observations: prev.observations + " " + transcript }));
        };

        recognition.start();
    };

    const handleAIAnalysis = async () => {
        if (!form.observations.trim()) return;
        setAnalyzing(true);
        try {
            const res = await evaluationService.analyzeObservations(form.observations);
            const { suggestedScore, summary } = res.data;
            setConfirmConfig({
                isOpen: true,
                title: 'AI Analysis',
                message: `AI suggests an average score of ${suggestedScore}. Summary: ${summary}\nDo you want to set the entire evaluation to this level?`,
                onConfirm: () => {
                    setForm(prev => ({
                        ...prev,
                        competencies: prev.competencies.map(c => ({ ...c, score: suggestedScore }))
                    }));
                    setConfirmConfig(prev => ({ ...prev, isOpen: false }));
                }
            });
        } catch (err) {
            toast.error("Error in AI analysis.");
        } finally {
            setAnalyzing(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await evaluationService.upsertEvaluation({
                enrollmentId: parseInt(enrollmentId),
                attendancePercentage: form.attendancePercentage,
                lateCount: form.delayCount,
                observations: form.observations,
                competencies: form.competencies
            });
            toast.success("Evaluation saved successfully.");
            router.push(`/center/assignments/${id}/evaluations`);
        } catch (err) {
            toast.error("Error saving evaluation.");
        } finally {
            setSaving(false);
        }
    };

    if (loading || !enrollment) {
        return <Loading fullScreen message="Loading evaluation form..." />;
    }

    const competenciesT = competencies.filter(c => c.type === 'TECNICA');
    const competenciesG = competencies.filter(c => c.type === 'TRANSVERSAL');

    return (
        <DashboardLayout
            title={`Student Evaluation`}
            subtitle={`${enrollment.student?.fullName} ${enrollment.student?.lastName}`}
        >
            <div className="w-full pb-20">
                <button
                    onClick={() => router.push(`/center/assignments/${id}/evaluations`)}
                    className="mb-8 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Back to list
                </button>

                <form onSubmit={handleSubmit} className="space-y-12">
                    {/* Monitoring Section */}
                    <section className="bg-white p-8 border shadow-sm">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-8">Monitoring and Attendance</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-4">
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-400">Attendance Percentage (%)</label>
                                <div className="flex items-center gap-6">
                                    <input
                                        type="range" min="0" max="100"
                                        value={form.attendancePercentage}
                                        onChange={(e) => setForm({ ...form, attendancePercentage: parseInt(e.target.value) })}
                                        className="flex-1 accent-blue-900"
                                    />
                                    <span className="text-2xl font-black text-blue-900 w-16">{form.attendancePercentage}%</span>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-400">Number of Delays</label>
                                <div className="flex items-center gap-6">
                                    <button type="button" onClick={() => setForm({ ...form, delayCount: Math.max(0, form.delayCount - 1) })} className="w-10 h-10 border-2 font-black text-xl hover:bg-gray-100">-</button>
                                    <span className="text-2xl font-black text-gray-900">{form.delayCount}</span>
                                    <button type="button" onClick={() => setForm({ ...form, delayCount: form.delayCount + 1 })} className="w-10 h-10 border-2 font-black text-xl hover:bg-gray-100">+</button>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Competences Section */}
                    <section className="bg-white p-8 border shadow-sm">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-8">Competence Evaluation (Scale 1-5)</h3>

                        <div className="space-y-12">
                            <div>
                                <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                                    Technical Competences
                                </h4>
                                <div className="space-y-6">
                                    {competenciesT.map(c => (
                                        <div key={c.competenceId} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                                            <div className="mb-4 md:mb-0">
                                                <p className="font-bold text-gray-900">{c.name}</p>
                                                <p className="text-[10px] text-gray-400 max-w-sm">{c.description}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                {[1, 2, 3, 4, 5].map(v => (
                                                    <button
                                                        key={v}
                                                        type="button"
                                                        onClick={() => handleRatingChange(c.competenceId, v)}
                                                        className={`w-10 h-10 border-2 font-black transition-all ${form.competencies.find(comp => comp.competenceId === c.competenceId)?.score === v
                                                            ? 'bg-blue-900 border-blue-900 text-white shadow-md scale-110'
                                                            : 'bg-white border-gray-200 text-gray-300 hover:border-blue-200'
                                                            }`}
                                                    >
                                                        {v}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                                    Transversal Competences
                                </h4>
                                <div className="space-y-6">
                                    {competenciesG.map(c => (
                                        <div key={c.competenceId} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                                            <div className="mb-4 md:mb-0">
                                                <p className="font-bold text-gray-900">{c.name}</p>
                                                <p className="text-[10px] text-gray-400 max-w-sm">{c.description}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                {[1, 2, 3, 4, 5].map(v => (
                                                    <button
                                                        key={v}
                                                        type="button"
                                                        onClick={() => handleRatingChange(c.competenceId, v)}
                                                        className={`w-10 h-10 border-2 font-black transition-all ${form.competencies.find(comp => comp.competenceId === c.competenceId)?.score === v
                                                            ? 'bg-blue-900 border-blue-900 text-white shadow-md scale-110'
                                                            : 'bg-white border-gray-200 text-gray-300 hover:border-blue-200'
                                                            }`}
                                                    >
                                                        {v}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Observations and AI Section */}
                    <section className="bg-white p-8 border shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Observations</h3>
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={startVoiceRecognition}
                                    className={`flex items-center gap-2 text-[10px] font-black uppercase px-4 py-2 border-2 transition-all ${isListening ? 'bg-red-50 border-red-500 text-red-500 animate-pulse' : 'hover:bg-gray-100'
                                        }`}
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                                    {isListening ? 'Listening...' : 'Voice Dictation'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleAIAnalysis}
                                    disabled={analyzing || !form.observations.trim()}
                                    className="flex items-center gap-2 text-[10px] font-black uppercase px-4 py-2 bg-purple-100 text-purple-700 hover:bg-purple-200 transition-all disabled:opacity-50"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                    {analyzing ? 'Analyzing...' : 'AI Analysis'}
                                </button>
                            </div>
                        </div>
                        <textarea
                            className="w-full h-40 border-2 p-6 outline-none focus:border-blue-900 transition-colors text-sm italic"
                            placeholder="Write your observations or use voice dictation..."
                            value={form.observations}
                            onChange={(e) => setForm({ ...form, observations: e.target.value })}
                        />
                    </section>

                    {/* Action Footer */}
                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 bg-blue-900 text-white py-4 font-black uppercase text-xs tracking-widest shadow-xl hover:bg-black active:scale-95 transition-all disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Confirm Evaluation'}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-12 bg-white border font-black uppercase text-xs tracking-widest hover:bg-gray-100 transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
            <ConfirmDialog
                isOpen={confirmConfig.isOpen}
                title={confirmConfig.title}
                message={confirmConfig.message}
                onConfirm={confirmConfig.onConfirm}
                onCancel={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
                isDestructive={confirmConfig.isDestructive}
            />
        </DashboardLayout>
    );
}
