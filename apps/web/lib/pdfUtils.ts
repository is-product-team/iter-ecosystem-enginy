import * as pdfjsLib from 'pdfjs-dist';

// Configurar el worker de PDF.js usando CDN para evitar problemas de empaquetado con Next.js/Webpack
if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
}

/**
 * Extrae todo el texto de un documento PDF.
 */
export async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(' ');
    fullText += pageText + '\n';
  }
  
  return fullText;
}

/**
 * Heuristics to classify document type based on textual content.
 */
export function classifyDocumentType(text: string): 'pedagogical_agreement' | 'mobility_authorization' | 'image_rights' | 'unknown' {
  const t = text.toLowerCase();
  
  if (t.includes('acord pedagògic') || t.includes('acuerdo pedagógico')) {
    return 'pedagogical_agreement';
  }
  
  if (t.includes('autorització de mobilitat') || t.includes('mobilitat autònoma')) {
    return 'mobility_authorization';
  }
  
  if (t.includes("drets d'imatge") || t.includes('derechos de imagen')) {
    return 'image_rights';
  }
  
  return 'unknown';
}

/**
 * Extrae datos estructurados (Metadata) usando Expresiones Regulares
 */
export function extractMetadata(text: string) {
  // Ejemplo de extracción de IDALU (normalmente de 9 o 10 caracteres alfanuméricos tras la palabra IDALU)
  const idaluRegex = /IDALU[\s:]*([a-zA-Z0-9]{8,12})/i;
  const matchIdalu = text.match(idaluRegex);
  
  // Ejemplo de extracción de nombre (Asume un formato de formulario específico)
  const nameRegex = /Nombre del alumno[\s:]+([A-Za-zÀ-ÖØ-öø-ÿ\s]+)/i;
  const matchName = text.match(nameRegex);
  
  return {
    idalu: matchIdalu ? matchIdalu[1].trim() : null,
    studentName: matchName ? matchName[1].trim() : null,
  };
}
