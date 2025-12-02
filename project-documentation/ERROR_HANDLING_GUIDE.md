# Error Handling Security Guide

**Status**: ✅ Implemented and enforced across all API endpoints

---

## Overview

This guide explains the security-focused error handling system that:
- ✅ **Never exposes** stack traces, database details, or system architecture to clients
- ✅ **Logs fully** on the server for debugging and monitoring
- ✅ **Maps errors** to safe, user-friendly messages
- ✅ **Returns proper** HTTP status codes

---

## How It Works

### 1. Centralized Error Handler (app.ts)

When ANY error is thrown:

```typescript
// app.ts - Error handler middleware
app.use((err: any, req, res, _next) => {
  // Log FULL details server-side (never exposed to client)
  if (err instanceof AppError) {
    err.logError();  // Logs: message, stack, context
  } else {
    console.error('[UnhandledError]', {
      message: err.message,
      stack: err.stack,    // FULL stack trace logged
      url: req.originalUrl,
      method: req.method,
      timestamp: new Date().toISOString(),
    });
  }

  // Return SAFE message to client (no stack trace, no details)
  const statusCode = getStatusCode(err);
  const userMessage = getSafeErrorMessage(err);

  res.status(statusCode).json({
    error: userMessage,  // E.g., "Something went wrong. Please try again."
  });
});
```

### 2. What Gets Hidden From Clients

❌ **Never exposed**:
- Stack traces
- File paths (`/home/user/app/services/billing.ts`)
- Error.stack
- Database error messages
- SQL queries
- Function names that reveal architecture
- Environment variables
- Internal service details
- System configuration

✅ **Safely returned**:
- User-friendly error message ("Invalid email or password")
- HTTP status code (401, 404, 500, etc.)
- Generic explanation

### 3. Example: Comparison

#### Before (❌ Insecure)
```json
{
  "error": "Database Error: relation \"conversation\" does not exist at line 4 of /home/ubuntu/app/services/conversation.service.ts:102 in getConversations()"
}
```
**Problem**: Attacker now knows your database schema, file structure, service names, and code line numbers.

#### After (✅ Secure)
```json
{
  "error": "An unexpected error occurred. Please try again later."
}
```
**Server logs** (never exposed to client):
```
[UnhandledError] {
  message: 'Database Error: relation "conversation" does not exist at line 4',
  stack: '...',
  url: '/api/conversations',
  method: 'GET',
  timestamp: '2025-12-02T14:30:00.000Z'
}
```

---

## Using AppError in Services

### Option 1: Throw AppError (Recommended)

Use this in service methods for controlled error handling:

```typescript
import { AppError } from '../utils/app-error.js';

export async function getConversations(churchId: string) {
  try {
    const conversations = await prisma.conversation.findMany({...});
    return conversations;
  } catch (error) {
    // Log the real error for debugging
    console.error('Failed to fetch conversations:', error);

    // Throw safe error to client
    throw new AppError(
      'Unable to load conversations. Please try again.',
      500,
      { churchId, errorType: 'database' }
    );
  }
}
```

**Client receives:**
```json
{
  "error": "Unable to load conversations. Please try again."
}
```

**Server logs (with full details for debugging):**
```
{
  message: 'Unable to load conversations. Please try again.',
  statusCode: 500,
  context: { churchId: 'church-123', errorType: 'database' },
  stack: '...',
  timestamp: '2025-12-02T14:30:00.000Z'
}
```

### Option 2: Use Pre-mapped Error Messages

For common scenarios, use the ERROR_MESSAGES constants:

```typescript
import { AppError, ERROR_MESSAGES } from '../utils/app-error.js';

export async function authenticate(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !await verifyPassword(password, user.passwordHash)) {
    // Use pre-mapped message (always returns safe message)
    throw new AppError(
      ERROR_MESSAGES.INVALID_CREDENTIALS.message,
      ERROR_MESSAGES.INVALID_CREDENTIALS.statusCode
    );
  }

  return user;
}
```

### Option 3: Access Control Errors

For authorization failures, throw a 403:

```typescript
export async function updateConversation(
  conversationId: string,
  churchId: string,
  updates: any
) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId }
  });

  if (conversation.churchId !== churchId) {
    throw new AppError(
      ERROR_MESSAGES.UNAUTHORIZED.message,
      ERROR_MESSAGES.UNAUTHORIZED.statusCode,
      { conversationId, requestedChurchId: churchId }
    );
  }

  return await prisma.conversation.update({...});
}
```

---

## Error Messages (Reference)

### Authentication (401)
```typescript
INVALID_CREDENTIALS: 'Invalid email or password'
TOKEN_EXPIRED: 'Your session has expired. Please log in again.'
TOKEN_INVALID: 'Invalid or malformed authentication token'
```

### Authorization (403)
```typescript
UNAUTHORIZED: 'You do not have permission to access this resource'
```

### Not Found (404)
```typescript
NOT_FOUND: 'The requested resource was not found'
CONVERSATION_NOT_FOUND: 'Conversation not found'
CHURCH_NOT_FOUND: 'Church not found'
USER_NOT_FOUND: 'User not found'
```

### Validation (400)
```typescript
INVALID_INPUT: 'The provided input is invalid. Please check your request and try again.'
VALIDATION_ERROR: 'Validation failed. Please check your input and try again.'
MISSING_REQUIRED_FIELD: 'A required field is missing from your request'
```

### Business Logic (402/500)
```typescript
INSUFFICIENT_CREDITS: 'Insufficient credits to complete this action'
TRIAL_EXPIRED: 'Your trial has expired. Please upgrade your subscription.'
SUBSCRIPTION_INACTIVE: 'Your subscription is inactive. Please upgrade to continue.'
BILLING_ERROR: 'A billing error occurred. Please contact support.'
```

### Rate Limiting (429)
```typescript
RATE_LIMIT_EXCEEDED: 'Too many requests. Please try again later.'
RATE_LIMIT_MESSAGES: 'You are sending messages too quickly. Please slow down.'
```

### Server Errors (500/503)
```typescript
DATABASE_ERROR: 'A database error occurred. Please try again later.'
INTERNAL_ERROR: 'An unexpected error occurred. Please try again later.'
SERVICE_UNAVAILABLE: 'The service is temporarily unavailable. Please try again later.'
```

### External Services (500)
```typescript
STRIPE_ERROR: 'A payment processing error occurred. Please try again or contact support.'
TELNYX_ERROR: 'A messaging service error occurred. Please try again later.'
S3_ERROR: 'A file storage error occurred. Please try again later.'
```

### File Upload (400/413)
```typescript
FILE_TOO_LARGE: 'File size exceeds the maximum allowed (500 MB)'
INVALID_FILE_TYPE: 'This file type is not supported'
```

---

## Controllers Pattern

Services throw errors. Controllers catch and respond:

```typescript
// services/conversation.service.ts
export async function getConversations(churchId: string) {
  try {
    return await prisma.conversation.findMany({...});
  } catch (error) {
    throw new AppError('Failed to load conversations', 500);
  }
}

// controllers/conversation.controller.ts
export async function getConversations(req: express.Request, res: express.Response, next: express.NextFunction) {
  try {
    const conversations = await conversationService.getConversations(req.user.churchId);
    res.json(conversations);
  } catch (error) {
    // Don't catch - let it propagate to the centralized error handler
    next(error);
  }
}
```

The centralized error handler in app.ts automatically:
1. Logs full error details
2. Returns safe message to client
3. Uses correct HTTP status code

---

## Security Checklist

- [ ] No `console.log(error)` without wrapping in `try-catch` first
- [ ] No `res.status(500).json({ error: error.message })`
- [ ] No exposing `error.stack` to clients
- [ ] No SQL queries in error responses
- [ ] No file paths in error messages
- [ ] Use AppError for business logic errors
- [ ] Use ERROR_MESSAGES for consistency
- [ ] Always throw from services, catch in controllers
- [ ] Let centralized error handler manage responses
- [ ] Log context (churchId, userId) for debugging (not exposed)

---

## Testing Error Handling

### Test 1: Invalid Request (400)
```bash
curl -X POST http://localhost:3000/api/messages/send \
  -H "Content-Type: application/json" \
  -d '{}' \
  -H "Authorization: Bearer $TOKEN"

# Expected response:
# { "error": "Validation failed. Please check your input and try again." }
```

### Test 2: Not Found (404)
```bash
curl -X GET http://localhost:3000/api/conversations/invalid-id \
  -H "Authorization: Bearer $TOKEN"

# Expected response:
# { "error": "Conversation not found" }
```

### Test 3: Unauthorized (403)
```bash
curl -X PATCH http://localhost:3000/api/conversations/other-church-id/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"status": "closed"}'

# Expected response:
# { "error": "You do not have permission to access this resource" }
```

### Test 4: No Stack Trace Exposed

All error responses MUST NOT include:
- `.stack`
- `.message` (if it contains internal details)
- File paths
- Function names
- Database details
- System information

---

## Monitoring with Sentry

The centralized error handler integrates with Sentry:

1. **Operational errors** (expected, like validation failures): Logged but not sent to Sentry
2. **Server errors** (unexpected, like database crashes): Automatically sent to Sentry
3. **All errors logged**: Full context available in server logs for debugging

---

## Common Mistakes to Avoid

❌ **Don't do this:**
```typescript
catch (error) {
  res.status(500).json({ error: error.message });  // Exposes internal details!
}
```

✅ **Do this instead:**
```typescript
catch (error) {
  throw new AppError('Operation failed. Please try again.', 500);
  // Centralized error handler will return safe message
}
```

---

❌ **Don't do this:**
```typescript
throw new Error(`Database error: ${error.message}`);  // Stack trace will leak!
```

✅ **Do this instead:**
```typescript
console.error('Database error:', error);  // Log for debugging
throw new AppError('Unable to complete operation. Please try again.', 500);
```

---

## Summary

| Aspect | Before | After |
|--------|--------|-------|
| Stack traces exposed | ❌ Yes | ✅ No |
| Server logs have details | ❌ No | ✅ Yes |
| Error messages safe | ❌ No | ✅ Yes |
| Database details leaked | ❌ Yes | ✅ No |
| Debugging capability | ❌ Lost | ✅ Full |
| HTTP status codes | ❌ Inconsistent | ✅ Proper |

---

**Last Updated**: December 2, 2025
**Implementation**: Production-ready
**Impact**: Eliminates information disclosure vulnerability (OWASP A01)
