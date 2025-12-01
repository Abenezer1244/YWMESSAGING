# Zod Input Validation Guide

This guide shows how to apply Zod validation schemas to your routes.

## Quick Start

### 1. Import schemas and middleware

```typescript
import { RegisterSchema, LoginSchema, SendMessageSchema } from '../lib/validation/schemas.js';
import { validateRequest } from '../middleware/validation.middleware.js';
```

### 2. Apply to route handlers

```typescript
// Auth routes
router.post('/register', validateRequest(RegisterSchema), async (req, res) => {
  const { email, password, churchName } = req.body; // Already validated!
  // ... rest of handler
});

router.post('/login', validateRequest(LoginSchema), async (req, res) => {
  const { email, password } = req.body;
  // ... rest of handler
});
```

### 3. Message routes

```typescript
router.post('/messages/send',
  authenticateToken,
  validateRequest(SendMessageSchema),
  async (req, res) => {
    const { content, recipientIds, scheduleTime } = req.body;
    // All validated, type-safe
  }
);
```

## What Gets Validated

### Auth Routes
- ✅ `POST /auth/register` - Email, password strength, church name
- ✅ `POST /auth/login` - Email format, password present
- ✅ `POST /auth/forgot-password` - Valid email
- ✅ `POST /auth/reset-password` - Valid reset token

### Message Routes
- ✅ `POST /messages/send` - Message length, recipient count, format
- ✅ `POST /messages/schedule` - All message validation + schedule time
- ✅ `GET /messages/history` - Query filters (status, date range, limit)

### Contact Routes
- ✅ `POST /contacts` - First/last name, phone format, email
- ✅ `PUT /contacts/:id` - Partial update validation
- ✅ `POST /contacts/import` - Bulk contact validation (max 10,000)

### Billing Routes
- ✅ `POST /billing/subscribe` - Plan ID, Stripe token
- ✅ `PUT /billing/info` - Email, billing name, address

## Error Response Format

When validation fails:

```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Invalid email address",
      "code": "invalid_string"
    },
    {
      "field": "password",
      "message": "Password must be at least 12 characters",
      "code": "too_small"
    }
  ],
  "timestamp": "2025-12-01T12:34:56.789Z"
}
```

## Validation Rules by Field

### Passwords
- Minimum 12 characters
- At least one uppercase letter (A-Z)
- At least one number (0-9)
- At least one special character (!@#$%^&*)
- Example: `SecurePass123!`

### Phone Numbers
- Format: `+` followed by 9-15 digits
- Examples: `+12025551234`, `+441234567890`, `+33123456789`

### Email Addresses
- Standard email format
- Maximum 255 characters
- Automatically lowercased

### Messages
- Content: 1-160 characters (SMS standard)
- Recipients: At least 1, max 10,000
- Status: draft, scheduled, sending, sent, or failed

### Church Names
- 1-255 characters
- Whitespace trimmed

### Contacts
- First/Last name: 1-100 characters
- Phone: Required, valid format
- Email: Optional, must be valid if provided

## Type Safety

All schemas export TypeScript types:

```typescript
import type { RegisterInput, SendMessageInput } from '../lib/validation/schemas.js';

function handleRegister(data: RegisterInput) {
  // TypeScript knows email, password, churchName exist
  const email = data.email; // ✅ type: string
  const password = data.password; // ✅ type: string
}
```

## Adding New Validations

1. **Add schema** to `src/lib/validation/schemas.ts`:
```typescript
export const MyNewSchema = z.object({
  field: z.string().min(1).max(255),
  // ... more fields
});

export type MyNewInput = z.infer<typeof MyNewSchema>;
```

2. **Apply to route**:
```typescript
router.post('/endpoint', validateRequest(MyNewSchema), handler);
```

That's it! No manual validation needed.

## Testing Validation

Test with invalid data:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "password": "weak",
    "churchName": ""
  }'

# Response: 400 Validation failed
# Shows exactly what's wrong with each field
```

## Production Notes

- Validation happens BEFORE business logic
- Invalid requests fail fast with 400 status
- Database is never reached for invalid input
- Type system prevents bugs at compile time
- All error messages are user-friendly

## Security Benefits

1. **SQL Injection**: Type validation prevents SQL attacks
2. **XSS**: String length limits prevent payload injection
3. **Data Corruption**: Invalid data never reaches database
4. **Type Safety**: TypeScript catches bugs before runtime
5. **DoS Prevention**: Input size limits prevent resource exhaustion

---

**Next Step**: Apply these validation schemas to all routes in your application.
