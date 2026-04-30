// Maps file extensions to the MIME types the backend switch accepts.
// Covers: PDF, Word documents, plain text, ZIP archives, and common image formats.
export const EXT_MIME_MAP: Record<string, string> = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  txt: 'text/plain',
  zip: 'application/zip',
  tiff: 'image/tiff',
  tif: 'image/tiff',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
};

function fileExtension(fileName: string): string {
  return fileName.split('.').pop()?.toLowerCase() ?? '';
}

/**
 * Resolve the best MIME type for a file to send to the backend.
 * Falls back to extension lookup when the browser reports an empty or
 * generic application/octet-stream type (common for Office files on Windows).
 */
export function resolveFileMimeType(file: File): string {
  const browserType = String(file?.type ?? '').trim();
  if (browserType && browserType !== 'application/octet-stream') {
    return browserType;
  }
  const ext = fileExtension(file?.name ?? '');
  return EXT_MIME_MAP[ext] ?? 'application/octet-stream';
}

/**
 * Validate whether a file is allowed for a given field.
 * Checks the browser-reported MIME type first, then falls back to
 * extension lookup so that Office files on Windows are not blocked.
 * Also accepts any image/* if the field allows image/* types.
 */
export function resolveEffectiveMimeType(file: File, allowedMimeTypes: string[]): string | null {
  const resolved = resolveFileMimeType(file);
  if (allowedMimeTypes.includes(resolved)) return resolved;
  // Allow any image/* if the field accepts image types
  if (resolved.startsWith('image/') && allowedMimeTypes.some((m) => m.startsWith('image/'))) {
    return resolved;
  }
  return null;
}
