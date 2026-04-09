import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NLPService } from './nlp.service.js';

describe('NLPService', () => {
  let service: NLPService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new NLPService();
    
    // Mock global fetch for Ollama calls
    global.fetch = vi.fn();
  });

  it('should detect "LATE" status from English AI response', async () => {
    const mockResponse = {
      response: JSON.stringify({
        attendanceStatus: 'LATE',
        confidence: 0.95,
        reason: 'Student arrived 15 minutes after start'
      })
    };

    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        json: async () => mockResponse
      })
    });
    
    // Simplified mock for the internal fetch call in nlp.service.ts
    global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse
    });

    const result = await service.processText('Student arrived 15 minutes late');
    expect(result.attendanceStatus).toBe('LATE');
  });

  it('should detect "ABSENT" status from English AI response', async () => {
    const mockResponse = {
      response: JSON.stringify({
        attendanceStatus: 'ABSENT',
        confidence: 0.99,
        reason: 'Not present in the classroom'
      })
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse
    });

    const result = await service.processText('The student did not show up today');
    expect(result.attendanceStatus).toBe('ABSENT');
  });

  it('should handle competence updates correctly', async () => {
    const mockResponse = {
      response: JSON.stringify({
        attendanceStatus: 'PRESENT',
        confidence: 1.0,
        competenceUpdate: {
          competenceName: 'Punctuality',
          score: 5,
          reason: 'Submitted all tasks on time'
        }
      })
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse
    });

    const result = await service.processText('Always submits work on time');
    
    expect(result.competenceUpdate).toBeDefined();
    expect(result.competenceUpdate?.competenceName).toBe('Punctuality');
    expect(result.competenceUpdate?.score).toBe(5);
  });

  it('should return the original text as cleanedObservation', async () => {
    const mockResponse = {
      response: JSON.stringify({
        attendanceStatus: 'PRESENT',
        cleanedObservation: 'Clase normal sin incidencias.'
      })
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse
    });

    const text = 'Clase normal sin incidencias.';
    const result = await service.processText(text);
    expect(result.cleanedObservation).toBe(text);
  });
});
