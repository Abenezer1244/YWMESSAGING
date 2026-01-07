import { z, ZodSchema } from 'zod';
/**
 * Comprehensive Input Validation Schemas
 *
 * All user input is validated through these schemas BEFORE processing.
 * This prevents injection attacks, data corruption, and unexpected errors.
 */
export declare const RegisterSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    churchName: z.ZodString;
    churchPhone: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    churchName: string;
    firstName: string;
    lastName: string;
    churchPhone?: string | undefined;
}, {
    email: string;
    password: string;
    churchName: string;
    firstName: string;
    lastName: string;
    churchPhone?: string | undefined;
}>;
export declare const LoginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const PasswordResetSchema: z.ZodObject<{
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
}, {
    email: string;
}>;
export declare const NewPasswordSchema: z.ZodObject<{
    token: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    password: string;
    token: string;
}, {
    password: string;
    token: string;
}>;
export declare const SendMessageSchema: z.ZodObject<{
    content: z.ZodString;
    recipientIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    targetType: z.ZodOptional<z.ZodEnum<["individual", "all"]>>;
    targetIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    scheduleTime: z.ZodOptional<z.ZodString>;
    richCard: z.ZodOptional<z.ZodObject<{
        title: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        imageUrl: z.ZodOptional<z.ZodString>;
        rsvpUrl: z.ZodOptional<z.ZodString>;
        websiteUrl: z.ZodOptional<z.ZodString>;
        phoneNumber: z.ZodOptional<z.ZodString>;
        location: z.ZodOptional<z.ZodObject<{
            latitude: z.ZodNumber;
            longitude: z.ZodNumber;
            label: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            latitude: number;
            longitude: number;
            label: string;
        }, {
            latitude: number;
            longitude: number;
            label: string;
        }>>;
        quickReplies: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        title: string;
        description?: string | undefined;
        phoneNumber?: string | undefined;
        imageUrl?: string | undefined;
        rsvpUrl?: string | undefined;
        websiteUrl?: string | undefined;
        location?: {
            latitude: number;
            longitude: number;
            label: string;
        } | undefined;
        quickReplies?: string[] | undefined;
    }, {
        title: string;
        description?: string | undefined;
        phoneNumber?: string | undefined;
        imageUrl?: string | undefined;
        rsvpUrl?: string | undefined;
        websiteUrl?: string | undefined;
        location?: {
            latitude: number;
            longitude: number;
            label: string;
        } | undefined;
        quickReplies?: string[] | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    content: string;
    recipientIds?: string[] | undefined;
    targetType?: "individual" | "all" | undefined;
    targetIds?: string[] | undefined;
    scheduleTime?: string | undefined;
    richCard?: {
        title: string;
        description?: string | undefined;
        phoneNumber?: string | undefined;
        imageUrl?: string | undefined;
        rsvpUrl?: string | undefined;
        websiteUrl?: string | undefined;
        location?: {
            latitude: number;
            longitude: number;
            label: string;
        } | undefined;
        quickReplies?: string[] | undefined;
    } | undefined;
}, {
    content: string;
    recipientIds?: string[] | undefined;
    targetType?: "individual" | "all" | undefined;
    targetIds?: string[] | undefined;
    scheduleTime?: string | undefined;
    richCard?: {
        title: string;
        description?: string | undefined;
        phoneNumber?: string | undefined;
        imageUrl?: string | undefined;
        rsvpUrl?: string | undefined;
        websiteUrl?: string | undefined;
        location?: {
            latitude: number;
            longitude: number;
            label: string;
        } | undefined;
        quickReplies?: string[] | undefined;
    } | undefined;
}>;
export declare const MessageFilterSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<["draft", "scheduled", "sending", "sent", "failed"]>>;
    dateFrom: z.ZodOptional<z.ZodString>;
    dateTo: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    offset: number;
    status?: "draft" | "scheduled" | "sending" | "sent" | "failed" | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
}, {
    limit?: number | undefined;
    status?: "draft" | "scheduled" | "sending" | "sent" | "failed" | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    offset?: number | undefined;
}>;
export declare const CreateContactSchema: z.ZodObject<{
    firstName: z.ZodString;
    lastName: z.ZodString;
    phone: z.ZodString;
    email: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    firstName: string;
    lastName: string;
    phone: string;
    email?: string | undefined;
}, {
    firstName: string;
    lastName: string;
    phone: string;
    email?: string | undefined;
}>;
export declare const UpdateContactSchema: z.ZodObject<{
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    email?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    phone?: string | undefined;
}, {
    email?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    phone?: string | undefined;
}>;
export declare const SubscribeSchema: z.ZodObject<{
    planId: z.ZodEnum<["starter", "professional", "enterprise"]>;
    stripeToken: z.ZodString;
    billingEmail: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    planId: "starter" | "professional" | "enterprise";
    stripeToken: string;
    billingEmail?: string | undefined;
}, {
    planId: "starter" | "professional" | "enterprise";
    stripeToken: string;
    billingEmail?: string | undefined;
}>;
export declare const UpdateBillingSchema: z.ZodObject<{
    billingEmail: z.ZodOptional<z.ZodString>;
    billingName: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    billingEmail?: string | undefined;
    billingName?: string | undefined;
}, {
    billingEmail?: string | undefined;
    billingName?: string | undefined;
}>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type SendMessageInput = z.infer<typeof SendMessageSchema>;
export type CreateContactInput = z.infer<typeof CreateContactSchema>;
export type SubscribeInput = z.infer<typeof SubscribeSchema>;
export declare function formatValidationErrors(error: z.ZodError): {
    field: string;
    message: string;
    code: "custom" | "unrecognized_keys" | "invalid_union" | "invalid_union_discriminator" | "invalid_arguments" | "invalid_return_type" | "invalid_string" | "not_multiple_of" | "invalid_literal" | "invalid_type" | "invalid_enum_value" | "invalid_intersection_types" | "invalid_date" | "not_finite" | "too_big" | "too_small";
}[];
export declare const registerSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    churchName: z.ZodString;
    churchPhone: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    churchName: string;
    firstName: string;
    lastName: string;
    churchPhone?: string | undefined;
}, {
    email: string;
    password: string;
    churchName: string;
    firstName: string;
    lastName: string;
    churchPhone?: string | undefined;
}>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const passwordResetSchema: z.ZodObject<{
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
}, {
    email: string;
}>;
export declare const newPasswordSchema: z.ZodObject<{
    token: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    password: string;
    token: string;
}, {
    password: string;
    token: string;
}>;
export declare const sendMessageSchema: z.ZodObject<{
    content: z.ZodString;
    recipientIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    targetType: z.ZodOptional<z.ZodEnum<["individual", "all"]>>;
    targetIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    scheduleTime: z.ZodOptional<z.ZodString>;
    richCard: z.ZodOptional<z.ZodObject<{
        title: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        imageUrl: z.ZodOptional<z.ZodString>;
        rsvpUrl: z.ZodOptional<z.ZodString>;
        websiteUrl: z.ZodOptional<z.ZodString>;
        phoneNumber: z.ZodOptional<z.ZodString>;
        location: z.ZodOptional<z.ZodObject<{
            latitude: z.ZodNumber;
            longitude: z.ZodNumber;
            label: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            latitude: number;
            longitude: number;
            label: string;
        }, {
            latitude: number;
            longitude: number;
            label: string;
        }>>;
        quickReplies: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        title: string;
        description?: string | undefined;
        phoneNumber?: string | undefined;
        imageUrl?: string | undefined;
        rsvpUrl?: string | undefined;
        websiteUrl?: string | undefined;
        location?: {
            latitude: number;
            longitude: number;
            label: string;
        } | undefined;
        quickReplies?: string[] | undefined;
    }, {
        title: string;
        description?: string | undefined;
        phoneNumber?: string | undefined;
        imageUrl?: string | undefined;
        rsvpUrl?: string | undefined;
        websiteUrl?: string | undefined;
        location?: {
            latitude: number;
            longitude: number;
            label: string;
        } | undefined;
        quickReplies?: string[] | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    content: string;
    recipientIds?: string[] | undefined;
    targetType?: "individual" | "all" | undefined;
    targetIds?: string[] | undefined;
    scheduleTime?: string | undefined;
    richCard?: {
        title: string;
        description?: string | undefined;
        phoneNumber?: string | undefined;
        imageUrl?: string | undefined;
        rsvpUrl?: string | undefined;
        websiteUrl?: string | undefined;
        location?: {
            latitude: number;
            longitude: number;
            label: string;
        } | undefined;
        quickReplies?: string[] | undefined;
    } | undefined;
}, {
    content: string;
    recipientIds?: string[] | undefined;
    targetType?: "individual" | "all" | undefined;
    targetIds?: string[] | undefined;
    scheduleTime?: string | undefined;
    richCard?: {
        title: string;
        description?: string | undefined;
        phoneNumber?: string | undefined;
        imageUrl?: string | undefined;
        rsvpUrl?: string | undefined;
        websiteUrl?: string | undefined;
        location?: {
            latitude: number;
            longitude: number;
            label: string;
        } | undefined;
        quickReplies?: string[] | undefined;
    } | undefined;
}>;
export declare const messageFilterSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<["draft", "scheduled", "sending", "sent", "failed"]>>;
    dateFrom: z.ZodOptional<z.ZodString>;
    dateTo: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    offset: number;
    status?: "draft" | "scheduled" | "sending" | "sent" | "failed" | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
}, {
    limit?: number | undefined;
    status?: "draft" | "scheduled" | "sending" | "sent" | "failed" | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    offset?: number | undefined;
}>;
export declare const createContactSchema: z.ZodObject<{
    firstName: z.ZodString;
    lastName: z.ZodString;
    phone: z.ZodString;
    email: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    firstName: string;
    lastName: string;
    phone: string;
    email?: string | undefined;
}, {
    firstName: string;
    lastName: string;
    phone: string;
    email?: string | undefined;
}>;
export declare const updateContactSchema: z.ZodObject<{
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    email?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    phone?: string | undefined;
}, {
    email?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    phone?: string | undefined;
}>;
export declare const subscribeSchema: z.ZodObject<{
    planId: z.ZodEnum<["starter", "professional", "enterprise"]>;
    stripeToken: z.ZodString;
    billingEmail: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    planId: "starter" | "professional" | "enterprise";
    stripeToken: string;
    billingEmail?: string | undefined;
}, {
    planId: "starter" | "professional" | "enterprise";
    stripeToken: string;
    billingEmail?: string | undefined;
}>;
export declare const updateBillingSchema: z.ZodObject<{
    billingEmail: z.ZodOptional<z.ZodString>;
    billingName: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    billingEmail?: string | undefined;
    billingName?: string | undefined;
}, {
    billingEmail?: string | undefined;
    billingName?: string | undefined;
}>;
/**
 * Safe validation wrapper for existing code
 * Returns { success: boolean, data?: T, errors?: ZodError[] }
 */
export declare function safeValidate<T>(schema: ZodSchema, data: unknown): {
    success: boolean;
    data?: T;
    errors?: any[];
};
export declare const GetConversationsSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodPipeline<z.ZodEffects<z.ZodString, number, string>, z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodPipeline<z.ZodEffects<z.ZodString, number, string>, z.ZodNumber>>;
    status: z.ZodOptional<z.ZodEnum<["open", "closed", "archived"]>>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
    status?: "archived" | "open" | "closed" | undefined;
}, {
    limit?: string | undefined;
    status?: "archived" | "open" | "closed" | undefined;
    page?: string | undefined;
}>;
export declare const ReplyToConversationSchema: z.ZodObject<{
    content: z.ZodString;
    replyToId: z.ZodOptional<z.ZodString>;
    sendEffect: z.ZodOptional<z.ZodEnum<["slam", "loud", "gentle", "invisibleInk", "none"]>>;
}, "strip", z.ZodTypeAny, {
    content: string;
    replyToId?: string | undefined;
    sendEffect?: "none" | "slam" | "loud" | "gentle" | "invisibleInk" | undefined;
}, {
    content: string;
    replyToId?: string | undefined;
    sendEffect?: "none" | "slam" | "loud" | "gentle" | "invisibleInk" | undefined;
}>;
export declare const ReplyWithMediaSchema: z.ZodObject<{
    content: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    content?: string | undefined;
}, {
    content?: string | undefined;
}>;
export declare const UpdateConversationStatusSchema: z.ZodObject<{
    status: z.ZodEnum<["open", "closed", "archived"]>;
}, "strip", z.ZodTypeAny, {
    status: "archived" | "open" | "closed";
}, {
    status: "archived" | "open" | "closed";
}>;
export declare const ConversationParamSchema: z.ZodObject<{
    conversationId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    conversationId: string;
}, {
    conversationId: string;
}>;
export declare const completeWelcomeSchema: z.ZodObject<{
    userRole: z.ZodString;
}, "strip", z.ZodTypeAny, {
    userRole: string;
}, {
    userRole: string;
}>;
export declare const getMessageHistorySchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<["draft", "scheduled", "sending", "sent", "failed"]>>;
    dateFrom: z.ZodOptional<z.ZodString>;
    dateTo: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    offset: number;
    status?: "draft" | "scheduled" | "sending" | "sent" | "failed" | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
}, {
    limit?: number | undefined;
    status?: "draft" | "scheduled" | "sending" | "sent" | "failed" | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    offset?: number | undefined;
}>;
export declare const MFAInitiateSchema: z.ZodObject<{
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
}, {
    email: string;
}>;
export declare const MFAVerifySchema: z.ZodObject<{
    secret: z.ZodString;
    code: z.ZodString;
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    code: string;
    secret: string;
}, {
    email: string;
    code: string;
    secret: string;
}>;
export declare const MFADisableSchema: z.ZodObject<{
    code: z.ZodString;
}, "strip", z.ZodTypeAny, {
    code: string;
}, {
    code: string;
}>;
export declare const RecoveryCodeVerifySchema: z.ZodObject<{
    code: z.ZodString;
}, "strip", z.ZodTypeAny, {
    code: string;
}, {
    code: string;
}>;
export declare const RegenerateRecoveryCodesSchema: z.ZodObject<{
    code: z.ZodString;
}, "strip", z.ZodTypeAny, {
    code: string;
}, {
    code: string;
}>;
//# sourceMappingURL=schemas.d.ts.map