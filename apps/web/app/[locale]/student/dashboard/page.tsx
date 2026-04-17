'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { getUser, User } from '@/lib/auth';
import { ROLES } from '@iter/shared';
import DashboardLayout from '@/components/DashboardLayout';
import Loading from '@/components/Loading';
import { toast } from 'sonner';
import getApi from '@/services/api';

interface Certificate {
    studentId: number;
    assignmentId: number;
    issuedAt: string;
    surveyCompleted: boolean;
    assignment: {
        workshop: {
            title: string;
            durationHours: number;
        }
    };
}

export default function StudentDashboardPage() {
    const t = useTranslations('Dashboards.student');
    const tCommon = useTranslations('Common');
    const [user, setUser] = useState<User | null>(null);
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState<number | null>(null);
    const router = useRouter();

    useEffect(() => {
        const currentUser = getUser();
        if (!currentUser || currentUser.role.name !== ROLES.STUDENT) {
            router.push('/login');
            return;
        }
        setUser(currentUser);

        const fetchCertificates = async () => {
            try {
                const api = getApi();
                const res = await api.get('/certificates/my-certificates');
                setCertificates(res.data);
            } catch (err) {
                console.error("Error fetching certificates:", err);
                toast.error(tCommon('loading_error'));
            } finally {
                setLoading(false);
            }
        };

        fetchCertificates();
    }, [router, tCommon]);

    const handleDownload = async (assignmentId: number) => {
        setDownloading(assignmentId);
        try {
            const api = getApi();
            const response = await api.get(`/certificates/download/${assignmentId}`, {
                responseType: 'blob'
            });
            
            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `certificat_taller_${assignmentId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success(tCommon('success_download'));
        } catch (err: any) {
            console.error("Download error:", err);
            if (err.response?.data?.error === 'SURVEY_REQUIRED') {
                toast.error(t('survey_required_msg'));
            } else {
                toast.error(t('download_error'));
            }
        } finally {
            setDownloading(null);
        }
    };

    if (loading || !user) {
        return <Loading fullScreen message={t('loading')} />;
    }

    return (
        <DashboardLayout
            title={`${t('title')}, ${user.fullName}`}
            subtitle={t('subtitle')}
        >
            <div className="w-full pb-20">
                <section className="bg-white border-2 border-gray-100 p-8 shadow-sm relative overflow-hidden mb-8">
                     <h3 className="text-xl font-black text-[#00426B] uppercase tracking-tighter mb-6">
                        {t('certificates_title')}
                     </h3>
                     
                     {certificates.length === 0 ? (
                        <div className="p-10 text-center bg-gray-50 border border-gray-100">
                             <p className="text-[11px] font-black uppercase text-gray-400 tracking-[0.2em] mb-2">{t('no_certificates')}</p>
                             <p className="text-xs text-gray-500">{t('no_certificates_desc')}</p>
                        </div>
                     ) : (
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                             {certificates.map(cert => (
                                 <div key={`${cert.studentId}-${cert.assignmentId}`} className="border-2 border-gray-100 p-6 flex flex-col justify-between hover:border-[#00426B] transition-colors">
                                     <div>
                                         <span className="text-[10px] font-black text-[#4197CB] uppercase tracking-widest bg-blue-50 px-2 py-1 inline-block mb-3">
                                            {tCommon('badges.workshop')}
                                         </span>
                                         <h4 className="font-black text-[#00426B] leading-tight mb-2 uppercase">{cert.assignment?.workshop?.title}</h4>
                                         <p className="text-xs text-gray-500 mb-6">{t('duration')}: {cert.assignment?.workshop?.durationHours}h</p>
                                     </div>
                                     <div className="space-y-3">
                                         <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t('issued')}: {new Date(cert.issuedAt).toLocaleDateString()}</p>
                                         
                                         {cert.surveyCompleted ? (
                                             <button 
                                                disabled={downloading === cert.assignmentId}
                                                onClick={() => handleDownload(cert.assignmentId)}
                                                className="w-full py-3 bg-[#00426B] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#0775AB] transition-colors flex items-center justify-center gap-2"
                                             >
                                                 {downloading === cert.assignmentId && <Loading size="mini" white />}
                                                 {t('download_pdf')}
                                             </button>
                                         ) : (
                                             <div className="space-y-2">
                                                 <div className="bg-amber-50 border border-amber-100 p-3 text-[10px] text-amber-700 font-medium leading-relaxed">
                                                     {t('survey_pending_notice')}
                                                 </div>
                                                 <button 
                                                    onClick={() => router.push('/survey')}
                                                    className="w-full py-3 bg-white border-2 border-[#00426B] text-[#00426B] text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-colors"
                                                 >
                                                     {t('take_survey_button')}
                                                 </button>
                                             </div>
                                         )}
                                     </div>
                                 </div>
                             ))}
                         </div>
                     )}
                </section>
            </div>
        </DashboardLayout>
    );
}
