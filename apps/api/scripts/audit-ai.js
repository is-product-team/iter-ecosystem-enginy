import { EvaluationService } from '../dist/services/evaluation.service.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

async function runAudit() {
  const service = new EvaluationService();
  
  const testCases = [
    "Student arrived 20 minutes late but showed excellent initiative in the workshop.",
    "The student was absent today without justification.",
    "Showed great teamwork and completed all tasks on time."
  ];

  console.log("🔍 Starting Local AI Audit (English Localization)...");
  console.log("-------------------------------------------------");

  for (const text of testCases) {
    console.log(`\n📝 Input: "${text}"`);
    try {
      const result = await service.analyzeObservationsAI(text);
      console.log(`✅ Result:`, JSON.stringify(result, null, 2));
    } catch (e) {
      console.error(`❌ Error analyzing:`, e.message);
    }
  }
}

runAudit();
