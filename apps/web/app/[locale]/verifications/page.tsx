'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import assignmentService, { Assignment } from '@/services/assignmentService';
import Loading from '@/components/Loading';
import { toast } from 'sonner';
import Pagination from "@/components/Pagination";

export default function DocumentVerificationPage() {
  const { user, loading: authLoading } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationData, setNotificationData] = useState({
    documentName: '',
    comment: '',
    greeting: 'Hello good afternoon'
  });
  const [sendingNotif, setSendingNotif] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const router = useRouter();
  const params = useParams();
  const locale = params?.locale || 'ca';

  useEffect(() => {
    if (!authLoading && (!user || user.role.name !== 'ADMIN')) {
      router.push(`/${locale}/login`);
      return;
    }

    if (user) {
      loadData();
    }
  }, [user, authLoading, router]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await assignmentService.getAll();
      setAssignments(data);
    } catch (err) {
      console.error(err);
      toast.error('Could not load assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenNotification = (assignment: Assignment, docName: string) => {
    setSelectedAssignment(assignment);
    setNotificationData({
      ...notificationData,
      documentName: docName,
      comment: ''
    });
    setShowNotificationModal(true);
  };

  const sendNotification = async () => {
    if (!selectedAssignment) return;
    if (!notificationData.comment.trim()) {
      toast.error('You must write a comment');
      return;
    }

    setSendingNotif(true);
    try {
      await assignmentService.sendDocumentNotification(
        selectedAssignment.assignmentId,
        notificationData.documentName,
        notificationData.comment,
        notificationData.greeting
      );
      toast.success('Notification sent successfully');
      setShowNotificationModal(false);
    } catch (err) {
      console.error(err);
      toast.error('Error sending notification');
    } finally {
      setSendingNotif(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Hello good morning';
    if (hour < 20) return 'Hello good afternoon';
    return 'Hello good evening';
  };

  useEffect(() => {
    setNotificationData(prev => ({ ...prev, greeting: getGreeting() }));
  }, []);

  const handleValidateDocument = async (idEnrollment: number, field: string, valid: boolean) => {
    try {
      await assignmentService.validateDocument(idEnrollment, field, valid);
      toast.success(valid ? 'Document validated' : 'Validation removed');
      loadData(); // Refresh list to see updated status
    } catch (err) {
      console.error(err);
      toast.error('Error validating document');
    }
  };

  const totalPages = Math.ceil(assignments.length / itemsPerPage);
  const paginatedAssignments = assignments.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
  );

  if (authLoading || !user) {
    return <Loading fullScreen message="Verifying administrator permissions..." />;
  }

  return (
    <DashboardLayout
      title="Document Verification"
      subtitle="Verify center documentation and report status"
    >
      <div className="space-y-6">
        {/* List of Assignments */}
        <div className="bg-white border border-gray-200 rounded-none shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-[11px] font-black text-[#00426B] uppercase tracking-wider">Center / Workshop</th>
                <th className="px-6 py-4 text-[11px] font-black text-[#00426B] uppercase tracking-wider">Dates</th>
                <th className="px-6 py-4 text-[11px] font-black text-[#00426B] uppercase tracking-wider">Student Documentation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center">
                    <Loading message="Loading assignments..." />
                  </td>
                </tr>
              ) : assignments.length > 0 ? (
                paginatedAssignments.map((assig) => (
                  <tr key={assig.assignmentId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-800 text-sm">{assig.center?.name}</div>
                      <div className="text-[10px] font-bold text-[#4197CB] uppercase tracking-tight">{assig.workshop?.title}</div>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-gray-600">
                      {assig.startDate && assig.endDate ? (
                        <div className="flex flex-col">
                          <span>Start: {new Date(assig.startDate).toLocaleDateString()}</span>
                          <span>End: {new Date(assig.endDate).toLocaleDateString()}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Dates not defined</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        {assig.enrollments?.map((ins) => (
                          <div key={ins.enrollmentId} className="flex items-center justify-between gap-4 p-3 border border-gray-100 bg-gray-50/50 group">
                            <div className="flex flex-col gap-1 min-w-0">
                              <div className="text-xs font-bold text-gray-700 truncate">
                                {ins.student?.fullName}
                              </div>
                                <div className="flex flex-wrap gap-2">
                                  {[
                                    { id: 'pedagogical_agreement', name: 'Pedagogical Agreement', url: ins.pedagogicalAgreementUrl, valid: ins.isPedagogicalAgreementValidated, validField: 'isPedagogicalAgreementValidated' },
                                    { id: 'mobility_authorization', name: 'Mobility Auth.', url: ins.mobilityAuthorizationUrl, valid: ins.isMobilityAuthorizationValidated, validField: 'isMobilityAuthorizationValidated' },
                                    { id: 'image_rights', name: 'Image Rights', url: ins.imageRightsUrl, valid: ins.isImageRightsValidated, validField: 'isImageRightsValidated' }
                                  ].map(doc => (
                                    <div key={doc.id} className="flex items-center gap-1">
                                      {doc.url ? (
                                        <div className="flex items-center">
                                          <a
                                            href={`${process.env.NEXT_PUBLIC_API_URL}${doc.url}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`text-[9px] font-bold px-3 py-1.5 uppercase transition-all flex items-center gap-1.5 border ${
                                                doc.valid 
                                                  ? 'border-green-200 text-green-600 hover:bg-green-50' 
                                                  : 'border-[#4197CB]/30 text-[#00426B] hover:bg-blue-50'
                                            }`}
                                            title={`View ${doc.name}`}
                                          >
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                            {doc.name}
                                          </a>
                                            {!doc.valid ? (
                                                <button 
                                                  onClick={() => handleValidateDocument(ins.enrollmentId, doc.validField, true)}
                                                  className="bg-green-50 text-green-600 px-3 py-1.5 text-[9px] font-black uppercase hover:bg-green-100 transition-all border border-green-200 border-l-0"
                                                  title="Accept document"
                                                >
                                                    Accept
                                                </button>
                                            ) : (
                                              <button 
                                                  onClick={() => handleValidateDocument(ins.enrollmentId, doc.validField, false)}
                                                  className="bg-red-50 text-red-500 px-3 py-1.5 text-[9px] font-black uppercase hover:bg-red-100 transition-all border border-red-200 border-l-0"
                                                  title="Revoke validation"
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </div>
                                      ) : (
                                        <span className="text-[9px] font-bold text-gray-300 border border-gray-100 px-2 py-1 uppercase" title={`${doc.name} pending`}>
                                          Pending {doc.name}
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>

                          <button
                            onClick={() => handleOpenNotification(assig, 'Select document')}
                            className="text-[9px] font-bold border border-red-200 text-red-500 px-3 py-1.5 uppercase hover:bg-red-50 transition-all flex items-center gap-1.5 shrink-0"
                            title="Report a problem with this student's documentation"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            Report problem
                          </button>
                        </div>
                      ))}
                      {(!assig.enrollments || assig.enrollments.length === 0) && (
                        <span className="text-[10px] italic text-gray-400">No students enrolled</span>
                      )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-gray-400 text-xs font-bold uppercase">
                    No assignments to show
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={assignments.length}
          currentItemsCount={paginatedAssignments.length}
          itemName="assignments"
        />
      </div>

      {/* Notification Modal */}
      {showNotificationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg shadow-2xl relative">
            <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h3 className="text-sm font-black text-[#00426B] uppercase tracking-widest flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                Report Problem
              </h3>
              <button onClick={() => setShowNotificationModal(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="bg-blue-50 border-l-4 border-[#4197CB] p-4 text-blue-700">
                <p className="text-[10px] font-black uppercase tracking-wider mb-1">Message Preview</p>
                <div className="text-xs italic leading-relaxed">
                  &quot;{notificationData.greeting}, the document <span className="font-bold underline">{notificationData.documentName === 'Select document' ? '[Document]' : notificationData.documentName}</span> of the workshop <span className="font-bold">{selectedAssignment?.workshop?.title}</span> is incorrect because {notificationData.comment}&quot;
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Greeting</label>
                    <select
                      value={notificationData.greeting}
                      onChange={(e) => setNotificationData({ ...notificationData, greeting: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-none focus:outline-none focus:border-[#00426B] text-sm font-bold text-gray-700"
                    >
                      <option value="Hello good morning">Hello good morning</option>
                      <option value="Hello good afternoon">Hello good afternoon</option>
                      <option value="Hello good evening">Hello good evening</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Document with error</label>
                    <select
                      value={notificationData.documentName}
                      onChange={(e) => setNotificationData({ ...notificationData, documentName: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-none focus:outline-none focus:border-[#00426B] text-sm font-bold text-gray-700"
                    >
                      <option value="Select document" disabled>Select document...</option>
                      <option value="Pedagogical Agreement">Pedagogical Agreement</option>
                      <option value="Mobility Authorization">Mobility Authorization</option>
                      <option value="Image Rights">Image Rights</option>
                      <option value="All documentation">All documentation</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Comment (Reason for error)</label>
                  <textarea
                    value={notificationData.comment}
                    onChange={(e) => setNotificationData({ ...notificationData, comment: e.target.value })}
                    placeholder="Describe the reason for the error here..."
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-none focus:outline-none focus:border-[#00426B] text-sm font-bold text-gray-700 min-h-[100px] resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowNotificationModal(false)}
                  className="flex-1 py-3 border border-gray-200 text-gray-500 font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={sendNotification}
                  disabled={sendingNotif || notificationData.documentName === 'Select document'}
                  className={`flex-[2] py-3 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                    sendingNotif || notificationData.documentName === 'Select document' ? 'bg-gray-100 text-gray-400' : 'bg-[#00426B] text-white hover:bg-[#0775AB] shadow-md'
                  }`}
                >
                  {sendingNotif ? (
                    <>
                      <div className="animate-spin h-3 w-3 border-2 border-white/20 border-t-white"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      <span>Send Notification</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
