import { z } from 'zod';
/**
 * Auth Validation Schemas
 * Used for request body validation in authentication endpoints
 */
export const registerSchema = z.object({
    email: z
        .string()
        .email('Invalid email format')
        .toLowerCase()
        .trim(),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters'),
    firstName: z
        .string()
        .min(1, 'First name cannot be empty')
        .max(100, 'First name is too long')
        .trim(),
    lastName: z
        .string()
        .min(1, 'Last name cannot be empty')
        .max(100, 'Last name is too long')
        .trim(),
    churchName: z
        .string()
        .min(1, 'Church name cannot be empty')
        .max(255, 'Church name is too long')
        .trim(),
});
export const loginSchema = z.object({
    email: z
        .string()
        .email('Invalid email format')
        .toLowerCase()
        .trim(),
    password: z
        .string()
        .min(1, 'Password is required'),
});
export const completeWelcomeSchema = z.object({
    userRole: z
        .enum(['pastor', 'admin', 'communications', 'volunteer', 'other'], {
        errorMap: () => ({ message: 'Invalid user role' }),
    }),
});
/**
 * Message Validation Schemas
 */
export const sendMessageSchema = z.object({
    content: z
        .string()
        .min(1, 'Message cannot be empty')
        .max(1600, 'Message must be 1600 characters or less')
        .trim(),
    targetType: z
        .enum(['group', 'member', 'segment'], {
        errorMap: () => ({ message: 'Invalid target type. Must be group, member, or segment' }),
    }),
    targetIds: z
        .array(z.string().uuid('Invalid target ID format'))
        .optional()
        .default([]),
});
export const getMessageHistorySchema = z.object({
    page: z
        .string()
        .optional()
        .default('1')
        .transform((val) => {
        const parsed = parseInt(val, 10);
        if (isNaN(parsed) || parsed < 1) {
            throw new Error('Page must be a positive number');
        }
        return parsed;
    }),
    limit: z
        .string()
        .optional()
        .default('20')
        .transform((val) => {
        const parsed = parseInt(val, 10);
        if (isNaN(parsed) || parsed < 1 || parsed > 100) {
            throw new Error('Limit must be between 1 and 100');
        }
        return parsed;
    }),
    status: z
        .enum(['pending', 'delivered', 'failed'], {
        errorMap: () => ({ message: 'Invalid status filter' }),
    })
        .optional(),
});
/**
 * Group Validation Schemas
 */
export const createGroupSchema = z.object({
    name: z
        .string()
        .min(1, 'Group name cannot be empty')
        .max(255, 'Group name is too long')
        .trim(),
    description: z
        .string()
        .max(500, 'Description is too long')
        .optional(),
    memberIds: z
        .array(z.string().uuid('Invalid member ID format'))
        .optional()
        .default([]),
});
export const updateGroupSchema = z.object({
    name: z
        .string()
        .min(1, 'Group name cannot be empty')
        .max(255, 'Group name is too long')
        .trim()
        .optional(),
    description: z
        .string()
        .max(500, 'Description is too long')
        .optional(),
    memberIds: z
        .array(z.string().uuid('Invalid member ID format'))
        .optional(),
});
/**
 * Member Validation Schemas
 */
export const createMemberSchema = z.object({
    firstName: z
        .string()
        .min(1, 'First name cannot be empty')
        .max(100, 'First name is too long')
        .trim(),
    lastName: z
        .string()
        .min(1, 'Last name cannot be empty')
        .max(100, 'Last name is too long')
        .trim(),
    phone: z
        .string()
        .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format. Use E.164 format.')
        .trim(),
    email: z
        .string()
        .email('Invalid email format')
        .toLowerCase()
        .trim()
        .optional(),
    groupIds: z
        .array(z.string().uuid('Invalid group ID format'))
        .optional()
        .default([]),
});
export const updateMemberSchema = z.object({
    firstName: z
        .string()
        .min(1, 'First name cannot be empty')
        .max(100, 'First name is too long')
        .trim()
        .optional(),
    lastName: z
        .string()
        .min(1, 'Last name cannot be empty')
        .max(100, 'Last name is too long')
        .trim()
        .optional(),
    phone: z
        .string()
        .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format. Use E.164 format.')
        .trim()
        .optional(),
    email: z
        .string()
        .email('Invalid email format')
        .toLowerCase()
        .trim()
        .optional(),
    groupIds: z
        .array(z.string().uuid('Invalid group ID format'))
        .optional(),
});
/**
 * Conversation Validation Schemas
 */
export const createConversationSchema = z.object({
    groupId: z.string().uuid('Invalid group ID format'),
    template: z
        .enum(['broadcast', 'survey', 'rsvp'], {
        errorMap: () => ({ message: 'Invalid conversation template type' }),
    })
        .optional(),
});
/**
 * Billing/Subscription Validation Schemas
 */
export const updateBillingSchema = z.object({
    stripePaymentMethodId: z
        .string()
        .startsWith('pm_', 'Invalid payment method ID format'),
    billingName: z
        .string()
        .min(1, 'Billing name cannot be empty')
        .max(255, 'Billing name is too long')
        .trim()
        .optional(),
    billingEmail: z
        .string()
        .email('Invalid email format')
        .toLowerCase()
        .trim()
        .optional(),
});
/**
 * Validation helper function
 * Validates request body against a schema and throws ZodError if invalid
 */
export function validateRequest(schema, data) {
    return schema.parse(data);
}
/**
 * Safe validation helper
 * Returns result with either parsed data or error details
 */
export function safeValidate(schema, data) {
    const result = schema.safeParse(data);
    if (result.success) {
        return { success: true, data: result.data };
    }
    const errors = {};
    result.error.errors.forEach((error) => {
        const path = error.path.join('.');
        if (!errors[path]) {
            errors[path] = [];
        }
        errors[path].push(error.message);
    });
    return { success: false, errors };
}
//# sourceMappingURL=schemas.js.map