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
  // --- Estados de carga y validación ---
  const [uploading, setUploading] = useState(false); // Indica si la subida HTTP al backend está en curso
  const [currentUrl, setCurrentUrl] = useState(initialUrl); // URL actual del documento subido
  const [validatingAI, setValidatingAI] = useState(false); // Indica si el pipeline de IA (TensorFlow/PDF.js) está trabajando
  const [overrideMode, setOverrideMode] = useState(false); // Se activa si la IA rechaza el doc, permitiendo subida manual
  const [pendingFile, setPendingFile] = useState<File | null>(null); // Almacena el archivo que falló la validación para el "Forzado"

  /**
   * Realiza la subida física del archivo al servidor una vez validado (o forzado).
   */
  const handleValidUpload = async (file: File) => {
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

      // Extraemos la URL según el tipo de documento para actualizar la UI local
      const newUrl = res.data[documentType === 'pedagogical_agreement' ? 'url_pedagogical_agreement' :
        documentType === 'mobility_authorization' ? 'url_mobility_authorization' :
          'url_image_rights'];

      setCurrentUrl(newUrl);
      onUploadSuccess(newUrl);
      toast.success(`${label} uploaded successfully.`);
      
      // Limpiamos estados de error/bloqueo tras éxito
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
   * Orquestador de la validación por IA al seleccionar un archivo.
   */
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validación básica de formato
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed.');
      return;
    }

    try {
      setValidatingAI(true);
      setOverrideMode(false);
      
      // Carga dinámica de utilidades para no penalizar el bundle inicial
      const { extractTextFromPdf, classifyDocumentType } = await import('@/lib/pdfUtils');
      const text = await extractTextFromPdf(file);
      const detectedType = classifyDocumentType(text);

      // Mapeo entre el tipo esperado por props y el detectado por IA (heurísticas de texto)
      const expectedInIAPipeline = documentType === 'pedagogical_agreement' ? 'acord_pedagogic' : 
                                   documentType === 'mobility_authorization' ? 'autoritzacio_mobilitat' : 
                                   documentType === 'image_rights' ? 'drets_imatge' : 'unknown';

      // Validación 1: El contenido del texto debe coincidir con el tipo de "slot" de subida
      if (detectedType !== 'unknown' && detectedType !== expectedInIAPipeline) {
        toast.error(`IA detecta un tipus diferent: ${detectedType}.`);
        setOverrideMode(true);
        setPendingFile(file);
        return;
      }

      // Validación 2: Si es Acord Pedagògic, usamos Visión Artificial (TF.js) para buscar firmas
      if (documentType === 'pedagogical_agreement') {
        const { signatureDetector } = await import('@/lib/visionUtils');
        await signatureDetector.loadModel(); // Carga modelo YOLOv8 si no está en memoria
        const croppedCanvas = await signatureDetector.getBottomThirdOfLastPage(file);
        const hasSignatures = await signatureDetector.validateSignatures(croppedCanvas, 3); // Buscamos 3 firmas

        if (!hasSignatures) {
          toast.error('IA no ha detectat les signatures obligatòries.');
          setOverrideMode(true);
          setPendingFile(file);
          return;
        }
      }

      // Si pasa todos los filtros, procedemos a la subida real
      await handleValidUpload(file);
    } catch (err) {
      console.error("AI Validation Error:", err);
      toast.error('Error processant IA. Pots forçar la pujada.');
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
              Forçar Pujada Manual
            </button>
          )}
          
          <label className={`shrink-0 cursor-pointer px-4 py-2 text-[9px] font-bold uppercase tracking-widest transition-all border ${
            uploading || validatingAI ? 'bg-gray-50 border-gray-100 text-gray-300' : 'border-[#00426B] text-[#00426B] hover:bg-blue-50'
          }`}>
            {uploading ? 'PUJANT...' : validatingAI ? 'VALIDANT (IA)...' : currentUrl ? 'CANVIAR' : 'ADJUNTAR'}
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
