import { z } from 'zod';
/**
 * Comprehensive Input Validation Schemas
 *
 * All user input is validated through these schemas BEFORE processing.
 * This prevents injection attacks, data corruption, and unexpected errors.
 */
// ============================================
// AUTH SCHEMAS
// ============================================
export const RegisterSchema = z.object({
    email: z.string()
        .email('Invalid email address')
        .max(255, 'Email too long')
        .toLowerCase(),
    password: z.string()
        .min(12, 'Password must be at least 12 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[!@#$%^&*]/, 'Password must contain at least one special character (!@#$%^&*)'),
    churchName: z.string()
        .min(1, 'Church name is required')
        .max(255, 'Church name is too long')
        .trim(),
    churchPhone: z.string()
        .regex(/^\+?1?\d{9,15}$/, 'Invalid phone number format')
        .optional(),
});
export const LoginSchema = z.object({
    email: z.string()
        .email('Invalid email address')
        .toLowerCase(),
    password: z.string()
        .min(1, 'Password is required'),
});
export const PasswordResetSchema = z.object({
    email: z.string()
        .email('Invalid email address')
        .toLowerCase(),
});
export const NewPasswordSchema = z.object({
    token: z.string()
        .min(1, 'Reset token is required'),
    password: z.string()
        .min(12, 'Password must be at least 12 characters')
        .regex(/[A-Z]/, 'Password must contain uppercase letter')
        .regex(/[0-9]/, 'Password must contain number'),
});
// ============================================
// MESSAGE SCHEMAS
// ============================================
export const SendMessageSchema = z.object({
    content: z.string()
        .min(1, 'Message content is required')
        .max(160, 'Message is too long (max 160 characters)')
        .trim(),
    recipientIds: z.array(z.string().uuid('Invalid recipient ID')).min(1, 'At least one recipient is required'),
    scheduleTime: z.string()
        .datetime('Invalid schedule time format')
        .optional(),
    groupId: z.string()
        .uuid('Invalid group ID')
        .optional(),
});
export const MessageFilterSchema = z.object({
    status: z.enum(['draft', 'scheduled', 'sending', 'sent', 'failed']).optional(),
    groupId: z.string().uuid('Invalid group ID').optional(),
    dateFrom: z.string().datetime('Invalid date format').optional(),
    dateTo: z.string().datetime('Invalid date format').optional(),
    limit: z.number().int().min(1).max(100).default(20),
    offset: z.number().int().min(0).default(0),
});
// ============================================
// CONTACT SCHEMAS
// ============================================
export const CreateContactSchema = z.object({
    firstName: z.string()
        .min(1, 'First name is required')
        .max(100, 'First name is too long')
        .trim(),
    lastName: z.string()
        .min(1, 'Last name is required')
        .max(100, 'Last name is too long')
        .trim(),
    phone: z.string()
        .regex(/^\+?1?\d{9,15}$/, 'Invalid phone number format')
        .trim(),
    email: z.string()
        .email('Invalid email address')
        .optional(),
    groupIds: z.array(z.string().uuid()).optional(),
});
export const UpdateContactSchema = CreateContactSchema.partial();
// ============================================
// GROUP SCHEMAS
// ============================================
export const CreateGroupSchema = z.object({
    name: z.string()
        .min(1, 'Group name is required')
        .max(255, 'Group name is too long')
        .trim(),
    description: z.string()
        .max(1000, 'Description is too long')
        .optional(),
    color: z.string()
        .regex(/^#[0-9A-F]{6}$/i, 'Invalid color format (use hex: #RRGGBB)')
        .optional(),
});
export const UpdateGroupSchema = CreateGroupSchema.partial();
// ============================================
// BILLING SCHEMAS
// ============================================
export const SubscribeSchema = z.object({
    planId: z.enum(['starter', 'professional', 'enterprise']),
    stripeToken: z.string()
        .min(1, 'Payment token is required'),
    billingEmail: z.string()
        .email('Invalid email')
        .optional(),
});
export const UpdateBillingSchema = z.object({
    billingEmail: z.string()
        .email('Invalid email')
        .optional(),
    billingName: z.string()
        .max(255)
        .optional(),
});
export function formatValidationErrors(error) {
    return error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code,
    }));
}
// ============================================
// LOWERCASE ALIASES (for backward compatibility)
// ============================================
export const registerSchema = RegisterSchema;
export const loginSchema = LoginSchema;
export const passwordResetSchema = PasswordResetSchema;
export const newPasswordSchema = NewPasswordSchema;
export const sendMessageSchema = SendMessageSchema;
export const messageFilterSchema = MessageFilterSchema;
export const createContactSchema = CreateContactSchema;
export const updateContactSchema = UpdateContactSchema;
export const createGroupSchema = CreateGroupSchema;
export const updateGroupSchema = UpdateGroupSchema;
export const subscribeSchema = SubscribeSchema;
export const updateBillingSchema = UpdateBillingSchema;
/**
 * Safe validation wrapper for existing code
 * Returns { success: boolean, data?: T, errors?: ZodError[] }
 */
export function safeValidate(schema, data) {
    try {
        const validated = schema.parse(data);
        return { success: true, data: validated };
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return {
                success: false,
                errors: formatValidationErrors(error),
            };
        }
        return {
            success: false,
            errors: [{ message: 'Validation error' }],
        };
    }
}
// Additional schemas needed by existing controllers
export const completeWelcomeSchema = z.object({
    firstName: z.string().min(1).max(100),
    lastName: z.string().min(1).max(100),
});
export const getMessageHistorySchema = z.object({
    status: z.enum(['draft', 'scheduled', 'sending', 'sent', 'failed']).optional(),
    groupId: z.string().uuid().optional(),
    dateFrom: z.string().datetime().optional(),
    dateTo: z.string().datetime().optional(),
    limit: z.number().int().min(1).max(100).default(20),
    offset: z.number().int().min(0).default(0),
});
//# sourceMappingURL=schemas.js.map