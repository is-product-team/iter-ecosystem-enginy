'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { getUser, User } from '@/lib/auth';
import { ROLES } from '@iter/shared';
import DashboardLayout from '@/components/DashboardLayout';
import assignmentService, { Assignment, Enrollment } from '@/services/assignmentService';
import studentService, { Student } from '@/services/studentService';
import Loading from '@/components/Loading';
import { toast } from 'sonner';
import DocumentUpload from '@/components/DocumentUpload';
import Avatar from '@/components/Avatar';

type ViewMode = 'workshop' | 'selection';

export default function AssignmentDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [_user, setUser] = useState<User | null>(null);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('workshop');
  
  // Selection view states
  const [searchStudent, setSearchStudent] = useState("");
  const [filterCourse, setFilterCourse] = useState("All courses");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
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
        const [resAssig, resStudents] = await Promise.all([
          assignmentService.getById(parseInt(id)),
          studentService.getAll()
        ]);
        
        setAssignment(resAssig);
        setAllStudents(resStudents || []);
      } catch (_error) {
        toast.error('Error loading data.');
        router.push('/center/assignments');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, router]);

  const handleAddStudent = async (studentId: number) => {
    try {
      if (!assignment) return;
      const currentIds = assignment.enrollments?.map((i: Enrollment) => i.studentId) || [];
      if (currentIds.includes(studentId)) {
        toast.warning("This student is already enrolled.");
        return;
      }

      const maxSeats = assignment.request?.approxStudents || assignment.workshop?.maxPlaces || 20;
      if (currentIds.length >= maxSeats) {
        toast.error(`Limit of ${maxSeats} seats reached.`);
        return;
      }

      const updated = await assignmentService.updateEnrollments(parseInt(id), [...currentIds, studentId]);
      setAssignment(updated);
      toast.success('Student added successfully.');
    } catch (error) {
      toast.error('Error adding student.');
    }
  };

  const handleRemoveStudent = async (studentId: number) => {
    try {
      if (!assignment) return;
      const currentIds = assignment.enrollments?.map((i: Enrollment) => i.studentId) || [];
      const updated = await assignmentService.updateEnrollments(parseInt(id), currentIds.filter((id: number) => id !== studentId));
      setAssignment(updated);
      toast.success('Student removed successfully.');
    } catch (error) {
      toast.error('Error removing student.');
    }
  };

  const getStatusLabel = (status: string) => {
    const maps: Record<string, string> = {
      'DATA_ENTRY': 'PENDING MANAGEMENT',
      'PROVISIONAL': 'PROVISIONAL',
      'VALIDATED': 'CONFIRMED',
      'IN_PROGRESS': 'IN EXECUTION',
      'COMPLETED': 'COMPLETED'
    };
    return maps[status] || status.replace('_', ' ');
  };

  if (loading || !assignment) return <Loading fullScreen message="Loading workshop details..." />;

  const allDocumentsValidated = assignment.enrollments && assignment.enrollments.length > 0 && assignment.enrollments.every((ins: Enrollment) => 
    ins.isPedagogicalAgreementValidated && 
    ins.isMobilityAuthorizationValidated && 
    ins.isImageRightsValidated
  );

  const filteredStudents = allStudents.filter(a => {
    const matchesSearch = a.fullName.toLowerCase().includes(searchStudent.toLowerCase()) || 
                          a.lastName.toLowerCase().includes(searchStudent.toLowerCase()) ||
                          a.idalu.toLowerCase().includes(searchStudent.toLowerCase());
    const matchesCourse = filterCourse === "All courses" || a.grade === filterCourse;
    return matchesSearch && matchesCourse;
  });

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const uniqueCourses = Array.from(new Set(allStudents.map(a => a.grade))).filter(Boolean).sort();


  return (
    <DashboardLayout 
      title={`WORKSHOP MANAGEMENT: ${assignment.workshop?.title}`} 
      subtitle={
        <div className="flex flex-col gap-4 mt-6">
          <div className="flex items-center gap-3">
            <div className="px-4 py-1.5 text-[9px] font-black uppercase tracking-widest border-2 border-gray-100 bg-white text-[#00426B]">
              {getStatusLabel(assignment.status)}
            </div>
            <div className="px-4 py-1.5 text-[9px] font-black uppercase tracking-widest bg-[#00426B] text-white">
              MODALITY {assignment.workshop?.modality}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 p-6 bg-[#F8FAFC] border border-gray-200">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Teaching Team Referent</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-[#00426B] uppercase">{assignment.teacher1?.name}</span>
                <span className="text-gray-300">•</span>
                <span className="text-xs font-black text-[#00426B] uppercase">{assignment.teacher2?.name}</span>
              </div>
            </div>
            <div className="h-8 w-[1px] bg-gray-200 hidden sm:block"></div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Educational Center</span>
              <span className="text-xs font-black text-[#00426B] uppercase">{assignment.center?.name}</span>
            </div>
          </div>
        </div>
      }
    >
      <div className="pb-20">
        {/* SECTION: PARTICIPATING STUDENTS */}
        <section className="bg-white border border-gray-200 shadow-sm overflow-hidden mb-8">
          <div className="p-10 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gradient-to-r from-[#F8FAFC] to-white">
            <div>
              <h3 className="text-xl font-black text-[#00426B] uppercase tracking-tighter">Participating Students</h3>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                {assignment.enrollments?.length || 0} of {assignment.request?.approxStudents || assignment.workshop?.maxPlaces || 20} seats occupied.
              </p>
            </div>
            <button 
              onClick={() => router.push(`/center/assignments/${id}/students`)}
              className="bg-[#00426B] text-white px-8 py-4 text-[11px] font-black uppercase tracking-[0.2em] hover:bg-[#0775AB] transition-all flex items-center gap-3 shadow-xl"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
              Nominal Register
            </button>
          </div>

          <div className="divide-y divide-gray-100">
            {assignment.enrollments?.map((ins: Enrollment) => (
              <div key={ins.enrollmentId} className="p-8 hover:bg-gray-50/50 transition-colors">
                <div className="flex flex-col lg:flex-row gap-10 items-start lg:items-center">
                  {/* Student Info */}
                  <div className="flex items-center gap-6 min-w-[280px]">
                    <Avatar 
                      url={ins.student.photoUrl} 
                      name={`${ins.student.fullName} ${ins.student.lastName}`} 
                      id={ins.student.studentId} 
                      type="student" 
                      size="lg"
                      className="shadow-md"
                    />
                    <div>
                      <p className="text-base font-black text-[#00426B] uppercase tracking-tight leading-none">
                        {ins.student.fullName} {ins.student.lastName}
                      </p>
                      <p className="text-[10px] font-bold text-[#4197CB] uppercase tracking-widest mt-2 bg-blue-50 px-2 py-0.5 inline-block border border-blue-100">
                        {ins.student.grade} • {ins.student.idalu}
                      </p>
                    </div>
                  </div>

                  {/* Documents */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                    <DocumentUpload 
                      assignmentId={parseInt(id)}
                      enrollmentId={ins.enrollmentId}
                      documentType="pedagogical_agreement"
                      initialUrl={ins.pedagogicalAgreementUrl}
                      isValidated={ins.isPedagogicalAgreementValidated}
                      label="Pedagogical Agreement"
                      onUploadSuccess={() => {}}
                    />
                    <DocumentUpload 
                      assignmentId={parseInt(id)}
                      enrollmentId={ins.enrollmentId}
                      documentType="mobility_authorization"
                      initialUrl={ins.mobilityAuthorizationUrl}
                      isValidated={ins.isMobilityAuthorizationValidated}
                      label="Mobility Auth"
                      onUploadSuccess={() => {}}
                    />
                    <DocumentUpload 
                      assignmentId={parseInt(id)}
                      enrollmentId={ins.enrollmentId}
                      documentType="image_rights"
                      initialUrl={ins.imageRightsUrl}
                      isValidated={ins.isImageRightsValidated}
                      label="Image Rights"
                      onUploadSuccess={() => {}}
                    />
                  </div>

                  {/* Actions */}
                  <div className="shrink-0">
                    <button 
                      onClick={() => handleRemoveStudent(ins.student.studentId)}
                      className="p-3 text-gray-200 hover:text-red-500 hover:bg-red-50 transition-all rounded-full"
                      title="Remove student"
                    >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {(!assignment.enrollments || assignment.enrollments.length === 0) && (
              <div className="p-20 text-center bg-white">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                </div>
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">No students assigned yet</p>
                <button 
                  onClick={() => router.push(`/center/assignments/${id}/students`)}
                  className="text-[#4197CB] font-black text-[10px] uppercase tracking-widest hover:text-[#00426B] transition-colors"
                >
                  Click here to start the nominal registration
                </button>
              </div>
            )}
          </div>
        </section>
        
        {/* ACTION: FINALIZE REGISTRATION */}
