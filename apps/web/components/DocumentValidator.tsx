'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

export type ValidationState = 'idle' | 'analyzing_text' | 'scanning_signatures' | 'valid' | 'rejected';

interface DocumentValidatorProps {
  onValidationSuccess: (file: File, metadata: any) => void;
  documentTypeHint?: string;
}

export default function DocumentValidator({ onValidationSuccess, documentTypeHint }: DocumentValidatorProps) {
  const [validationState, setValidationState] = useState<ValidationState>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setErrorMsg('Solo se permiten documentos PDF.');
      setValidationState('rejected');
      return;
    }

    try {
      setErrorMsg(null);
      setValidationState('analyzing_text');
      
      const { extractTextFromPdf, classifyDocumentType, extractMetadata } = await import('@/lib/pdfUtils');
      const text = await extractTextFromPdf(file);
      const metadata = extractMetadata(text);
      const detectedType = classifyDocumentType(text);
      
      if (documentTypeHint && documentTypeHint !== 'unknown' && detectedType !== 'unknown' && detectedType !== documentTypeHint) {
        setErrorMsg(`El documento parece ser un ${detectedType}, pero se esperaba un ${documentTypeHint}.`);
        setValidationState('rejected');
        return;
      }

      const isAcord = detectedType === 'acord_pedagogic' || documentTypeHint === 'acord_pedagogic';

      if (isAcord) {
        setValidationState('scanning_signatures');
        const { signatureDetector } = await import('@/lib/visionUtils');
        
        // Cargar modelo si no está en memoria
        await signatureDetector.loadModel();
        
        // Recortar la parte inferior y validar firmas (necesitamos 3 para el Acord Pedagògic)
        const croppedCanvas = await signatureDetector.getBottomThirdOfLastPage(file);
        const hasSignatures = await signatureDetector.validateSignatures(croppedCanvas, 3);
        
        if (!hasSignatures) {
          setErrorMsg('No se han detectado las 3 firmas obligatorias en la parte inferior del acuerdo.');
          setValidationState('rejected');
          return;
        }
      }

      setValidationState('valid');
      onValidationSuccess(file, { type: detectedType, ...metadata });

    } catch (error) {
      console.error(error);
      setErrorMsg('Hubo un error al procesar el documento PDF.');
      setValidationState('rejected');
    }
    
  }, [onValidationSuccess, documentTypeHint]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1
  });

  return (
    <div className="flex flex-col gap-4 w-full max-w-md mx-auto p-4 border rounded-xl bg-white shadow-sm font-sans">
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed p-8 rounded-lg text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400'
        } ${validationState !== 'idle' && validationState !== 'rejected' ? 'pointer-events-none opacity-50' : ''}`}
      >
        <input {...getInputProps()} />
        
        {validationState === 'idle' && (
          <div className="flex flex-col items-center gap-2">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-sm font-medium text-gray-700">Arrastra el documento PDF aquí</p>
            <p className="text-xs text-gray-500">o haz clic para seleccionar</p>
          </div>
        )}

        {validationState === 'analyzing_text' && (
          <div className="flex flex-col items-center gap-2 text-blue-600 animate-pulse">
            <svg className="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <p className="text-sm font-bold">Analizando Estructura del Documento...</p>
          </div>
        )}

        {validationState === 'scanning_signatures' && (
          <div className="flex flex-col items-center gap-2 text-purple-600 animate-pulse">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <p className="text-sm font-bold">Escaneando Firmas (Visión por Computador)...</p>
          </div>
        )}

        {validationState === 'valid' && (
          <div className="flex flex-col items-center gap-2 text-green-600">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-bold">Documento Validado Correctamente</p>
          </div>
        )}

        {validationState === 'rejected' && (
          <div className="flex flex-col items-center gap-2 text-red-600">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-bold">Rechazado</p>
            <p className="text-xs">{errorMsg || 'El documento no cumple los requisitos.'}</p>
            <button 
              onClick={(e) => { e.stopPropagation(); setValidationState('idle'); }}
              className="mt-2 text-xs border border-red-200 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-full transition-colors"
            >
              Reintentar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
