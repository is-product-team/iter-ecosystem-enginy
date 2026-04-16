import { GoogleGenerativeAI } from "@google/generative-ai";

export interface CompetenceUpdate {
    competenceName: string;
    score: number;
    reason: string;
}

export interface NLPAnalysisResult {
    attendanceStatus?: 'PRESENT' | 'LATE' | 'ABSENT' | 'JUSTIFIED_ABSENCE';
    competenceUpdates?: CompetenceUpdate[];
    competenceUpdate?: {
        competenceName: string;
        score: number;
        reason: string;
    };
    cleanedObservation: string;
}

export class NLPService {
    private genAI: GoogleGenerativeAI;
    private model: any;

    constructor() {
        const apiKey = process.env.GOOGLE_AI_API_KEY;
        if (!apiKey) {
            console.warn('⚠️ GOOGLE_AI_API_KEY missing in environment. NLP AI will be disabled or fail.');
        }
        this.genAI = new GoogleGenerativeAI(apiKey || 'dummy');
        // Gemini 1.5 Flash is perfect for text analysis
        this.model = this.genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            generationConfig: {
                responseMimeType: "application/json",
            }
        });
    }

    /**
     * Analyzes the teacher's input text to extract structured data using Gemini 1.5 Flash.
     */
    public async processText(text: string): Promise<NLPAnalysisResult> {
        // Fallback for empty text
        if (!text || text.trim().length < 3) {
            return { cleanedObservation: text };
        }

        try {
            const prompt = `
            Tarea: Extraer el estado de asistencia del estudiante y la evaluación de competencias a partir del feedback del profesor.
            Contexto: El proyecto Iter utiliza 3 documentos: Acuerdo Pedagógico, Registro Nominal y Evaluación de Competencias.
            Entrada teacher feedback: "${text}"
            
            Salida: Responde estrictamente en formato JSON.
            Esquema:
            {
              "attendanceStatus": "PRESENT" | "LATE" | "ABSENT" | "JUSTIFIED_ABSENCE" | null,
              "competenceUpdate": { "competenceName": "Transversal", "score": 1-5, "reason": "Breve resumen" } | null
            }`;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const aiResult = JSON.parse(response.text());

            return {
                attendanceStatus: aiResult.attendanceStatus || undefined,
                competenceUpdate: aiResult.competenceUpdate || undefined,
                cleanedObservation: text
            };

        } catch (error) {
            console.error('❌ NLPService Gemini Cloud Error:', error);
            // Graceful fallback to empty structured data if AI fails
            return {
                cleanedObservation: text
            };
        }
    }
}
