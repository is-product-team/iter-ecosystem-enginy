
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
            errors.push("Unsupported file format. Please upload PDF or images.");
        }

        if (file.size < 1000) {
            errors.push("Document appears to be empty (less than 1KB).");
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
                    prompt: "Check this document for a handwriting signature. Is there a signature in the signature box? Answer with 'YES' or 'NO' and provide a confidence score from 0 to 1.",
                    images: [base64Image],
                    stream: false
                })
            });

            if (!response.ok) throw new Error('Ollama vision connection failed');

            const data = await response.json() as any;
            const textResponse = data.response.toUpperCase();

            const hasSignature = textResponse.includes('YES');
            
            if (!hasSignature) {
                errors.push("Handwritten signature not detected in the expected region.");
            }

            return {
                valid: errors.length === 0,
                errors,
                metadata: {
                    detectedType: 'Pedagogical_Agreement_v2',
                    hasSignature,
                    confidence: hasSignature ? 0.95 : 0.05
                }
            };

        } catch (error) {
            console.error('❌ VisionService Local AI Error:', error);
            // Fallback for safety in private environment
            return {
                valid: false,
                errors: ["Local AI vision engine is currently unavailable."],
                metadata: { detectedType: 'unknown', hasSignature: false, confidence: 0 }
            };
        }
    }
}
