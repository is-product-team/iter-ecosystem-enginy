'use client';

import { useState } from 'react';
import getApi from '@/services/api';
import { toast } from 'sonner';

interface DocumentUploadProps {
  idAssignacio: number;
  idInscripcio: number;
  documentType: 'pedagogical_agreement' | 'mobility_authorization' | 'image_rights';
  initialUrl?: string | null;
  isValidated?: boolean;
  label: string;
  onUploadSuccess: (newUrl: string) => void;
}

export default function DocumentUpload({
  idAssignacio,
  idInscripcio,
  documentType,
  initialUrl,
  isValidated,
  label,
  onUploadSuccess
}: DocumentUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(initialUrl);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('idInscripcio', idInscripcio.toString());
    formData.append('documentType', documentType);

    try {
      setUploading(true);
      const api = getApi();
      const res = await api.post(`/assignments/${idAssignacio}/student-document`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const newUrl = res.data[documentType === 'pedagogical_agreement' ? 'url_pedagogical_agreement' : 
                                documentType === 'mobility_authorization' ? 'url_mobility_authorization' : 
                                'url_image_rights'];
      
      setCurrentUrl(newUrl);
      onUploadSuccess(newUrl);
      toast.success(`${label} uploaded successfully.`);
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Error uploading document.');
    } finally {
      setUploading(false);
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

        <label className={`shrink-0 cursor-pointer px-4 py-2 text-[9px] font-bold uppercase tracking-widest transition-all border ${
          uploading ? 'bg-gray-50 border-gray-100 text-gray-300' : 'border-[#00426B] text-[#00426B] hover:bg-blue-50'
        }`}>
          {uploading ? 'UPLOADING...' : currentUrl ? 'CHANGE' : 'ATTACH'}
          <input 
            type="file" 
            className="hidden" 
            accept=".pdf"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </label>
      </div>
    </div>
  );
}
