
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
    private ollamaHost: string;
    private model: string;

    constructor() {
        this.ollamaHost = process.env.OLLAMA_HOST || 'http://ollama:11434';
        this.model = process.env.AI_MODEL_NLP || 'gemma:2b';
    }

    /**
     * Analyzes the teacher's input text to extract structured data.
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
            Salida: Solo JSON.
            
            Esquema:
            {
              "attendanceStatus": "PRESENT" | "LATE" | "ABSENT" | "JUSTIFIED_ABSENCE" | null,
              "competenceUpdate": { "competenceName": "Transversal", "score": 1-5, "reason": "Breve resumen" } | null
            }

            Input: "${text}"
            Response:`;

            const response = await fetch(`${this.ollamaHost}/api/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: this.model,
                    prompt: prompt,
                    stream: false,
                    format: 'json'
                })
            });

            if (!response.ok) throw new Error('Ollama connection failed');

            const data = await response.json() as any;
            const aiResult = JSON.parse(data.response);

            return {
                attendanceStatus: aiResult.attendanceStatus || undefined,
                competenceUpdate: aiResult.competenceUpdate || undefined,
                cleanedObservation: text
            };

        } catch (error) {
            console.error('❌ NLPService Local AI Error:', error);
            // Graceful fallback to empty structured data if AI fails
            return {
                cleanedObservation: text
            };
        }
    }
}
