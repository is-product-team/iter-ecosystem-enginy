
export interface ValidationResult {
    valid: boolean;
    errors: string[];
    metadata: {
        detectedType: string;
        hasSignature: boolean;
        confidence: number;
    };
}

export class VisionService {
    private ollamaHost: string;
    private model: string;

    constructor() {
        this.ollamaHost = process.env.OLLAMA_HOST || 'http://ollama:11434';
        this.model = process.env.AI_MODEL_VISION || 'moondream';
    }

    /**
     * Analyzes a document using Local Vision AI (Moondream2).
     * Specialized for 4GB RAM stack.
     */
    async validateDocument(file: Express.Multer.File): Promise<ValidationResult> {
        const errors: string[] = [];
        const filename = file.originalname.toLowerCase();

        // 1. Basic File Validation
        if (!filename.endsWith('.pdf') && !filename.endsWith('.jpg') && !filename.endsWith('.png')) {
            errors.push("Formato de archivo no soportado. Por favor, sube PDF o imágenes.");
        }

        if (file.size < 1000) {
            errors.push("El documento parece estar vacío (menos de 1KB).");
        }

        if (errors.length > 0) {
            return { valid: false, errors, metadata: { detectedType: 'unknown', hasSignature: false, confidence: 0 } };
        }

        try {
            // Convert buffer to Base64 for Ollama
            const base64Image = file.buffer.toString('base64');

            const response = await fetch(`${this.ollamaHost}/api/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: this.model,
                    prompt: `Analiza este documento oficial de Iter Ecosystem.
                    1. ¿Contiene las firmas manuscritas necesarias en la parte inferior?
                    2. Responde estrictamente en formato JSON: {"hasSignature": boolean, "confidence": number, "reason": string}.
                    Busca firmas en el recuadro de 'Firma del Coordinador', 'Firma del Alumno' y 'Firma Tutor'.`,
                    images: [base64Image],
                    stream: false,
                    format: 'json'
                })
            });

            if (!response.ok) throw new Error('Ollama vision connection failed');

            const data = await response.json() as any;
            const aiResult = JSON.parse(data.response);

            const hasSignature = aiResult.hasSignature;
            
            if (!hasSignature) {
                errors.push(aiResult.reason || "Firma manuscrita no detectada en la región esperada.");
            }

            return {
                valid: errors.length === 0,
                errors,
                metadata: {
                    detectedType: 'Iter_Document_v1',
                    hasSignature,
                    confidence: aiResult.confidence || 0.5
                }
            };

        } catch (error) {
            console.error('❌ VisionService Local AI Error:', error);
            // Fallback for safety in private environment
            return {
                valid: false,
                errors: ["El motor de visión de IA local no está disponible actualmente."],
                metadata: { detectedType: 'unknown', hasSignature: false, confidence: 0 }
            };
        }
    }
}
