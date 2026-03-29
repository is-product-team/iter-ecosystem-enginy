'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { getUser, User } from '@/lib/auth';
import { PHASES, ROLES } from '@iter/shared';
import DashboardLayout from '@/components/DashboardLayout';
import assignmentService, { Assignment, Enrollment } from '@/services/assignmentService';
import studentService, { Student } from '@/services/studentService';
import phaseService, { Phase } from '@/services/phaseService';
import getApi from '@/services/api';
import Loading from '@/components/Loading';
import { toast } from 'sonner';
import ConfirmDialog from '@/components/ConfirmDialog';

export default function NominalRegisterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [user, setUser] = useState<User | null>(null);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering & Searching state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("All courses");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  
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
    onConfirm: () => {},
  });

  const router = useRouter();

  useEffect(() => {
    const currentUser = getUser();
    const roleName = currentUser?.role.name;
    
    if (!currentUser || roleName !== ROLES.COORDINATOR) {
      router.push('/login');
      return;
    }
    setUser(currentUser);

    const fetchData = async () => {
      try {
        const api = getApi();

        // Fetch phases first for gating
        const phasesData = await phaseService.getAll();
        const isPlanning = phasesData.find((f: Phase) => f.name === PHASES.PLANNING)?.isActive;

        if (!isPlanning) {
          toast.error('The nominal registration period is not active.');
          router.push('/center/assignments');
          return;
        }

        // Fetch assignment with enrollments
        const found = await assignmentService.getById(parseInt(id));
        setAssignment(found);

        // Pre-populate selectedIds from existing enrollments
        if (found.enrollments) {
          setSelectedIds(found.enrollments.map((i: Enrollment) => i.studentId));
        }

        // Fetch all students from center (controller handles scoping)
        const resStudents = await studentService.getAll();
        setStudents(resStudents || []);
      } catch (error) {
        console.error("Error fetching nominal register data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, router]);

  const toggleStudent = (idStudent: number) => {
    setSelectedIds(prev => {
      const isSelected = prev.includes(idStudent);
      const maxSeats = assignment?.request?.approxStudents || assignment?.workshop?.maxPlaces || 20;

      if (!isSelected && prev.length >= maxSeats) {
        toast.warning(`Limit of ${maxSeats} seats reached.`);
        return prev;
      }

      return isSelected
        ? prev.filter(i => i !== idStudent)
        : [...prev, idStudent];
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const maxSeats = assignment?.request?.approxStudents || assignment?.workshop?.maxPlaces || 20;
      const available = maxSeats - selectedIds.length;
      
      if (available <= 0) {
        toast.error(`Limit of ${maxSeats} seats reached.`);
        return;
      }

      const toAdd: number[] = [];
      let count = 0;
      
      for (const student of filteredStudents) {
        if (!selectedIds.includes(student.studentId)) {
          toAdd.push(student.studentId);
          count++;
          if (count >= available) break;
        }
      }
      
      setSelectedIds(prev => [...prev, ...toAdd]);
    } else {
      // Unselect all in CURRENT filtered view
      const filteredIds = filteredStudents.map(a => a.studentId);
      setSelectedIds(prev => prev.filter(id => !filteredIds.includes(id)));
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await assignmentService.updateEnrollments(parseInt(id), selectedIds);
      toast.success('Nominal Register saved successfully.');
      router.push('/center/assignments');
    } catch (error) {
      toast.error('Error saving nominal register.');
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(a => {
    const matchesSearch = !searchQuery || 
      a.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.idalu.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCourse = selectedCourse === "All courses" || a.grade === selectedCourse;
    
    return matchesSearch && matchesCourse;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCourse]);

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const uniqueCourses = Array.from(new Set(students.map(a => a.grade))).filter(Boolean).sort();

  if (loading && !assignment) return <Loading fullScreen message="Loading assignment data..." />;

  const maxSeats = assignment?.request?.approxStudents || assignment?.workshop?.maxPlaces || 20;
  const isFull = selectedIds.length === maxSeats;

  const headerActions = (
    <button
      onClick={() => router.push('/center/students')}
      className="bg-[#00426B] hover:bg-[#0775AB] text-white px-6 py-3 font-black uppercase text-[10px] tracking-widest transition-all shadow-lg flex items-center gap-2"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      Create Student
    </button>
  );

  return (
    <DashboardLayout
      title={`Nominal Register: ${assignment?.workshop?.title}`}
      subtitle={`In this phase you must designate the ${maxSeats} students who will participate.`}
      actions={headerActions}
    >
      <div className="w-full pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-8 border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center">
            <span className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-2">Assigned Slots</span>
            <span className="text-4xl font-black text-[#00426B]">{maxSeats}</span>
          </div>
          <div className="bg-white p-8 border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center">
            <span className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-2">Selected</span>
            <span className={`text-4xl font-black ${isFull ? 'text-green-600' : 'text-[#0775AB]'}`}>{selectedIds.length}</span>
          </div>
          <div className="bg-white p-8 border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center">
            <span className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-2">Remaining</span>
            <span className="text-4xl font-black text-gray-200">{Math.max(0, maxSeats - selectedIds.length)}</span>
          </div>
        </div>

        <div className="mb-8 flex flex-col lg:flex-row gap-6 bg-white border border-gray-200 p-8">
          <div className="flex-1">
            <label className="block text-[10px] font-black text-[#00426B] uppercase tracking-[0.2em] mb-3">Search by name or IDALU</label>
            <div className="relative">
              <input 
                type="text"
                placeholder="Ex: John Smith, 1234567..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-[#F8FAFC] border border-gray-100 focus:border-[#0775AB] focus:ring-0 text-sm font-bold text-[#00426B] placeholder:text-gray-300 transition-all"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-4 top-3.5 h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div className="lg:w-64">
            <label className="block text-[10px] font-black text-[#00426B] uppercase tracking-[0.2em] mb-3">Filter by course</label>
            <select 
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full px-4 py-3 bg-[#F8FAFC] border border-gray-100 focus:border-[#0775AB] focus:ring-0 text-sm font-bold text-[#00426B] appearance-none"
            >
              <option value="All courses">All courses</option>
              {uniqueCourses.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button 
              onClick={() => { setSearchQuery(""); setSelectedCourse("All courses"); }}
              className="w-full lg:w-auto px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all border border-transparent hover:border-red-100 h-[46px]"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="bg-white border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-gray-200">
                  <th className="px-8 py-4 w-16">
                    <div 
                      onClick={(e) => { e.stopPropagation(); handleSelectAll(selectedIds.length < (assignment?.request?.approxStudents || 0)); }}
                      className={`w-5 h-5 border-2 flex items-center justify-center cursor-pointer transition-all ${
                        selectedIds.length > 0 ? 'bg-[#00426B] border-[#00426B] text-white' : 'bg-white border-gray-200'
                      }`}
                    >
                      {selectedIds.length > 0 && (
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" /></svg>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#00426B]">Student</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#00426B]">Identification (IDALU)</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#00426B]">Course</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedStudents.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-20 text-center">
                      <p className="text-[#00426B] font-black uppercase text-xs tracking-widest">No students found</p>
                    </td>
                  </tr>
                ) : (
                  paginatedStudents.map(student => {
                    const isSelected = selectedIds.includes(student.studentId);
                    return (
                      <tr 
                        key={student.studentId} 
                        onClick={() => toggleStudent(student.studentId)}
                        className={`transition-colors cursor-pointer group ${isSelected ? 'bg-blue-50/30' : 'hover:bg-gray-50'}`}
                      >
                        <td className="px-8 py-5">
                          <div className={`w-6 h-6 border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-[#00426B] border-[#00426B] text-white shadow-md' : 'bg-white border-gray-100'}`}>
                            {isSelected && <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" /></svg>}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 flex items-center justify-center text-xs font-black transition-colors ${isSelected ? 'bg-[#00426B] text-white' : 'bg-[#EAEFF2] text-[#00426B]'}`}>
                              {student.fullName.charAt(0)}{student.lastName.charAt(0)}
                            </div>
                            <div className={`text-sm font-black uppercase tracking-tight ${isSelected ? 'text-[#00426B]' : 'text-gray-700'}`}>
                              {student.fullName} {student.lastName}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-[10px] font-bold text-gray-400 font-mono tracking-widest uppercase">{student.idalu}</span>
                        </td>
                        <td className="px-6 py-5">
                          <span className="px-2 py-0.5 bg-[#EAEFF2] text-[#00426B] text-[10px] font-black uppercase tracking-widest border border-[#EAEFF2]">
                            {student.grade}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="border-t border-gray-100 p-6 flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#F8FAFC]/50">
              <div className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                Showing <span className="text-[#00426B]">{paginatedStudents.length}</span> of <span className="text-[#00426B]">{filteredStudents.length}</span> students
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={(e) => { e.stopPropagation(); setCurrentPage(prev => Math.max(1, prev - 1)); }}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest border transition-all ${currentPage === 1 
                    ? 'text-gray-200 border-gray-100 cursor-not-allowed' 
                    : 'text-[#00426B] border-gray-200 hover:bg-[#EAEFF2]'}`}
                >
                  Previous
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); setCurrentPage(prev => Math.min(totalPages, prev + 1)); }}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest border transition-all ${currentPage === totalPages 
                    ? 'text-gray-200 border-gray-100 cursor-not-allowed' 
                    : 'text-[#00426B] border-gray-200 hover:bg-[#EAEFF2]'}`}
                >
                  Next
                </button>
              </div>
            </div>
          )}

          <div className="p-10 bg-gray-50 border-t flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleSave}
              disabled={loading || selectedIds.length === 0}
              className={`flex-1 py-5 font-black uppercase text-xs tracking-[0.2em] shadow-xl transition-all flex items-center justify-center gap-3 ${loading || selectedIds.length === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                  : 'bg-[#00426B] text-white hover:bg-black active:scale-95'
                }`}
            >
              {loading ? 'Processing...' : 'Confirm Nominal Register'}
              {!loading && <svg className="w-4 h-4" fill="white" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" /></svg>}
            </button>
            <button
              onClick={() => router.back()}
              className="px-12 bg-white text-gray-400 py-5 font-black uppercase text-xs tracking-[0.2em] border border-gray-200 hover:bg-gray-100 transition-all"
            >
              Back
            </button>
          </div>
        </div>

        <div className="mt-8 p-8 bg-blue-50/30 border-l-4 border-[#00426B] text-[#00426B] text-[11px] font-bold flex gap-6 items-start">
          <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <div>
            <p className="uppercase tracking-[0.2em] mb-2 font-black">Note on Nominal Register</p>
            <p className="font-normal text-gray-600 leading-relaxed max-w-3xl">
              According to the Consortium&apos;s regulations, the nominal register must match the number of requested spots. Once confirmed, these students will be the ones listed on the final report and will receive the corresponding certification.
            </p>
          </div>
        </div>
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
