
export interface CompetenceUpdate {
    competenceName: string;
    score: number;
    reason: string;
}

export interface NLPAnalysisResult {
    attendanceStatus?: 'PRESENT' | 'LATE' | 'ABSENT' | 'JUSTIFIED_ABSENCE';
    competenceUpdates: CompetenceUpdate[];
    cleanedObservation: string;
}

export class NLPService {

    /**
     * Analyzes the teacher's input text to extract structured data.
     */
    public processText(text: string): NLPAnalysisResult {
        const lowerText = text.toLowerCase();
        const result: NLPAnalysisResult = {
            competenceUpdates: [],
            cleanedObservation: text
        };

        // 1. Detect Punctuality (Attendance)
        if (lowerText.includes('tarde') || lowerText.includes('retraso') || lowerText.includes('retard')) {
            result.attendanceStatus = 'LATE';
        } else if (lowerText.includes('falta') || lowerText.includes('no ha venido') || lowerText.includes('absent')) {
            result.attendanceStatus = 'ABSENT';
        } else if (lowerText.includes('justificad')) {
            result.attendanceStatus = 'JUSTIFIED_ABSENCE';
        } else if (lowerText.includes('puntual') || lowerText.includes('a tiempo')) {
            result.attendanceStatus = 'PRESENT';
        }

        // 2. Define Competence Categories
        const categories = [
            {
                name: 'Transversal',
                keywords: ['ayuda', 'equipo', 'lidera', 'iniciativa', 'proactiv', 'colabora', 'ajuda', 'equip']
            },
            {
                name: 'Técnica',
                keywords: ['técnico', 'tecnic', 'habilidad', 'destreza', 'aprendizaje', 'herramienta', 'eina', 'habilitat']
            },
            {
                name: 'Participación',
                keywords: ['participa', 'interés', 'interes', 'motivación', 'atención', 'pregunta']
            }
        ];

        // 3. Detect Scores (Simple intensity mapping)
        let baseScore = 4; // Default decent score
        if (lowerText.includes('excelente') || lowerText.includes('muy bien') || lowerText.includes('molt bé') || lowerText.includes('5')) {
            baseScore = 5;
        } else if (lowerText.includes('flojo') || lowerText.includes('mejorar') || lowerText.includes('regular') || lowerText.includes('3')) {
            baseScore = 3;
        } else if (lowerText.includes('insuficiente') || lowerText.includes('mal') || lowerText.includes('2')) {
            baseScore = 2;
        }

        // 4. Detect multiple competencies
        for (const cat of categories) {
            const matchedKeywords = cat.keywords.filter(k => lowerText.includes(k));
            if (matchedKeywords.length > 0) {
                result.competenceUpdates.push({
                    competenceName: cat.name,
                    score: baseScore,
                    reason: `Matched: ${matchedKeywords.join(', ')}`
                });
            }
        }

        return result;
    }
}
