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
    assignment: {
        workshop: {
            title: string;
            durationHours: number;
        }
    };
}

export default function StudentDashboardPage() {
    const t = useTranslations('Dashboards.student');
    const [user, setUser] = useState<User | null>(null);
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [loading, setLoading] = useState(true);
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
                // We use the student's ID directly as students may be related via another mapping.
                // Assuming the backend endpoint exists to get certificates by studentId
                // If the user object doesn't have studentId, we'd need to fetch student details.
                // Assuming `/api/certificates/my-certificates` uses the token to find the student
                // Note: The API endpoint logic might need refinement depending on actual auth setup.
                const res = await api.get('/certificates/my-certificates');
                setCertificates(res.data);
            } catch (err) {
                console.error("Error fetching certificates:", err);
                toast.error("Could not load your certificates at this time.");
            } finally {
                setLoading(false);
            }
        };

        fetchCertificates();
    }, [router]);

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
                                         <span className="text-[10px] font-black text-[#4197CB] uppercase tracking-widest bg-blue-50 px-2 py-1 inline-block mb-3">WORKSHOP</span>
                                         <h4 className="font-black text-[#00426B] leading-tight mb-2 uppercase">{cert.assignment?.workshop?.title}</h4>
                                         <p className="text-xs text-gray-500 mb-6">{t('duration')}: {cert.assignment?.workshop?.durationHours}h</p>
                                     </div>
                                     <div>
                                         <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-3">{t('issued')}: {new Date(cert.issuedAt).toLocaleDateString()}</p>
                                         <button 
                                            onClick={() => toast.info(t('pdf_not_implemented'))}
                                            className="w-full py-3 bg-[#00426B] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#0775AB] transition-colors"
                                         >
                                             {t('download_pdf')}
                                         </button>
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
