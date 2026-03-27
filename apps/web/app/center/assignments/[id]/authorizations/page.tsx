'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { getUser, User } from '@/lib/auth';
import { ROLES } from '@iter/shared';
import DashboardLayout from '@/components/DashboardLayout';
import assignmentService, { Assignment, Enrollment } from '@/services/assignmentService';
import getApi from '@/services/api';
import Loading from '@/components/Loading';
import { toast } from 'sonner';

export default function AuthorizationsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [user, setUser] = useState<User | null>(null);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
        const resAssig = await assignmentService.getById(parseInt(id));
        setAssignment(resAssig);
      } catch (error) {
        toast.error('Error loading data.');
        router.push(`/center/assignments/${id}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, router]);

  const handleToggleCompliance = async (idInscripcio: number, field: string, value: boolean) => {
    try {
      const api = getApi();
      await api.post(`/assignments/${id}/compliance`, {
        enrollmentId: idInscripcio,
        [field]: value
      });
      
      // Update local state for immediate feedback
      setAssignment((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          enrollments: prev.enrollments?.map((ins) => 
            ins.enrollmentId === idInscripcio ? { ...ins, [field]: value } : ins
          )
        };
      });
    } catch (error) {
      toast.error('Error updating the document.');
    }
  };

  const handleConfirmAll = async () => {
    try {
      setSaving(true);
      const api = getApi();
      await api.post(`/assignments/${id}/confirm-registration`);
      toast.success('CEB registration confirmed successfully.');
      router.push(`/center/assignments/${id}`);
    } catch (error) {
      toast.error('Error confirming registration.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !assignment) return <Loading fullScreen message="Loading authorizations..." />;

  return (
    <DashboardLayout 
      title={`AUTHORIZATIONS: ${assignment.workshop?.title}`} 
      subtitle="Manage legal compliance and student authorizations."
    >
      <div className="w-full pb-20">
        <section className="card-institutional">
          <h3 className="header-label mb-8">Documentation Status</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b-2 border-gray-100">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#00426B]">Student</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#00426B] text-center">Pedagogical Agreement</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#00426B] text-center">Image Rights</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#00426B] text-center">Mobility</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {assignment.enrollments?.map((ins: Enrollment) => (
                  <tr key={ins.enrollmentId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-consorci-darkBlue uppercase tracking-tight">
                        {ins.student?.fullName}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <input 
                        type="checkbox" 
                        checked={!!ins.isPedagogicalAgreementValidated} 
                        onChange={(e) => handleToggleCompliance(ins.enrollmentId, 'isPedagogicalAgreementValidated', e.target.checked)}
                        className="w-5 h-5 border-2 border-gray-200 text-consorci-darkBlue focus:ring-0"
                      />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <input 
                        type="checkbox" 
                        checked={!!ins.isImageRightsValidated} 
                        onChange={(e) => handleToggleCompliance(ins.enrollmentId, 'isImageRightsValidated', e.target.checked)}
                        className="w-5 h-5 border-2 border-gray-200 text-consorci-darkBlue focus:ring-0"
                      />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <input 
                        type="checkbox" 
                        checked={!!ins.isMobilityAuthorizationValidated} 
                        onChange={(e) => handleToggleCompliance(ins.enrollmentId, 'isMobilityAuthorizationValidated', e.target.checked)}
                        className="w-5 h-5 border-2 border-gray-200 text-consorci-darkBlue focus:ring-0"
                      />
                    </td>
                  </tr>
                ))}
                {(!assignment.enrollments || assignment.enrollments.length === 0) && (
                  <tr>
                    <td colSpan={4} className="p-12 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      There are no students enrolled in this assignment.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-12 pt-8 border-t-2 border-dashed border-gray-100 flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleConfirmAll}
              disabled={saving || !assignment.enrollments?.length}
              className="btn-primary flex-1 py-5"
            >
              {saving ? 'PROCESSING...' : 'CONFIRM CEB REGISTRATION'}
            </button>
            <button
              onClick={() => router.push(`/center/assignments/${id}`)}
              className="btn-secondary px-12"
            >
              BACK
            </button>
          </div>
        </section>

        <div className="mt-8 p-8 bg-blue-50/50 border-l-4 border-consorci-lightBlue text-consorci-darkBlue text-[11px] font-bold flex gap-6 items-start">
          <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <div>
            <p className="uppercase tracking-widest mb-2 font-black">Legal Reminder</p>
            <p className="font-normal text-gray-600 leading-relaxed max-w-4xl">
              Confirmation of the registration implies that the center has and has validated all necessary legal documentation (Pedagogical Agreement, mobility authorizations and image rights) signed by parents or legal guardians. This documentation may be required for a Consortium audit.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
