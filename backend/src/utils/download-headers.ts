/**
 * ✅ SECURITY: Download and File Serving Headers
 *
 * Purpose: Secure handling of file downloads and responses
 * Prevents:
 * - Header injection attacks (newlines in filenames)
 * - MIME type sniffing
 * - Unwanted browser execution
 * - Directory traversal attempts
 *
 * Reference: RFC 6266 (Content-Disposition), RFC 5987 (UTF-8 Encoding)
 */

/**
 * Generate safe Content-Disposition header for file downloads
 *
 * Example:
 * ```
 * setDownloadHeaders(res, 'church_data.json', 'application/json');
 * res.send(jsonData);
 * ```
 *
 * Output header:
 * Content-Disposition: attachment; filename="church_data.json"; filename*=UTF-8''church_data.json
 */
export function setDownloadHeaders(
  res: any,
  filename: string,
  contentType: string,
  disposition: 'attachment' | 'inline' = 'attachment'
): void {
  // Sanitize filename: remove path separators and control characters
  const safeFilename = sanitizeFilename(filename);

  // Encode filename for safe header transmission
  const encodedFilename = encodeFilename(safeFilename);
  const utf8Filename = encodeUTF8Filename(safeFilename);

  // Set Content-Type
  res.setHeader('Content-Type', contentType);

  // Set Content-Disposition with both ASCII and UTF-8 encoded versions
  // RFC 6266: Use both filename (ASCII) and filename* (UTF-8)
  res.setHeader(
    'Content-Disposition',
    `${disposition}; filename="${encodedFilename}"; filename*=UTF-8''${utf8Filename}`
  );

  // Prevent MIME type sniffing
  // Tells browser: "Trust the Content-Type header, don't sniff"
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Cache control for downloadable files
  // Don't cache in browser, must revalidate from server
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
}

/**
 * Sanitize filename to prevent security issues
 *
 * Removes:
 * - Path separators (/, \)
 * - Control characters (newlines, nulls, etc.)
 * - Double dots (..) for directory traversal
 * - Leading dots (hidden files on Unix)
 *
 * Examples:
 * - "../../etc/passwd" → "etc/passwd"
 * - "file.txt\n" → "file.txt"
 * - ".bashrc" → "bashrc"
 */
function sanitizeFilename(filename: string): string {
  return (
    filename
      // Remove path separators to prevent directory traversal
      .replace(/[\/\\]+/g, '_')
      // Remove control characters (including newlines, carriage returns, nulls)
      .replace(/[\x00-\x1f\x7f]/g, '')
      // Remove double dots to prevent directory traversal
      .replace(/\.\./g, '_')
      // Remove leading dots (hidden files)
      .replace(/^\.+/, '')
      // Remove trailing dots and spaces (Windows reserved)
      .replace(/[\s.]+$/, '')
      // Limit length to 255 bytes (filesystem limit)
      .slice(0, 255)
  );
}

/**
 * Encode filename for ASCII Content-Disposition header
 * Escapes quotes and backslashes per RFC 2616
 *
 * Examples:
 * - 'simple.txt' → 'simple.txt'
 * - 'file"with"quotes.txt' → 'file\\"with\\"quotes.txt'
 * - 'file\\with\\backslashes.txt' → 'file\\\\with\\\\backslashes.txt'
 */
function encodeFilename(filename: string): string {
  return filename
    // Escape backslashes (must be done first)
    .replace(/\\/g, '\\\\')
    // Escape double quotes
    .replace(/"/g, '\\"');
}

/**
 * Encode filename for UTF-8 Content-Disposition header (RFC 5987)
 * Uses percent-encoding for special characters
 *
 * Examples:
 * - 'data.json' → 'data.json'
 * - 'data (1).json' → 'data%20%281%29.json'
 * - 'München_export.json' → 'M%C3%BCnchen_export.json'
 *
 * Safe characters: A-Z a-z 0-9 - . _ ~
 * All others are percent-encoded
 */
function encodeUTF8Filename(filename: string): string {
  return encodeURIComponent(filename)
    // Replace safe characters that encodeURIComponent would encode
    .replace(/[!'()*]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase());
}

/**
 * File type to MIME type mapping
 * Ensures correct Content-Type for common file types
 */
export const MIME_TYPES: Record<string, string> = {
  // Data exports
  json: 'application/json',
  csv: 'text/csv',
  xml: 'application/xml',

  // Documents
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  txt: 'text/plain',

  // Images
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml',

  // Video
  mp4: 'video/mp4',
  webm: 'video/webm',
  mov: 'video/quicktime',
  avi: 'video/x-msvideo',

  // Audio
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  m4a: 'audio/mp4',
  ogg: 'audio/ogg',

  // Archive
  zip: 'application/zip',
  gz: 'application/gzip',
  tar: 'application/x-tar',
};

/**
 * Get MIME type from file extension
 *
 * Example:
 * - getMimeType('export.json') → 'application/json'
 * - getMimeType('document.pdf') → 'application/pdf'
 * - getMimeType('unknown.xyz') → 'application/octet-stream' (default)
 */
export function getMimeType(filename: string): string {
  const extension = filename.split('.').pop()?.toLowerCase() || '';
  return MIME_TYPES[extension] || 'application/octet-stream';
}

/**
 * Set headers for secure file download
 *
 * Complete example for JSON data export:
 * ```typescript
 * export async function downloadExport(req, res) {
 *   const data = await getExportData();
 *   const filename = `church_export_${new Date().toISOString()}.json`;
 *
 *   setDownloadHeaders(res, filename, 'application/json');
 *   res.json(data);
 * }
 * ```
 *
 * Complete example for CSV file download:
 * ```typescript
 * export async function downloadCsv(req, res) {
 *   const csv = await generateCsv();
 *   const filename = `conversations_${new Date().toISOString()}.csv`;
 *
 *   setDownloadHeaders(res, filename, MIME_TYPES.csv);
 *   res.send(csv);
 * }
 * ```
 */

export default {
  setDownloadHeaders,
  getMimeType,
  sanitizeFilename,
};
