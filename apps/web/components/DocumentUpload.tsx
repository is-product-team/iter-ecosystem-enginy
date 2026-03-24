'use client';

import { useState } from 'react';
import getApi from '@/services/api';
import { toast } from 'sonner';

interface DocumentUploadProps {
  idAssignacio: number;
  idInscripcio: number;
  documentType: 'acord_pedagogic' | 'autoritzacio_mobilitat' | 'drets_imatge';
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

  const [validatingAI, setValidatingAI] = useState(false);
  const [overrideMode, setOverrideMode] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const handleValidUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('idInscripcio', idInscripcio.toString());
    formData.append('documentType', documentType);

    try {
      setUploading(true);
      const api = getApi();
      const res = await api.post(`/assignacions/${idAssignacio}/student-document`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const newUrl = res.data[documentType === 'acord_pedagogic' ? 'url_acord_pedagogic' : 
                               documentType === 'autoritzacio_mobilitat' ? 'url_autoritzacio_mobilitat' : 
                               'url_drets_imatge'];
      
      setCurrentUrl(newUrl);
      onUploadSuccess(newUrl);
      toast.success(`${label} pujat correctament.`);
      setOverrideMode(false);
      setPendingFile(null);
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Error al pujar el document.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Només es permeten fitxers PDF.');
      return;
    }

    try {
      setValidatingAI(true);
      const { extractTextFromPdf, classifyDocumentType } = await import('@/lib/pdfUtils');
      const text = await extractTextFromPdf(file);
      const detectedType = classifyDocumentType(text);

      if (detectedType !== 'unknown' && detectedType !== documentType) {
        toast.error(`La IA detecta que has pujat un document tipus: ${detectedType}.`);
        setOverrideMode(true);
        setPendingFile(file);
        setValidatingAI(false);
        return;
      }

      if (documentType === 'acord_pedagogic') {
        const { signatureDetector } = await import('@/lib/visionUtils');
        await signatureDetector.loadModel();
        const croppedCanvas = await signatureDetector.getBottomThirdOfLastPage(file);
        const hasSignatures = await signatureDetector.validateSignatures(croppedCanvas, 3);
        
        if (!hasSignatures) {
          toast.error('La IA no ha detectat les 3 signatures obligatòries.');
          setOverrideMode(true);
          setPendingFile(file);
          setValidatingAI(false);
          return;
        }
      }

      // Validado correctamente por la IA
      await handleValidUpload(file);
    } catch (err) {
      console.error("AI Validation Error:", err);
      toast.error('Error processant IA. Pots forçar pujada manualment.');
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
              {isValidated ? 'DOCUMENT VALIDAT' : 'VEURE DOCUMENT'}
            </a>
          ) : (
            <span className="text-[10px] font-bold text-red-400 mt-1 uppercase">PENDENT</span>
          )}
        </div>

        {overrideMode ? (
          <div className="flex gap-2 shrink-0">
             <button
               onClick={() => { setOverrideMode(false); setPendingFile(null); }}
               className="px-3 py-2 text-[9px] font-bold uppercase tracking-widest border border-gray-300 text-gray-500 hover:bg-gray-50 transition-all"
             >
               CANCEL·LAR
             </button>
             <button
               onClick={() => pendingFile && handleValidUpload(pendingFile)}
               className="px-3 py-2 text-[9px] font-bold uppercase tracking-widest border border-red-500 text-red-600 bg-red-50 hover:bg-red-500 hover:text-white transition-all shadow-sm"
               disabled={uploading}
             >
               {uploading ? 'PUJANT...' : 'FORÇAR PUJADA'}
             </button>
          </div>
        ) : (
          <label className={`shrink-0 cursor-pointer px-4 py-2 text-[9px] font-bold uppercase tracking-widest transition-all border ${
            validatingAI ? 'bg-purple-50 border-purple-300 text-purple-600 animate-pulse' :
            uploading ? 'bg-gray-50 border-gray-100 text-gray-300' : 
            'border-[#00426B] text-[#00426B] hover:bg-blue-50 hover:shadow-sm'
          }`}>
            {validatingAI ? 'VALIDANT IA...' : uploading ? 'PUJANT...' : currentUrl ? 'CANVIAR' : 'ADJUNTAR'}
            <input 
              type="file" 
              className="hidden" 
              accept=".pdf"
              onChange={handleFileChange}
              disabled={uploading || validatingAI}
            />
          </label>
        )}
      </div>
    </div>
  );
}
