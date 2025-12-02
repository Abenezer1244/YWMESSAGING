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
export declare function setDownloadHeaders(res: any, filename: string, contentType: string, disposition?: 'attachment' | 'inline'): void;
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
declare function sanitizeFilename(filename: string): string;
/**
 * File type to MIME type mapping
 * Ensures correct Content-Type for common file types
 */
export declare const MIME_TYPES: Record<string, string>;
/**
 * Get MIME type from file extension
 *
 * Example:
 * - getMimeType('export.json') → 'application/json'
 * - getMimeType('document.pdf') → 'application/pdf'
 * - getMimeType('unknown.xyz') → 'application/octet-stream' (default)
 */
export declare function getMimeType(filename: string): string;
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
declare const _default: {
    setDownloadHeaders: typeof setDownloadHeaders;
    getMimeType: typeof getMimeType;
    sanitizeFilename: typeof sanitizeFilename;
};
export default _default;
//# sourceMappingURL=download-headers.d.ts.map