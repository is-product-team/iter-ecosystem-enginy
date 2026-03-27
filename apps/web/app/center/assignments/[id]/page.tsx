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

  const handleAddStudent = async (idStudent: number) => {
    try {
      if (!assignment) return;
      const currentIds = assignment.enrollments?.map((i: Enrollment) => i.id_student) || [];
      if (currentIds.includes(idStudent)) {
        toast.warning("This student is already enrolled.");
        return;
      }

      const maxSeats = assignment.request?.approxStudents || assignment.workshop?.maxSeats || 20;
      if (currentIds.length >= maxSeats) {
        toast.error(`Limit of ${maxSeats} seats reached.`);
        return;
      }

      const updated = await assignmentService.updateEnrollments(parseInt(id), [...currentIds, idStudent]);
      setAssignment(updated);
      toast.success('Student added successfully.');
    } catch (error) {
      toast.error('Error adding student.');
    }
  };

  const handleRemoveStudent = async (idStudent: number) => {
    try {
      if (!assignment) return;
      const currentIds = assignment.enrollments?.map((i: Enrollment) => i.id_student) || [];
      const updated = await assignmentService.updateEnrollments(parseInt(id), currentIds.filter((id: number) => id !== idStudent));
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
    ins.validated_pedagogical_agreement && 
    ins.validated_mobility_authorization && 
    ins.validated_image_rights
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
                {assignment.enrollments?.length || 0} of {assignment.request?.approxStudents || assignment.workshop?.maxSeats || 20} seats occupied.
              </p>
            </div>
            <button 
              onClick={() => setViewMode('selection')}
              className="bg-[#00426B] text-white px-8 py-4 text-[11px] font-black uppercase tracking-[0.2em] hover:bg-[#0775AB] transition-all flex items-center gap-3 shadow-xl"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
              Add Student
            </button>
          </div>

          <div className="divide-y divide-gray-100">
            {assignment.enrollments?.map((ins: Enrollment) => (
              <div key={ins.id_enrollment} className="p-8 hover:bg-gray-50/50 transition-colors">
                <div className="flex flex-col lg:flex-row gap-10 items-start lg:items-center">
                  {/* Student Info */}
                  <div className="flex items-center gap-6 min-w-[280px]">
                    <Avatar 
                      url={ins.student.photoUrl} 
                      name={`${ins.student.fullName} ${ins.student.lastName}`} 
                      id={ins.student.id_student} 
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
                      enrollmentId={ins.id_enrollment}
                      documentType="pedagogical_agreement"
                      initialUrl={ins.pedagogicalAgreementUrl}
                      isValidated={ins.validated_pedagogical_agreement}
                      label="Pedagogical Agreement"
                      onUploadSuccess={() => {}}
                    />
                    <DocumentUpload 
                      assignmentId={parseInt(id)}
                      enrollmentId={ins.id_enrollment}
                      documentType="mobility_authorization"
                      initialUrl={ins.mobilityAuthorizationUrl}
                      isValidated={ins.validated_mobility_authorization}
                      label="Mobility Auth"
                      onUploadSuccess={() => {}}
                    />
                    <DocumentUpload 
                      assignmentId={parseInt(id)}
                      enrollmentId={ins.id_enrollment}
                      documentType="image_rights"
                      initialUrl={ins.imageRightsUrl}
                      isValidated={ins.validated_image_rights}
                      label="Image Rights"
                      onUploadSuccess={() => {}}
                    />
                  </div>

                  {/* Actions */}
                  <div className="shrink-0">
                    <button 
                      onClick={() => handleRemoveStudent(ins.id_student)}
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
                  onClick={() => setViewMode('selection')}
                  className="text-[#4197CB] font-black text-[10px] uppercase tracking-widest hover:text-[#00426B] transition-colors"
                >
                  Click here to start the nominal registration
                </button>
              </div>
            )}
          </div>
        </section>
        
        {/* ACTION: FINALIZE REGISTRATION */}
        {assignment.status !== 'IN_PROGRESS' && assignment.status !== 'COMPLETED' && (
            <div className={`p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm border ${
                allDocumentsValidated ? 'bg-green-50 border-green-100 animate-pulse' : 'bg-blue-50 border-blue-100'
            }`}>
                <div>
                    <h4 className={`text-lg font-black uppercase ${allDocumentsValidated ? 'text-green-700' : 'text-[#00426B]'}`}>
                        {allDocumentsValidated ? '✓ Everything ready to start' : 'Confirm Documentation'}
                    </h4>
                    <p className="text-xs text-gray-600 mt-1 max-w-xl">
                        {allDocumentsValidated 
                            ? "All documentation has been validated. You can now confirm the final registration to activate the workshop and generate the calendar." 
                            : "Once you have uploaded all the required documentation and it has been validated by the administration, you can confirm the final registration."
                        }
                    </p>
                </div>
                <button 
                    onClick={async () => {
                        if (!allDocumentsValidated) {
                            toast.error("Some documents have not yet been validated by the Administration.");
                            return;
                        }
                        if(!confirm("Are you sure you want to confirm the registration and generate the sessions?")) return;
                        try {
                            await assignmentService.confirmRegistration(parseInt(id));
                            toast.success("Registration confirmed! Sessions generated.");
                            // Reload
                            window.location.reload();
                        } catch(_e) {
                            toast.error("Error confirming.");
                        }
                    }}
                    className={`px-8 py-4 text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-xl whitespace-nowrap ${
                        allDocumentsValidated 
                            ? 'bg-green-600 text-white hover:bg-green-700' 
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                >
                    Confirm and Generate Sessions
                </button>
            </div>
        )}

      </div>

      {/* MODAL: SELECCIÓ D'ALUMNAT */}
      {viewMode === 'selection' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop blurred */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setViewMode('workshop')}
          ></div>
          
          <div className="relative bg-white w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-gray-100">
            {/* Modal Header */}
            <div className="p-8 border-b border-gray-100 bg-[#F8FAFC] flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black text-[#00426B] uppercase tracking-tighter">Add Student to Workshop</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Search for students from your center to include them in {assignment.workshop?.title}.</p>
              </div>
              <button 
                onClick={() => setViewMode('workshop')}
                className="p-2 text-gray-300 hover:text-[#00426B] transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-8">
              {/* Filters Panel */}
              <div className="mb-8 flex flex-col lg:flex-row gap-6 bg-[#F8FAFC] border border-gray-100 p-6">
                <div className="flex-1">
                  <label className="block text-[10px] font-black text-[#00426B] uppercase tracking-[0.2em] mb-2">Search by name or IDALU</label>
                  <div className="relative">
                    <input 
                      type="text"
                      placeholder="Ex: John Smith, 1234567..."
                      value={searchStudent}
                      onChange={(e) => { setSearchStudent(e.target.value); setCurrentPage(1); }}
                      className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 focus:border-[#0775AB] focus:ring-0 text-sm font-bold text-[#00426B] placeholder:text-gray-300 transition-all"
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-4 top-3 h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>

                <div className="lg:w-48">
                  <label className="block text-[10px] font-black text-[#00426B] uppercase tracking-[0.2em] mb-2">Filter by course</label>
                  <select 
                    value={filterCourse}
                    onChange={(e) => { setFilterCourse(e.target.value); setCurrentPage(1); }}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 focus:border-[#0775AB] focus:ring-0 text-sm font-bold text-[#00426B] appearance-none"
                  >
                    <option value="All courses">All courses</option>
                    {uniqueCourses.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <button 
                    onClick={() => { setSearchStudent(""); setFilterCourse("All courses"); setCurrentPage(1); }}
                    className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="bg-white border border-gray-100 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-[#F8FAFC] border-b border-gray-100">
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#00426B]">Student Information</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#00426B]">IDALU</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#00426B]">Course</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#00426B] text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginatedStudents.map(a => {
                        const isAlreadyAdded = assignment.enrollments?.some((i: Enrollment) => i.id_student === a.id_student);
                        return (
                          <tr key={a.id_student} className={`hover:bg-[#F8FAFC] transition-colors group ${isAlreadyAdded ? 'bg-green-50/10' : ''}`}>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <Avatar 
                                  url={a.photoUrl} 
                                  name={`${a.fullName} ${a.lastName}`} 
                                  id={a.id_student} 
                                  type="student" 
                                  size="sm"
                                  className={isAlreadyAdded ? 'ring-2 ring-green-500' : ''}
                                />
                                <div className="text-xs font-black text-[#00426B] uppercase tracking-tight">{a.fullName} {a.lastName}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 font-mono text-[9px] text-gray-400">{a.idalu}</td>
                            <td className="px-6 py-4">
                              <span className="text-[9px] font-black text-[#00426B] uppercase">{a.grade}</span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex justify-end items-center gap-2">
                                {isAlreadyAdded ? (
                                  <>
                                    <span className="text-[9px] font-black text-green-600 uppercase tracking-widest mr-2">Participates</span>
                                    <button 
                                      onClick={() => handleRemoveStudent(a.id_student)}
                                      className="p-2 text-gray-200 hover:text-red-500 hover:bg-red-50 transition-all"
                                      title="Remove student"
                                    >
                                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                  </>
                                ) : (
                                  <button 
                                    onClick={() => handleAddStudent(a.id_student)}
                                    className="px-4 py-1.5 bg-[#00426B] text-white text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all"
                                  >
                                    Add
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {filteredStudents.length === 0 && (
                  <div className="p-12 text-center">
                    <p className="text-[#00426B] font-black uppercase text-[10px] tracking-widest">No students found</p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer / Pagination */}
            <div className="p-6 border-t border-gray-100 bg-[#F8FAFC]/50 flex justify-between items-center">
              <div className="text-[9px] font-black uppercase text-gray-400 tracking-widest">
                {paginatedStudents.length} of {filteredStudents.length} students
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-1.5 text-[9px] font-black uppercase border border-gray-200 text-[#00426B] disabled:opacity-20"
                >
                  Previous
                </button>
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-1.5 text-[9px] font-black uppercase border border-gray-200 text-[#00426B] disabled:opacity-20"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
