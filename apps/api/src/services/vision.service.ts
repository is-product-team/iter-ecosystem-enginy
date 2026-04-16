import { GoogleGenerativeAI } from "@google/generative-ai";

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
    private genAI: GoogleGenerativeAI;
    private model: any;

    constructor() {
        const apiKey = process.env.GOOGLE_AI_API_KEY;
        if (!apiKey) {
            console.warn('⚠️ GOOGLE_AI_API_KEY missing in environment. Vision AI will be disabled.');
        }
        this.genAI = new GoogleGenerativeAI(apiKey || 'dummy');
        // Gemini 1.5 Flash is perfect for high-speed document validation
        this.model = this.genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            generationConfig: {
                responseMimeType: "application/json",
            }
        });
    }

    /**
     * Analyzes a document using Google Gemini 1.5 Flash (Cloud).
     * Supports PDF and Images natively.
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

        if (!process.env.GOOGLE_AI_API_KEY) {
            return {
                valid: false,
                errors: ["El servicio de validación por IA no está configurado (API Key faltante)."],
                metadata: { detectedType: 'unknown', hasSignature: false, confidence: 0 }
            };
        }

        try {
            // 2. Prepare file for Gemini
            const filePart = {
                inlineData: {
                    data: file.buffer.toString("base64"),
                    mimeType: file.mimetype
                }
            };

            const prompt = `Analiza este documento oficial de Iter Ecosystem.
            1. ¿Contiene las firmas manuscritas necesarias en la parte inferior?
            2. Responde estrictamente en formato JSON: {"hasSignature": boolean, "confidence": number, "reason": string}.
            Busca firmas en el recuadro de 'Firma del Coordinador', 'Firma del Alumno' y 'Firma Tutor'.`;

            const result = await this.model.generateContent([prompt, filePart]);
            const response = await result.response;
            const aiResult = JSON.parse(response.text());

            const hasSignature = aiResult.hasSignature;
            
            if (!hasSignature) {
                errors.push(aiResult.reason || "Firma manuscrita no detectada en la región esperada.");
            }

            return {
                valid: errors.length === 0,
                errors,
                metadata: {
                    detectedType: 'Iter_Document_Gemini_v1',
                    hasSignature,
                    confidence: aiResult.confidence || 0.8
                }
            };

        } catch (error) {
            console.error('❌ VisionService Gemini Cloud Error:', error);
            return {
                valid: false,
                errors: ["Error al conectar con el servicio de IA en la nube."],
                metadata: { detectedType: 'unknown', hasSignature: false, confidence: 0 }
            };
        }
    }
}
