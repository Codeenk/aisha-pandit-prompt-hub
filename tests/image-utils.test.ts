import { describe, it, expect } from 'vitest';
import { validateImageFile } from '../src/lib/validation/image-utils';

describe('Image Validation Utilities', () => {
  it('should accept valid jpeg file', () => {
    const file = new File(['mock content'], 'photo.jpg', { type: 'image/jpeg' });
    const result = validateImageFile(file);
    expect(result.valid).toBe(true);
  });

  it('should accept valid png and webp files', () => {
    const pngFile = new File(['mock content'], 'photo.png', { type: 'image/png' });
    expect(validateImageFile(pngFile).valid).toBe(true);

    const webpFile = new File(['mock content'], 'photo.webp', { type: 'image/webp' });
    expect(validateImageFile(webpFile).valid).toBe(true);
  });

  it('should reject unsupported formats like pdf or gif', () => {
    const pdfFile = new File(['mock content'], 'doc.pdf', { type: 'application/pdf' });
    const result = validateImageFile(pdfFile);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Unsupported format');
  });
});
