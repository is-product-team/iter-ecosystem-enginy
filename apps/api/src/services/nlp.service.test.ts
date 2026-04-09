import { describe, it, expect, beforeEach } from 'vitest';
import { NLPService } from './nlp.service.js';

describe('NLPService', () => {
  let service: NLPService;

  beforeEach(() => {
    service = new NLPService();
  });

  it('should detect "LATE" status from keywords', () => {
    const texts = [
      'Ha llegado con retraso',
      'Viene tarde hoy',
      'Retard en la sessió'
    ];
    texts.forEach(text => {
      const result = service.processText(text);
      expect(result.attendanceStatus).toBe('LATE');
    });
  });

  it('should detect "ABSENT" status from keywords', () => {
    const texts = [
      'No ha venido a clase',
      'Falta injustificada',
      'Está absent'
    ];
    texts.forEach(text => {
      const result = service.processText(text);
      expect(result.attendanceStatus).toBe('ABSENT');
    });
  });

  it('should detect positive transversal competencies', () => {
    const text = 'El alumno ayuda mucho a sus compañeros, tiene mucha iniciativa y su rendimiento es excelente.';
    const result = service.processText(text);

    expect(result.competenceUpdates[0]).toBeDefined();
    expect(result.competenceUpdates[0]?.competenceName).toBe('Transversal');
    expect(result.competenceUpdates[0]?.score).toBe(5);
    expect(result.competenceUpdates[0]?.reason).toContain('ayuda');
    expect(result.competenceUpdates[0]?.reason).toContain('iniciativa');
  });

  it('should return the original text as cleanedObservation', () => {
    const text = 'Clase normal sin incidencias.';
    const result = service.processText(text);
    expect(result.cleanedObservation).toBe(text);
    expect(result.attendanceStatus).toBeUndefined();
  });
});
