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
export function parseFields(fieldsParam: string | undefined): string[] {
  if (!fieldsParam) {
    return [];
  }

  return fieldsParam
    .split(',')
    .map((field) => field.trim())
    .filter((field) => field.length > 0);
}

/**
 * Get nested value from object using dot notation
 * Example: getNestedValue({ user: { name: "John" } }, "user.name") -> "John"
 */
function getNestedValue(obj: any, path: string): any {
  if (!obj || typeof obj !== 'object') {
    return undefined;
  }

  const parts = path.split('.');
  let current = obj;

  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return undefined;
    }
  }

  return current;
}

/**
 * Set nested value in object using dot notation
 * Example: setNestedValue({}, "user.name", "John") -> { user: { name: "John" } }
 */
function setNestedValue(obj: any, path: string, value: any): void {
  const parts = path.split('.');
  const lastPart = parts.pop();

  if (!lastPart) {
    return;
  }

  let current = obj;
  for (const part of parts) {
    if (!(part in current)) {
      current[part] = {};
    }
    current = current[part];
  }

  current[lastPart] = value;
}

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
export function filterFields(data: any, fields: string[]): any {
  if (!fields || fields.length === 0) {
    return data; // Return full response if no fields specified
  }

  if (Array.isArray(data)) {
    // Filter array items
    return data.map((item) => filterFields(item, fields));
  }

  if (typeof data !== 'object' || data === null) {
    return data;
  }

  const filtered: any = {};

  for (const field of fields) {
    const value = getNestedValue(data, field);
    if (value !== undefined) {
      setNestedValue(filtered, field, value);
    }
  }

  return filtered;
}

/**
 * Filter response data with optional field selection
 * Handles both single objects and arrays
 *
 * Usage in route:
 * const fields = parseFields(req.query.fields as string);
 * const filtered = formatResponse(data, fields);
 * res.json(filtered);
 */
export function formatResponse<T extends any>(data: T, fields: string[] = []): T {
  if (fields.length === 0) {
    return data;
  }

  return filterFields(data, fields) as T;
}

/**
 * Add cache headers to response based on response type
 * Different types of responses have different cache lifetimes
 */
export type CacheType = 'short' | 'medium' | 'long' | 'no-cache';

export function getCacheHeaders(cacheType: CacheType = 'medium'): Record<string, string> {
  const headers: Record<CacheType, Record<string, string>> = {
    'short': {
      'Cache-Control': 'public, max-age=300', // 5 minutes
      'Expires': new Date(Date.now() + 5 * 60 * 1000).toUTCString(),
    },
    'medium': {
      'Cache-Control': 'public, max-age=3600', // 1 hour
      'Expires': new Date(Date.now() + 60 * 60 * 1000).toUTCString(),
    },
    'long': {
      'Cache-Control': 'public, max-age=86400', // 24 hours
      'Expires': new Date(Date.now() + 24 * 60 * 60 * 1000).toUTCString(),
    },
    'no-cache': {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  };

  return headers[cacheType];
}

/**
 * Validate field names to prevent invalid field selection
 * Useful for security - prevent accessing fields that shouldn't be exposed
 */
export function validateFields(
  requestedFields: string[],
  allowedFields: string[]
): boolean {
  return requestedFields.every((field) => {
    // Handle nested fields (e.g., "user.name" -> check "user" and "name")
    const baseField = field.split('.')[0];
    return allowedFields.includes(baseField);
  });
}

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
