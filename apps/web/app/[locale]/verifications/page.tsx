'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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

  useEffect(() => {
    if (!authLoading && (!user || user.role.name !== 'ADMIN')) {
      router.push('/login');
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
        <div className="bg-background-surface border border-border-subtle overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-background-subtle border-b border-border-subtle">
                <th className="px-6 py-4 text-[12px] font-medium text-text-primary">Center / Workshop</th>
                <th className="px-6 py-4 text-[12px] font-medium text-text-primary">Dates</th>
                <th className="px-6 py-4 text-[12px] font-medium text-text-primary">Student Documentation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center">
                    <Loading message="Loading assignments..." />
                  </td>
                </tr>
              ) : assignments.length > 0 ? (
                paginatedAssignments.map((assig) => (
                  <tr key={assig.assignmentId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-5">
                      <div className="font-medium text-text-primary text-[15px] leading-tight mb-1">{assig.center?.name}</div>
                      <div className="text-[12px] font-medium text-consorci-darkBlue">{assig.workshop?.title}</div>
                    </td>
                    <td className="px-6 py-5 text-[13px] font-medium text-text-muted">
                      {assig.startDate && assig.endDate ? (
                        <div className="flex flex-col gap-1">
                          <span>Start: {new Date(assig.startDate).toLocaleDateString()}</span>
                          <span>End: {new Date(assig.endDate).toLocaleDateString()}</span>
                        </div>
                      ) : (
                        <span className="text-text-muted opacity-50 italic">Dates not defined</span>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-3">
                        {assig.enrollments?.map((ins) => (
                          <div key={ins.enrollmentId} className="flex items-center justify-between gap-6 p-4 border border-border-subtle bg-background-subtle/30 group">
                            <div className="flex flex-col gap-2 min-w-0">
                              <div className="text-[13px] font-medium text-text-primary truncate">
                                {ins.student?.fullName}
                              </div>
                                <div className="flex flex-wrap gap-2">
                                    {[
                                      { id: 'pedagogical_agreement', name: 'Agreement', url: ins.pedagogicalAgreementUrl, valid: ins.isPedagogicalAgreementValidated, validField: 'isPedagogicalAgreementValidated' },
                                      { id: 'mobility_authorization', name: 'Mobility', url: ins.mobilityAuthorizationUrl, valid: ins.isMobilityAuthorizationValidated, validField: 'isMobilityAuthorizationValidated' },
                                      { id: 'image_rights', name: 'Rights', url: ins.imageRightsUrl, valid: ins.isImageRightsValidated, validField: 'isImageRightsValidated' }
                                    ].map(doc => (
                                      <div key={doc.id} className="flex items-center">
                                        {doc.url ? (
                                          <div className="flex items-center">
                                            <a
                                              href={`${process.env.NEXT_PUBLIC_API_URL}${doc.url}`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className={`text-[11px] font-medium px-2.5 py-1.5 transition-all flex items-center gap-2 border ${
                                                  doc.valid 
                                                    ? 'border-green-500/30 text-green-600 bg-green-500/5 hover:bg-green-500/10' 
                                                    : 'border-consorci-darkBlue/20 text-consorci-darkBlue bg-background-subtle hover:bg-background-surface'
                                              }`}
                                              title={`View ${doc.name}`}
                                            >
                                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                              </svg>
                                              {doc.name}
                                            </a>
                                            {!doc.valid ? (
                                              <button 
                                                onClick={() => handleValidateDocument(ins.enrollmentId, doc.validField, true)}
                                                className="bg-green-600 text-white px-3 py-1.5 text-[11px] font-medium hover:bg-black transition-all border border-green-600 border-l-0"
                                              >
                                                OK
                                              </button>
                                            ) : (
                                              <button 
                                                onClick={() => handleValidateDocument(ins.enrollmentId, doc.validField, false)}
                                                className="bg-background-subtle text-red-500 px-3 py-1.5 text-[11px] font-medium hover:bg-red-50 transition-all border border-border-subtle border-l-0"
                                              >
                                                ✕
                                              </button>
                                            )}
                                          </div>
                                        ) : (
                                          <span className="text-[11px] font-medium text-text-muted opacity-30 border border-border-subtle px-2 py-1.5">
                                            {doc.name}
                                          </span>
                                        )}
                                      </div>
                                    ))}
                                </div>
                              </div>

                                <button
                                  onClick={() => handleOpenNotification(assig, 'Select document')}
                                  className="text-[11px] font-medium border border-border-subtle text-text-muted px-3 py-1.5 hover:bg-background-subtle transition-all flex items-center gap-2 shrink-0"
                                  title="Report a problem with this student's documentation"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                  </svg>
                                  Report problem
                                </button>
                        </div>
                      ))}
                        {(!assig.enrollments || assig.enrollments.length === 0) && (
                          <span className="text-[12px] font-medium text-text-muted italic opacity-50">No students enrolled</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-16 text-center text-text-muted text-[13px] font-medium">
                    No assignments to verify
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-6">
          <div className="bg-background-surface w-full max-w-xl border border-border-subtle relative">
            <div className="p-8 border-b border-border-subtle bg-background-subtle flex justify-between items-center">
              <h3 className="text-[14px] font-medium text-text-primary flex items-center gap-3">
                <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                Report documented problem
              </h3>
              <button onClick={() => setShowNotificationModal(false)} className="text-text-muted hover:text-red-500 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-10 space-y-8">
              <div className="bg-background-subtle border border-border-subtle p-5">
                <p className="text-[10px] font-medium text-text-muted mb-2 tracking-wider">MESSAGE PREVIEW</p>
                <div className="text-[13px] font-medium text-text-primary leading-relaxed opacity-80 italic">
                  &quot;{notificationData.greeting}, the document <span className="font-medium underline decoration-consorci-darkBlue/30">{notificationData.documentName === 'Select document' ? '[Document]' : notificationData.documentName}</span> of the workshop <span className="font-medium text-consorci-darkBlue">{selectedAssignment?.workshop?.title}</span> is incorrect because {notificationData.comment}&quot;
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-[12px] font-medium text-text-primary px-1">Greeting</label>
                    <select
                      value={notificationData.greeting}
                      onChange={(e) => setNotificationData({ ...notificationData, greeting: e.target.value })}
                      className="w-full px-4 py-3 bg-background-subtle border border-border-subtle text-sm font-medium text-text-primary focus:border-consorci-darkBlue outline-none appearance-none"
                    >
                      <option value="Hello good morning">Hello good morning</option>
                      <option value="Hello good afternoon">Hello good afternoon</option>
                      <option value="Hello good evening">Hello good evening</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[12px] font-medium text-text-primary px-1">Document with error</label>
                    <select
                      value={notificationData.documentName}
                      onChange={(e) => setNotificationData({ ...notificationData, documentName: e.target.value })}
                      className="w-full px-4 py-3 bg-background-subtle border border-border-subtle text-sm font-medium text-text-primary focus:border-consorci-darkBlue outline-none appearance-none"
                    >
                      <option value="Select document" disabled>Select document...</option>
                      <option value="Pedagogical Agreement">Pedagogical Agreement</option>
                      <option value="Mobility Authorization">Mobility Authorization</option>
                      <option value="Image Rights">Image Rights</option>
                      <option value="All documentation">All documentation</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[12px] font-medium text-text-primary px-1">Comment (Reason for error)</label>
                  <textarea
                    value={notificationData.comment}
                    onChange={(e) => setNotificationData({ ...notificationData, comment: e.target.value })}
                    placeholder="Describe the reason for the error here..."
                    className="w-full px-4 py-3 bg-background-subtle border border-border-subtle text-sm font-medium text-text-primary focus:border-consorci-darkBlue outline-none min-h-[120px] resize-none appearance-none"
                  />
                </div>
              </div>

              <div className="flex gap-6">
                <button
                  onClick={() => setShowNotificationModal(false)}
                  className="flex-1 py-4 border border-border-subtle text-text-muted font-medium text-[13px] hover:bg-background-subtle transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={sendNotification}
                  disabled={sendingNotif || notificationData.documentName === 'Select document'}
                  className={`flex-[2] py-4 font-medium text-[13px] flex items-center justify-center gap-3 transition-all ${
                    sendingNotif || notificationData.documentName === 'Select document' ? 'bg-background-subtle text-text-muted' : 'bg-consorci-darkBlue text-white hover:bg-black active:scale-[0.98]'
                  }`}
                >
                  {sendingNotif ? (
                    <>
                      <div className="animate-spin h-3.5 w-3.5 border-2 border-white/20 border-t-white"></div>
                      <span>Sending notification...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
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
