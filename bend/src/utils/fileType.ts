export function isValidFileType(buffer: Buffer): { valid: boolean, ext?: string, mime?: string } {
  if (buffer.length < 4) return { valid: false };
  
  // PDF: %PDF (25 50 44 46)
  if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
    return { valid: true, ext: 'pdf', mime: 'application/pdf' };
  }
  
  // JPEG: FF D8 FF
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return { valid: true, ext: 'jpg', mime: 'image/jpeg' };
  }
  
  // PNG: 89 50 4E 47
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
    return { valid: true, ext: 'png', mime: 'image/png' };
  }
  
  return { valid: false };
}
