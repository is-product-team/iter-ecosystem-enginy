import { describe, it, expect, beforeEach, vi } from 'vitest';
import { VisionService } from './vision.service.js';

describe('VisionService', () => {
  let service: VisionService;

  beforeEach(() => {
    service = new VisionService();
  });

  it('should validate a correct signed PDF', async () => {
    const mockFile = {
      originalname: 'acord_pedagogic_firmado.pdf',
      size: 5000, // 5KB
      buffer: Buffer.from('dummy-content'),
    } as any;

    const result = await service.validateDocument(mockFile);
    
    expect(result.valid).toBe(true);
    expect(result.metadata.hasSignature).toBe(true);
    expect(result.metadata.confidence).toBeGreaterThan(0.9);
  });

  it('should fail if not a PDF', async () => {
    const mockFile = {
      originalname: 'documento.jpg',
      size: 5000,
    } as any;

    const result = await service.validateDocument(mockFile);
    
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Invalid file format. AI expects PDF structure.');
  });

  it('should detect missing signature if filename contains "unsigned"', async () => {
    const mockFile = {
      originalname: 'acord_unsigned.pdf',
      size: 5000,
    } as any;

    const result = await service.validateDocument(mockFile);
    
    expect(result.valid).toBe(false);
    expect(result.metadata.hasSignature).toBe(false);
    expect(result.errors).toContain("Signature not detected in the 'signature_box' region.");
  });

  it('should fail if file is too small (empty)', async () => {
    const mockFile = {
      originalname: 'document.pdf',
      size: 500, // 500 bytes
    } as any;

    const result = await service.validateDocument(mockFile);
    
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Document appears to be empty.');
  });
});
