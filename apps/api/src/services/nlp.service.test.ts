import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NLPService } from './nlp.service.js';

// Mock the Google Generative AI SDK
vi.mock('@google/generative-ai', () => {
  const generateContentMock = vi.fn();
  const getGenerativeModelMock = vi.fn(() => ({
    generateContent: generateContentMock
  }));

  return {
    GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
      getGenerativeModel: getGenerativeModelMock
    }))
  };
});

// Import the mocked classes to set up their behaviors in tests
import { GoogleGenerativeAI } from '@google/generative-ai';

describe('NLPService', () => {
  let service: NLPService;
  let mockGenerateContent: any;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GOOGLE_AI_API_KEY = 'test-key';
    service = new NLPService();
    
    // Extract the mock function to control it
    const genAI = new (GoogleGenerativeAI as any)();
    mockGenerateContent = genAI.getGenerativeModel().generateContent;
  });

  it('should extract structured data from teacher feedback', async () => {
    const inputText = "El alumno llegó puntual y trabajó muy bien la competencia Transversal, le pongo un 5.";
    
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => JSON.stringify({
          attendanceStatus: "PRESENT",
          competenceUpdate: {
            competenceName: "Transversal",
            score: 5,
            reason: "Excelente desempeño y puntualidad"
          }
        })
      }
    });

    const result = await service.processText(inputText);

    expect(result.attendanceStatus).toBe("PRESENT");
    expect(result.competenceUpdate?.score).toBe(5);
    expect(result.competenceUpdate?.competenceName).toBe("Transversal");
    expect(mockGenerateContent).toHaveBeenCalled();
  });

  it('should handle negative feedback correctly', async () => {
    const inputText = "No ha venido a clase.";
    
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => JSON.stringify({
          attendanceStatus: "ABSENT",
          competenceUpdate: null
        })
      }
    });

    const result = await service.processText(inputText);

    expect(result.attendanceStatus).toBe("ABSENT");
    expect(result.competenceUpdate).toBeUndefined();
  });

  it('should return empty analysis for very short text', async () => {
    const result = await service.processText("ok");
    expect(result.attendanceStatus).toBeUndefined();
    expect(result.cleanedObservation).toBe("ok");
  });

  it('should handle AI errors gracefully', async () => {
    mockGenerateContent.mockRejectedValue(new Error("AI_ERROR"));
    
    const result = await service.processText("Alguna observación importante.");
    
    expect(result.cleanedObservation).toBe("Alguna observación importante.");
    expect(result.attendanceStatus).toBeUndefined();
  });
});
