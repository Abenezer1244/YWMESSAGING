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
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
    firstName: z.string()
        .min(1, 'First name is required')
        .max(100, 'First name is too long')
        .trim(),
    lastName: z.string()
        .min(1, 'Last name is required')
        .max(100, 'Last name is too long')
        .trim(),
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
    // Support both recipientIds (original) and targetType/targetIds (current)
    recipientIds: z.array(z.string().uuid('Invalid recipient ID')).optional(),
    targetType: z.enum(['individual', 'all']).optional(),
    targetIds: z.array(z.string().uuid()).optional(),
    scheduleTime: z.string()
        .datetime('Invalid schedule time format')
        .optional(),
    // RCS Rich Card data (optional) - for iMessage-style messaging
    richCard: z.object({
        title: z.string().min(1).max(200),
        description: z.string().max(2000).optional(),
        imageUrl: z.string().url().optional(),
        rsvpUrl: z.string().url().optional(),
        websiteUrl: z.string().url().optional(),
        phoneNumber: z.string().optional(),
        location: z.object({
            latitude: z.number(),
            longitude: z.number(),
            label: z.string(),
        }).optional(),
        quickReplies: z.array(z.string().max(50)).max(5).optional(),
    }).optional(),
});
export const MessageFilterSchema = z.object({
    status: z.enum(['draft', 'scheduled', 'sending', 'sent', 'failed']).optional(),
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
});
export const UpdateContactSchema = CreateContactSchema.partial();
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
// ============================================
// CONVERSATION SCHEMAS
// ============================================
export const GetConversationsSchema = z.object({
    page: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().min(1)).default('1'),
    limit: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().min(1).max(100)).default('20'),
    status: z.enum(['open', 'closed', 'archived']).optional(),
});
export const ReplyToConversationSchema = z.object({
    content: z.string()
        .min(1, 'Message content is required')
        .max(160, 'Message is too long (max 160 characters)')
        .trim(),
    // iMessage-style features
    replyToId: z.string().optional(),
    sendEffect: z.enum(['slam', 'loud', 'gentle', 'invisibleInk', 'none']).optional(),
});
export const ReplyWithMediaSchema = z.object({
    content: z.string()
        .max(160, 'Message is too long (max 160 characters)')
        .trim()
        .optional(),
});
export const UpdateConversationStatusSchema = z.object({
    status: z.enum(['open', 'closed', 'archived'], {
        errorMap: () => ({ message: 'Status must be one of: open, closed, archived' })
    }),
});
export const ConversationParamSchema = z.object({
    conversationId: z.string().uuid('Invalid conversation ID'),
});
// Complete welcome onboarding - user selects their role
export const completeWelcomeSchema = z.object({
    userRole: z.string().min(1).max(50), // pastor, admin, communications, volunteer, other, or skipped
});
export const getMessageHistorySchema = z.object({
    status: z.enum(['draft', 'scheduled', 'sending', 'sent', 'failed']).optional(),
    dateFrom: z.string().datetime().optional(),
    dateTo: z.string().datetime().optional(),
    limit: z.number().int().min(1).max(100).default(20),
    offset: z.number().int().min(0).default(0),
});
// ============================================
// MFA SCHEMAS (Multi-Factor Authentication)
// ============================================
export const MFAInitiateSchema = z.object({
    email: z.string()
        .email('Invalid email address')
        .max(255, 'Email too long'),
});
export const MFAVerifySchema = z.object({
    secret: z.string()
        .min(1, 'TOTP secret is required')
        .regex(/^[A-Z2-7]+$/, 'Invalid TOTP secret format'),
    code: z.string()
        .length(6, 'Verification code must be 6 digits')
        .regex(/^\d{6}$/, 'Verification code must contain only digits'),
    email: z.string()
        .email('Invalid email address'),
});
export const MFADisableSchema = z.object({
    code: z.string()
        .length(6, 'Verification code must be 6 digits')
        .regex(/^\d{6}$/, 'Verification code must contain only digits'),
});
export const RecoveryCodeVerifySchema = z.object({
    code: z.string()
        .min(8, 'Recovery code is invalid')
        .max(12, 'Recovery code is invalid')
        .regex(/^[A-Z0-9-]+$/, 'Recovery code format is invalid'),
});
export const RegenerateRecoveryCodesSchema = z.object({
    code: z.string()
        .length(6, 'Verification code must be 6 digits')
        .regex(/^\d{6}$/, 'Verification code must contain only digits'),
});
//# sourceMappingURL=schemas.js.map