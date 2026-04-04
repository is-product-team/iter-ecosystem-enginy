import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker using CDN to avoid packaging issues with Next.js/Webpack
if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
}

/**
 * Extracts all text from a PDF document.
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
 * Extracts structured data (Metadata) using Regular Expressions.
 */
export function extractMetadata(text: string) {
  // Example IDALU extraction (usually 8-12 alphanumeric characters after the word IDALU)
  const idaluRegex = /IDALU[\s:]*([a-zA-Z0-9]{8,12})/i;
  const matchIdalu = text.match(idaluRegex);
  
  // Example name extraction (Assumes a specific form format)
  const nameRegex = /Nombre del alumno[\s:]+([A-Za-zÀ-ÖØ-öø-ÿ\s]+)/i;
  const matchName = text.match(nameRegex);
  
  return {
    idalu: matchIdalu ? matchIdalu[1].trim() : null,
    studentName: matchName ? matchName[1].trim() : null,
  };
}
