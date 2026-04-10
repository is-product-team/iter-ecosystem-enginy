'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import Loading from '@/components/Loading';
import { Enrollment } from '@/services/assignmentService';
import getApi from '@/services/api';

interface BulkDocumentUploadProps {
  assignmentId: number;
  enrollments: Enrollment[];
  onUploadComplete: () => void;
}

export default function BulkDocumentUpload({
  assignmentId,
  enrollments,
  onUploadComplete
}: BulkDocumentUploadProps) {
  const t = useTranslations('AssignmentWorkshopsPage');
  const tCommon = useTranslations('Common');
  const [isDragging, setIsDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | File[]) => {
    setProcessing(true);
    let successCount = 0;
    let failCount = 0;
    
    try {
      const { extractTextFromPdf, classifyDocumentType, extractMetadata } = await import('@/lib/pdfUtils');
      const api = getApi();

      for (const file of Array.from(files)) {
        if (file.type !== 'application/pdf') {
          failCount++;
          continue;
        }

        try {
          // 1. IA Processing
          const text = await extractTextFromPdf(file);
          const detectedType = classifyDocumentType(text);
          const metadata = extractMetadata(text);

          if (detectedType === 'unknown' || !metadata.idalu) {
            failCount++;
            continue;
          }

          // 2. Matching
          const matchingEnrollment = enrollments.find(e => 
            e.student.idalu === metadata.idalu
          );

          if (!matchingEnrollment) {
            failCount++;
            continue;
          }

          // 3. Upload Preparation
          const formData = new FormData();
          formData.append('file', file);
          formData.append('idEnrollment', matchingEnrollment.enrollmentId.toString());
          formData.append('documentType', detectedType);

          // 4. Physical Upload
          await api.post(`/assignments/${assignmentId}/student-document`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          
          successCount++;
        } catch (err) {
          console.error('[BulkUpload] Error processing file:', file.name, err);
          failCount++;
        }
      }

      if (successCount > 0) {
        toast.success(t('bulk_upload.success', { count: successCount }));
      }
      if (failCount > 0) {
        toast.error(t('bulk_upload.error', { count: failCount }));
      }
      onUploadComplete();
    } catch (error) {
      toast.error(tCommon('save_error'));
    } finally {
      setProcessing(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  return (
    <div 
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={() => fileInputRef.current?.click()}
      className={`relative p-10 border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-4 ${
        isDragging ? 'border-consorci-darkBlue bg-consorci-darkBlue/5 scale-[1.01]' : 'border-border-subtle bg-background-subtle hover:bg-background-surface'
      }`}
    >
      <input 
        type="file" 
        multiple 
        accept=".pdf" 
        className="hidden" 
        ref={fileInputRef}
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />
      
      {processing ? (
        <div className="flex flex-col items-center gap-4">
          <Loading size="mini" />
          <p className="text-[13px] font-medium text-text-muted">{t('bulk_upload.processing')}</p>
        </div>
      ) : (
        <>
          <div className="w-16 h-16 bg-background-surface rounded-full flex items-center justify-center border border-border-subtle shadow-sm transition-transform group-hover:scale-110">
            <svg className="w-8 h-8 text-consorci-darkBlue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-[15px] font-medium text-text-primary tracking-tight">{t('bulk_upload.title')}</p>
            <p className="text-[12px] font-medium text-text-muted mt-1 opacity-60">{t('bulk_upload.subtitle')}</p>
          </div>
        </>
      )}
    </div>
  );
}
