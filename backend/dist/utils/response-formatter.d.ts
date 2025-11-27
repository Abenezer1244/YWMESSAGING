/**
 * Priority 3.1: Response Field Filtering (Sparse Fields)
 *
 * Allows clients to request only specific fields in API responses.
 * Reduces response payload size by selecting only needed fields.
 *
 * Usage:
 * GET /api/messages?fields=id,subject,sender
 *
 * Implementation:
 * - Parse fields query parameter
 * - Filter response object to include only specified fields
 * - Support nested field selection (e.g., "user.name,user.email")
 * - Graceful handling of missing or invalid fields
 *
 * Example:
 * Full response: { id: 1, subject: "...", content: "...", sender: {...}, recipients: [...] }
 * With fields=id,subject,sender:
 * Filtered response: { id: 1, subject: "...", sender: {...} }
 *
 * Impact: 80%+ size reduction for responses with large nested objects
 */
/**
 * Parse fields query parameter
 * Example: "id,subject,sender.name" -> ["id", "subject", "sender.name"]
 */
export declare function parseFields(fieldsParam: string | undefined): string[];
/**
 * Filter object to include only specified fields
 * Supports nested field selection
 *
 * @param data - Object to filter
 * @param fields - Array of field names to include (supports dot notation)
 * @returns Filtered object with only specified fields
 *
 * Example:
 * filterFields(
 *   { id: 1, name: "John", email: "john@example.com", user: { id: 2, name: "Jane" } },
 *   ["id", "name", "user.id"]
 * )
 * Returns: { id: 1, name: "John", user: { id: 2 } }
 */
export declare function filterFields(data: any, fields: string[]): any;
/**
 * Filter response data with optional field selection
 * Handles both single objects and arrays
 *
 * Usage in route:
 * const fields = parseFields(req.query.fields as string);
 * const filtered = formatResponse(data, fields);
 * res.json(filtered);
 */
export declare function formatResponse<T extends any>(data: T, fields?: string[]): T;
/**
 * Add cache headers to response based on response type
 * Different types of responses have different cache lifetimes
 */
export type CacheType = 'short' | 'medium' | 'long' | 'no-cache';
export declare function getCacheHeaders(cacheType?: CacheType): Record<string, string>;
/**
 * Validate field names to prevent invalid field selection
 * Useful for security - prevent accessing fields that shouldn't be exposed
 */
export declare function validateFields(requestedFields: string[], allowedFields: string[]): boolean;
/**
 * Example usage in a route:
 *
 * router.get('/messages', async (req, res) => {
 *   const messages = await getMessages();
 *
 *   // Parse requested fields
 *   const fields = parseFields(req.query.fields as string);
 *
 *   // Validate fields
 *   const allowedFields = ['id', 'subject', 'content', 'sender', 'recipients', 'createdAt'];
 *   if (fields.length > 0 && !validateFields(fields, allowedFields)) {
 *     return res.status(400).json({ error: 'Invalid field names' });
 *   }
 *
 *   // Filter response
 *   const filtered = formatResponse(messages, fields);
 *
 *   // Add cache headers
 *   const cacheHeaders = getCacheHeaders('medium');
 *   Object.entries(cacheHeaders).forEach(([key, value]) => {
 *     res.setHeader(key, value);
 *   });
 *
 *   res.json(filtered);
 * });
 */
//# sourceMappingURL=response-formatter.d.ts.map