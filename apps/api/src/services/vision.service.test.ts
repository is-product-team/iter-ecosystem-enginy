import { describe, it, expect, beforeEach, vi } from 'vitest';
import { VisionService } from './vision.service.js';

describe('VisionService', () => {
  let service: VisionService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new VisionService();
    
    // Mock global fetch for Ollama calls
    global.fetch = vi.fn();
  });

  it('should validate a correct signed PDF', async () => {
    const mockFile = {
      originalname: 'acord_pedagogic_firmado.pdf',
      size: 5000, 
      buffer: Buffer.from('dummy-pdf-content'),
    } as any;

    const mockResponse = {
      response: 'YES, I can clearly see a signature.'
    };

    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockResponse
    });

    const result = await service.validateDocument(mockFile);
    
    expect(result.valid).toBe(true);
    expect(result.metadata.hasSignature).toBe(true);
  });

  it('should fail if not a PDF or supported image', async () => {
    const mockFile = {
      originalname: 'documento.txt',
      size: 5000,
    } as any;

    const result = await service.validateDocument(mockFile);
    
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Formato de archivo no soportado. Por favor, sube PDF o imágenes.');
  });

  it('should detect missing signature if AI content does not mention it', async () => {
    const mockFile = {
      originalname: 'acord_unsigned.pdf',
      size: 5000,
      buffer: Buffer.from('dummy-pdf-content'),
    } as any;

    const mockResponse = {
      response: 'NO, the signature box is completely empty.'
    };

    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockResponse
    });

    const result = await service.validateDocument(mockFile);
    
    expect(result.valid).toBe(false);
    expect(result.metadata.hasSignature).toBe(false);
    expect(result.errors).toContain("Firma manuscrita no detectada en la región esperada.");
  });
});
