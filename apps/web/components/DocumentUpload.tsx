'use client';

import { useState } from 'react';
import getApi from '@/services/api';
import { toast } from 'sonner';

interface DocumentUploadProps {
  assignmentId: number;
  enrollmentId: number;
  documentType: 'pedagogical_agreement' | 'mobility_authorization' | 'image_rights';
  initialUrl?: string | null;
  isValidated?: boolean;
  label: string;
  onUploadSuccess: (newUrl: string) => void;
}

export default function DocumentUpload({
  assignmentId,
  enrollmentId,
  documentType,
  initialUrl,
  isValidated,
  label,
  onUploadSuccess
}: DocumentUploadProps) {
  // --- Upload and Validation States ---
  const [uploading, setUploading] = useState(false); // Indicates if the HTTP upload to backend is in progress
  const [currentUrl, setCurrentUrl] = useState(initialUrl); // Current URL of the uploaded document
  const [validatingAI, setValidatingAI] = useState(false); // Indicates if the AI pipeline (TensorFlow/PDF.js) is working
  const [overrideMode, setOverrideMode] = useState(false); // Activated if AI rejects the doc, allowing manual upload
  const [pendingFile, setPendingFile] = useState<File | null>(null); // Stores the file that failed validation for "Forced" upload

  /**
   * Performs the physical file upload to the server once validated (or forced).
   */
  const handleValidUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('idEnrollment', enrollmentId.toString());
    formData.append('documentType', documentType);

    try {
      setUploading(true);
      const api = getApi();
      const res = await api.post(`/assignments/${assignmentId}/student-document`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Extract the URL from the 'docs_status' JSON field of the response (Enrollment model)
      const docsStatus = res.data.docs_status || {};
      const fieldKey = documentType === 'pedagogical_agreement' ? 'pedagogicalAgreementUrl' :
                       documentType === 'mobility_authorization' ? 'mobilityAuthorizationUrl' :
                       'imageRightsUrl';
      
      const newUrl = docsStatus[fieldKey];

      setCurrentUrl(newUrl);
      if (newUrl) onUploadSuccess(newUrl);
      toast.success(`${label} uploaded successfully.`);
      
      // Clear error/blocking states after success
      setOverrideMode(false);
      setPendingFile(null);
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Error uploading document.');
    } finally {
      setUploading(false);
    }
  };

  /**
   * Orchestrates AI validation when a file is selected.
   */
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic format validation
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed.');
      return;
    }

    try {
      setValidatingAI(true);
      setOverrideMode(false);
      
      // Dynamic loading of utilities to avoid penalizing the initial bundle
      const { extractTextFromPdf, classifyDocumentType } = await import('@/lib/pdfUtils');
      const text = await extractTextFromPdf(file);
      const detectedType = classifyDocumentType(text);

      // Mapping between the type expected by props and the one detected by AI (text heuristics)
      const expectedInIAPipeline = documentType === 'pedagogical_agreement' ? 'pedagogical_agreement' : 
                                   documentType === 'mobility_authorization' ? 'mobility_authorization' : 
                                   documentType === 'image_rights' ? 'image_rights' : 'unknown';

      // Validation 1: Text content must match the upload slot type
      if (detectedType !== 'unknown' && detectedType !== expectedInIAPipeline) {
        toast.error(`AI detects a different type: ${detectedType}.`);
        setOverrideMode(true);
        setPendingFile(file);
        return;
      }

      // Validation 2: If it's a Pedagogical Agreement, use Computer Vision (TF.js) to look for signatures
      if (documentType === 'pedagogical_agreement') {
        const { signatureDetector } = await import('@/lib/visionUtils');
        await signatureDetector.loadModel(); // Load YOLOv8 model if not in memory
        const croppedCanvas = await signatureDetector.getBottomThirdOfLastPage(file);
        const hasSignatures = await signatureDetector.validateSignatures(croppedCanvas, 3); // We look for 3 signatures

        if (!hasSignatures) {
          toast.error('AI has not detected the required signatures.');
          setOverrideMode(true);
          setPendingFile(file);
          return;
        }
      }

      // If it passes all filters, proceed to real upload
      await handleValidUpload(file);
    } catch (err) {
      console.error("AI Validation Error:", err);
      toast.error('Error processing AI. You can force the upload.');
      setOverrideMode(true);
      setPendingFile(file);
    } finally {
      setValidatingAI(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-4 p-3 border border-gray-100 bg-gray-50/50 group hover:bg-white hover:border-consorci-lightBlue transition-all">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold uppercase text-gray-400 tracking-widest">{label}</span>
          </div>
          {currentUrl ? (
            <a
              href={`${process.env.NEXT_PUBLIC_API_URL}${currentUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`text-[10px] font-bold flex items-center gap-1 mt-1 ${isValidated ? 'text-green-600' : 'text-consorci-darkBlue hover:text-consorci-lightBlue'}`}
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              {isValidated ? 'DOCUMENT VALIDATED' : 'VIEW DOCUMENT'}
            </a>
          ) : (
            <span className="text-[10px] font-bold text-red-400 mt-1 uppercase">PENDING</span>
          )}
        </div>

        <div className="flex flex-col items-end gap-2">
          {overrideMode && pendingFile && (
            <button
              onClick={() => handleValidUpload(pendingFile)}
              className="px-3 py-1 text-[8px] font-bold text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 transition-all uppercase"
            >
              Force Manual Upload
            </button>
          )}
          
          <label className={`shrink-0 cursor-pointer px-4 py-2 text-[9px] font-bold uppercase tracking-widest transition-all border ${
            uploading || validatingAI ? 'bg-gray-50 border-gray-100 text-gray-300' : 'border-[#00426B] text-[#00426B] hover:bg-blue-50'
          }`}>
            {uploading ? 'UPLOADING...' : validatingAI ? 'VALIDATING (AI)...' : currentUrl ? 'CHANGE' : 'ATTACH'}
            <input
              type="file"
              className="hidden"
              accept=".pdf"
              onChange={handleFileChange}
              disabled={uploading || validatingAI}
            />
          </label>
        </div>
      </div>
    </div>
  );
}
