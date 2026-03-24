'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { getUser, User } from '@/lib/auth';
import { THEME, PHASES, ROLES } from '@iter/shared';
import DashboardLayout from '@/components/DashboardLayout';
import assignmentService from '@/services/assignmentService';
import teacherService, { Teacher } from '@/services/teacherService';
import getApi from '@/services/api';
import Loading from '@/components/Loading';
import { toast } from 'sonner';

export default function DesignateProfessorsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [user, setUser] = useState<User | null>(null);
  const [assignment, setAssignment] = useState<any>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [prof1Id, setProf1Id] = useState<string>('');
  const [prof2Id, setProf2Id] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const currentUser = getUser();
    if (!currentUser || currentUser.rol.nom_rol !== ROLES.COORDINATOR) {
      router.push('/login');
      return;
    }
    setUser(currentUser);

    const fetchData = async () => {
      try {
        const api = getApi();
        
        // Fetch phases first for gating
        const resFases = await api.get("/phases");
        const phasesData = resFases.data.data;
        const isPlanning = phasesData.find((f: any) => f.nom === PHASES.PLANNING)?.activa;
        
        if (!isPlanning) {
          toast.error('The teacher designation period is not active.');
          router.push('/center/assignments');
          return;
        }

        // Fetch assignment
        const found = await assignmentService.getById(parseInt(id));
        
        if (!found) {
          toast.error('Assignment not found.');
          router.push('/center/assignments');
          return;
        }
        setAssignment(found);
        setProf1Id(found.teacher1?.id_user?.toString() || '');
        setProf2Id(found.teacher2?.id_user?.toString() || '');
        
        // Fetch all teachers from center
        const resProfs = await teacherService.getByCenter(currentUser.id_center || 0);
        setTeachers(resProfs || []);
      } catch (error) {
        console.error("Error fetching designation data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, router]);

  const handleSave = async () => {
    if (!prof1Id || !prof2Id) {
      toast.error('You must designate two referring teachers.');
      return;
    }

    if (prof1Id === prof2Id) {
      toast.error('The two teachers must be different people.');
      return;
    }

    try {
      setLoading(true);
      const api = getApi();
      
      await api.patch(`/assignments/checklist/designate-teachers/${id}`, {
        teacher1_id: parseInt(prof1Id),
        teacher2_id: parseInt(prof2Id)
      });
      
      toast.success('Teachers designated correctly.');
      router.push('/center/assignments');
    } catch (error) {
      toast.error('Error saving designation.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !assignment) return <Loading fullScreen message="Loading designation..." />;

  return (
    <DashboardLayout 
      title={`Designate Teachers: ${assignment.workshop?.title}`} 
      subtitle="Designate the two referring teachers who will be responsible for monitoring."
    >
      <div className="max-w-2xl mx-auto pb-20">
        <div className="bg-white border shadow-sm p-10">
          <div className="mb-10">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-8 flex items-center gap-3">
              <span className="w-6 h-px bg-gray-200"></span>
              Selection of Referents
            </h3>
            
            <div className="space-y-8">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Main Teacher</label>
                <select 
                  value={prof1Id}
                  onChange={(e) => setProf1Id(e.target.value)}
                  className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-600 outline-none rounded-none transition-all font-bold text-gray-800"
                >
                  <option value="">Select...</option>
                  {teachers.map((p: Teacher) => (
                    <option key={p.id_teacher} value={p.id_teacher}>{p.name} ({p.contact})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Second Teacher</label>
                <select 
                  value={prof2Id}
                  onChange={(e) => setProf2Id(e.target.value)}
                  className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-600 outline-none rounded-none transition-all font-bold text-gray-800"
                >
                  <option value="">Select...</option>
                  {teachers.map((p: Teacher) => (
                    <option key={p.id_teacher} value={p.id_teacher}>{p.name} ({p.contact})</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
            <button 
              onClick={handleSave}
              disabled={loading}
              className={`flex-1 py-5 font-black uppercase text-xs tracking-[0.2em] shadow-lg transition-all ${
                loading ? 'bg-gray-100 text-gray-300' : 'bg-blue-900 text-white hover:bg-black'
              }`}
            >
              {loading ? 'Saving...' : 'Confirm Designation'}
            </button>
            <button 
              onClick={() => router.back()}
              className="px-10 bg-white text-gray-400 py-5 font-black uppercase text-xs tracking-widest border border-gray-100 hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>

        <div className="mt-8 p-6 bg-orange-50 border-l-4 border-orange-500 text-orange-800 text-xs font-bold leading-relaxed">
          <p className="uppercase tracking-widest mb-2 flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
            Mandatory Requirement
          </p>
          <p>
            It is necessary to designate two teachers to ensure that there is always a referent available for students and for communications with the CEB.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
