'use client';

import { useState, useRef } from 'react';
import getApi from '@/services/api';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import Button from './ui/Button';

interface DocumentUploadProps {
  assignmentId: number;
  enrollmentId: number;
  documentType: 'pedagogical_agreement' | 'mobility_authorization' | 'image_rights';
  initialUrl?: string | null;
  isValidated?: boolean;
  label: string;
  onUploadSuccess: (newUrl: string) => void;
  variant?: 'default' | 'table';
}

export default function DocumentUpload({
  assignmentId,
  enrollmentId,
  documentType,
  initialUrl,
  isValidated,
  label,
  onUploadSuccess,
  variant = 'default'
}: DocumentUploadProps) {
  const t = useTranslations('Common');
  const fileInputRef = useRef<HTMLInputElement>(null);
  // --- Upload and Validation States ---
  const [uploading, setUploading] = useState(false); // Indicates if the HTTP upload to backend is in progress
  const [currentUrl, setCurrentUrl] = useState(initialUrl); // Current URL of the uploaded document
  const [validatingAI, setValidatingAI] = useState(false); // Indicates if the server AI is working
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

      // Extract the URL from the 'docsStatus' JSON field of the response (Enrollment model)
      console.log('--- DEBUG UPLOAD RESPONSE ---', res.data);
      const docsStatus = res.data.docsStatus || res.data.docs_status || {};
      const fieldKey = documentType === 'pedagogical_agreement' ? 'pedagogicalAgreementUrl' :
                       documentType === 'mobility_authorization' ? 'mobilityAuthorizationUrl' :
                       'imageRightsUrl';
      
      const newUrl = docsStatus[fieldKey];
      const isValidatedAI = docsStatus[`${documentType}Validated`];

      if (newUrl) {
        setCurrentUrl(newUrl);
        onUploadSuccess(newUrl);
        
        if (isValidatedAI === false) {
           toast.error(t('ai_no_signatures'));
           setOverrideMode(true);
           setPendingFile(file);
        } else {
           toast.success(t('upload_success', { label }));
        }
      }
      
      // Clear error/blocking states after success
      setOverrideMode(false);
      setPendingFile(null);
    } catch (error: any) {
      console.error('Error uploading document:', error);
      const message = error.response?.data?.error || t('error_upload');
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  /**
   * Orchestrates AI validation when a file is selected.
   */
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log('[DEBUG] Archivo seleccionado:', file?.name, 'Tipo:', file?.type);
    if (!file) return;

    // Basic format validation
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      toast.error(t('only_pdf_allowed'));
      return;
    }

    console.log('[DEBUG] Formato validado. Iniciando validación de IA/Subida...');
    try {
      setValidatingAI(true);
      setOverrideMode(false);
      
      // We directly perform the upload. The server's VisionService (Ollama) will validate it.
      await handleValidUpload(file);
    } catch (err) {
      console.error("AI Validation Error:", err);
      toast.error(t('ai_error'));
      setOverrideMode(true);
      setPendingFile(file);
    } finally {
      setValidatingAI(false);
    }
  };

  if (variant === 'table') {
    return (
      <div className="flex items-center gap-3">
        <Button
          onClick={() => fileInputRef.current?.click()}
          variant={currentUrl ? 'subtle' : 'outline'}
          size="sm"
          className={`!p-0 w-8 h-8 ${currentUrl ? 'border-green-200 bg-green-50 text-green-600 hover:bg-green-100' : ''}`}
          loading={uploading || validatingAI}
          title={currentUrl ? t('change') : t('attach')}
        >
          {currentUrl ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          )}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="application/pdf,image/*"
          onChange={handleFileChange}
          disabled={uploading || validatingAI}
        />
        {currentUrl && (
          <a
            href={`${process.env.NEXT_PUBLIC_API_URL}${currentUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`p-2 transition-all ${isValidated ? 'text-green-600' : 'text-consorci-darkBlue hover:bg-background-subtle'}`}
            title={isValidated ? t('document_validated') : t('view_document')}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-4 p-3 border border-border-subtle bg-background-surface group hover:bg-background-subtle transition-all">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium text-text-muted">{label}</span>
          </div>
          {currentUrl ? (
            <a
              href={`${process.env.NEXT_PUBLIC_API_URL}${currentUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`text-[11px] font-medium flex items-center gap-1 mt-1 ${isValidated ? 'text-green-600' : 'text-consorci-darkBlue hover:text-consorci-lightBlue'}`}
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              {isValidated ? t('document_validated') : t('view_document')}
            </a>
          ) : (
            <span className="text-[11px] font-medium text-red-500 mt-1">{t('pending')}</span>
          )}
        </div>

        <div className="flex flex-col items-end gap-2">
          {overrideMode && pendingFile && (
            <Button
              onClick={() => handleValidUpload(pendingFile)}
              variant="danger"
              size="sm"
              className="py-1 px-3 text-[10px]"
            >
              {t('force_manual_upload')}
            </Button>
          )}
          
          <Button 
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            size="sm"
            loading={uploading || validatingAI}
          >
            {uploading ? t('uploading') : validatingAI ? t('validating_ai') : currentUrl ? t('change') : t('attach')}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="application/pdf,image/*"
            onChange={handleFileChange}
            disabled={uploading || validatingAI}
          />
        </div>
      </div>
    </div>
  );
}
