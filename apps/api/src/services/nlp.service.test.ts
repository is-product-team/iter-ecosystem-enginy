import { describe, it, expect, beforeEach } from 'vitest';
import { NLPService } from './nlp.service.js';

describe('NLPService', () => {
  let service: NLPService;

  beforeEach(() => {
    service = new NLPService();
  });

  it('should detect "Retard" status from keywords', () => {
    const texts = [
      'Ha llegado con retraso',
      'Viene tarde hoy',
      'Retard en la sessió'
    ];
    texts.forEach(text => {
      const result = service.processText(text);
      expect(result.attendanceStatus).toBe('Retard');
    });
  });

  it('should detect "Absencia" status from keywords', () => {
    const texts = [
      'No ha venido a clase',
      'Falta injustificada',
      'Está absent'
    ];
    texts.forEach(text => {
      const result = service.processText(text);
      expect(result.attendanceStatus).toBe('Absencia');
    });
  });

  it('should detect positive transversal competencies', () => {
    const text = 'El alumno ayuda mucho a sus compañeros y tiene mucha iniciativa.';
    const result = service.processText(text);
    
    expect(result.competenceUpdate).toBeDefined();
    expect(result.competenceUpdate?.competenceName).toBe('Transversal');
    expect(result.competenceUpdate?.score).toBe(5);
    expect(result.competenceUpdate?.reason).toContain('ayuda');
    expect(result.competenceUpdate?.reason).toContain('iniciativa');
  });

  it('should return the original text as cleanedObservation', () => {
    const text = 'Clase normal sin incidencias.';
    const result = service.processText(text);
    expect(result.cleanedObservation).toBe(text);
    expect(result.attendanceStatus).toBeUndefined();
  });
});
