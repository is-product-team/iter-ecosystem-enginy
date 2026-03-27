'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { getUser, User } from '@/lib/auth';
import DashboardLayout from '@/components/DashboardLayout';
import { ROLES } from '@iter/shared';
import getApi from '@/services/api';
import Loading from '@/components/Loading';
import { toast } from 'sonner';

interface AssignacioDetall {
  taller?: { titol: string };
  prof1?: { nom: string };
  prof2?: { nom: string };
  sessions?: {
    id_sessio: number;
    data_sessio: string;
    hora_inici?: string;
    hora_fi?: string;
    staff?: { id_usuari: number; usuari?: { nom_complet: string } }[];
  }[];
}

export default function SessionManagementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [user, setUser] = useState<User | null>(null);
  const [assignacio, setAssignacio] = useState<AssignacioDetall | null>(null);
  const [loading, setLoading] = useState(true);
  const [allProfessors, setAllProfessors] = useState<{ id_usuari: number; nom: string }[]>([]);
  const router = useRouter();

  useEffect(() => {
    const currentUser = getUser();
    if (!currentUser || currentUser.role.name !== ROLES.COORDINATOR) {
      router.push('/login');
      return;
    }
    setUser(currentUser);

    const fetchData = async () => {
      try {
        const api = getApi();
        const [resAssig, resProfs] = await Promise.all([
          api.get(`/assignacions/${id}`),
          api.get('/professors')
        ]);
        
        setAssignacio(resAssig.data);
        setAllProfessors(resProfs.data || []);
      } catch (error) {
        toast.error('Error loading data.');
        router.push('/center/sessions');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, router]);

  const handleAddSessionStaff = async (idSessio: number, idUsuari: number) => {
    try {
      const api = getApi();
      await api.post(`/assignacions/sessions/${idSessio}/staff`, { idUsuari });
      
      const res = await api.get(`/assignacions/${id}`);
      setAssignacio(res.data);
      toast.success('Teacher added to session.');
    } catch (error) {
      toast.error('Error adding teacher to session.');
    }
  };

  const handleRemoveSessionStaff = async (idSessio: number, idUsuari: number) => {
    try {
      const api = getApi();
      await api.delete(`/assignacions/sessions/${idSessio}/staff/${idUsuari}`);
      
      const res = await api.get(`/assignacions/${id}`);
      setAssignacio(res.data);
      toast.success('Teacher removed from session.');
    } catch (error) {
      toast.error('Error removing teacher from session.');
    }
  };

  if (loading || !assignacio) return <Loading fullScreen message="Loading sessions..." />;

  return (
    <DashboardLayout 
      title={`SESSIONS: ${assignacio.taller?.titol}`}
      subtitle="Manage the teaching team for each day."
    >
        <div className="mb-8 p-6 bg-white border border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
                <h3 className="text-lg font-black text-[#00426B] uppercase">General Referent Team</h3>
                <div className="flex gap-4 mt-2">
                    <span className="text-xs font-bold text-gray-500 bg-gray-50 px-3 py-1 border border-gray-100">{assignacio.prof1?.nom || 'Pending'}</span>
                    <span className="text-xs font-bold text-gray-500 bg-gray-50 px-3 py-1 border border-gray-100">{assignacio.prof2?.nom || 'Pending'}</span>
                </div>
            </div>
            <button 
                onClick={() => router.push('/center/sessions')}
                className="text-xs font-bold text-[#4197CB] hover:text-[#00426B] uppercase tracking-widest flex items-center gap-2"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Back to list
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
            {assignacio.sessions?.map((sessio: { 
              id_sessio: number; 
              data_sessio: string; 
              hora_inici?: string; 
              hora_fi?: string; 
              staff?: { id_usuari: number; usuari?: { nom_complet: string } }[] 
            }, idx: number) => (
            <div key={sessio.id_sessio} className="bg-white border border-gray-200 p-6 flex flex-col gap-4 group hover:border-[#4197CB] transition-all shadow-sm">
                <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                    <span className="text-[10px] font-black text-[#4197CB] uppercase tracking-widest">Session {idx + 1}</span>
                    <span className="text-sm font-black text-[#00426B] uppercase">
                        {new Date(sessio.data_sessio).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </span>
                    </div>
                    <div className="text-[10px] font-bold text-gray-300">
                    {sessio.hora_inici || '09:00'} - {sessio.hora_fi || '11:00'}
                    </div>
                </div>

                <div className="border-t border-gray-50 pt-4 flex flex-col gap-3">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">SPECIFIC TEACHING TEAM</span>
                    <div className="flex flex-wrap gap-2 min-h-[32px]">
                        {sessio.staff?.map((sp: { id_usuari: number; usuari?: { nom_complet: string } }) => (
                        <div key={sp.id_usuari} className="flex items-center gap-2 bg-[#F8FAFC] border border-gray-100 pl-2 pr-1 py-1 group/chip">
                            <span className="text-[10px] font-bold text-[#00426B] uppercase">{sp.usuari?.nom_complet}</span>
                            <button 
                                onClick={() => handleRemoveSessionStaff(sessio.id_sessio, sp.id_usuari)}
                                className="hover:text-red-500 text-gray-300 transition-colors p-0.5"
                            >
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        ))}
                        {(!sessio.staff || sessio.staff.length === 0) && (
                        <span className="text-[10px] text-gray-300 italic font-medium">Use referent team</span>
                        )}
                    </div>
                </div>

                <div className="mt-auto pt-2">
                    <select 
                    onChange={(e) => {
                        if (e.target.value) {
                        handleAddSessionStaff(sessio.id_sessio, parseInt(e.target.value));
                        e.target.value = "";
                        }
                    }}
                    className="w-full text-[10px] font-bold uppercase tracking-widest bg-gray-50 border-none focus:ring-1 focus:ring-[#00426B] p-2 text-gray-500 cursor-pointer"
                    defaultValue=""
                    >
                    <option value="" disabled>+ Modify teacher for day</option>
                    {allProfessors?.map((p: { id_usuari: number; nom: string }) => (
                        <option key={p.id_usuari} value={p.id_usuari}>{p.nom} (TEACHER)</option>
                    ))}
                    </select>
                </div>
            </div>
            ))}
        </div>
    </DashboardLayout>
  );
}
