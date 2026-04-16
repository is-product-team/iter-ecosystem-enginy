import { describe, it, expect, beforeEach, vi } from 'vitest';
import { VisionService } from './vision.service.js';

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

describe('VisionService', () => {
  let service: VisionService;
  let mockGenerateContent: any;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GOOGLE_AI_API_KEY = 'test-key';
    service = new VisionService();
    
    // Extract the mock function to control it
    const genAI = new (GoogleGenerativeAI as any)();
    mockGenerateContent = genAI.getGenerativeModel().generateContent;
  });

  it('should validate a correct signed PDF', async () => {
    const mockFile = {
      originalname: 'acord_pedagogic_firmado.pdf',
      size: 5000, 
      buffer: Buffer.from('dummy-pdf-content'),
      mimetype: 'application/pdf'
    } as any;

    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => '{"hasSignature": true, "confidence": 0.9, "reason": "Signature found"}'
      }
    });

    const result = await service.validateDocument(mockFile);
    
    expect(result.valid).toBe(true);
    expect(result.metadata.hasSignature).toBe(true);
    expect(mockGenerateContent).toHaveBeenCalled();
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
      mimetype: 'application/pdf'
    } as any;

    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => '{"hasSignature": false, "confidence": 0.2, "reason": "Firma manuscrita no detectada en la región esperada."}'
      }
    });

    const result = await service.validateDocument(mockFile);
    
    expect(result.valid).toBe(false);
    expect(result.metadata.hasSignature).toBe(false);
    expect(result.errors).toContain("Firma manuscrita no detectada en la región esperada.");
  });
});
