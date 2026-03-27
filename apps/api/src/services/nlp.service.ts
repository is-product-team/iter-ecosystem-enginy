
export interface NLPAnalysisResult {
    attendanceStatus?: 'PRESENT' | 'LATE' | 'ABSENCE' | 'ABSENCE_JUSTIFIED';
    competenceUpdate?: {
        competenceName: string; // 'Transversal' usually
        score: number;
        reason: string;
    };
    cleanedObservation: string;
}

export class NLPService {

    /**
     * Analyzes the teacher's input text to extract structured data.
     */
    public processText(text: string): NLPAnalysisResult {
        const lowerText = text.toLowerCase();
        const result: NLPAnalysisResult = {
            cleanedObservation: text
        };

        // 1. Detect Punctuality
        if (lowerText.includes('tarde') || lowerText.includes('retraso') || lowerText.includes('retard')) {
            result.attendanceStatus = 'LATE';
        } else if (lowerText.includes('falta') || lowerText.includes('no ha venido') || lowerText.includes('absent')) {
            result.attendanceStatus = 'ABSENCE';
        } else if (lowerText.includes('justificad')) {
            result.attendanceStatus = 'ABSENCE_JUSTIFIED';
        } else if (lowerText.includes('puntual') || lowerText.includes('a tiempo')) {
            result.attendanceStatus = 'PRESENT';
        }

        // 2. Detect Competence (Teamwork / Initiative)
        // Keywords for positive transversal competence
        const positiveKeywords = ['ayuda', 'lidera', 'iniciativa', 'proactiv', 'colabora', 'equip', 'ajuda'];
        const matches = positiveKeywords.filter(k => lowerText.includes(k));

        if (matches.length > 0) {
            result.competenceUpdate = {
                competenceName: 'Transversal', // General assumption for this prototype
                score: 5, // High score for positive mention
                reason: `Detected positive behaviors: ${matches.join(', ')}`
            };
        }

        return result;
    }
}
