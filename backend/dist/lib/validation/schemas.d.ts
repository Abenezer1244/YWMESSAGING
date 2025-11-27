import { z } from 'zod';
/**
 * Auth Validation Schemas
 * Used for request body validation in authentication endpoints
 */
export declare const registerSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    churchName: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    churchName: string;
}, {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    churchName: string;
}>;
export type RegisterRequest = z.infer<typeof registerSchema>;
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
export type LoginRequest = z.infer<typeof loginSchema>;
export declare const completeWelcomeSchema: z.ZodObject<{
    userRole: z.ZodEnum<["pastor", "admin", "communications", "volunteer", "other"]>;
}, "strip", z.ZodTypeAny, {
    userRole: "admin" | "pastor" | "communications" | "volunteer" | "other";
}, {
    userRole: "admin" | "pastor" | "communications" | "volunteer" | "other";
}>;
export type CompleteWelcomeRequest = z.infer<typeof completeWelcomeSchema>;
/**
 * Message Validation Schemas
 */
export declare const sendMessageSchema: z.ZodObject<{
    content: z.ZodString;
    targetType: z.ZodEnum<["group", "member", "segment"]>;
    targetIds: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
}, "strip", z.ZodTypeAny, {
    content: string;
    targetType: "group" | "member" | "segment";
    targetIds: string[];
}, {
    content: string;
    targetType: "group" | "member" | "segment";
    targetIds?: string[] | undefined;
}>;
export type SendMessageRequest = z.infer<typeof sendMessageSchema>;
export declare const getMessageHistorySchema: z.ZodObject<{
    page: z.ZodEffects<z.ZodDefault<z.ZodOptional<z.ZodString>>, number, string | undefined>;
    limit: z.ZodEffects<z.ZodDefault<z.ZodOptional<z.ZodString>>, number, string | undefined>;
    status: z.ZodOptional<z.ZodEnum<["pending", "delivered", "failed"]>>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
    status?: "pending" | "delivered" | "failed" | undefined;
}, {
    limit?: string | undefined;
    status?: "pending" | "delivered" | "failed" | undefined;
    page?: string | undefined;
}>;
export type GetMessageHistoryRequest = z.infer<typeof getMessageHistorySchema>;
/**
 * Group Validation Schemas
 */
export declare const createGroupSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    memberIds: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    memberIds: string[];
    description?: string | undefined;
}, {
    name: string;
    description?: string | undefined;
    memberIds?: string[] | undefined;
}>;
export type CreateGroupRequest = z.infer<typeof createGroupSchema>;
export declare const updateGroupSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    memberIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    description?: string | undefined;
    memberIds?: string[] | undefined;
}, {
    name?: string | undefined;
    description?: string | undefined;
    memberIds?: string[] | undefined;
}>;
export type UpdateGroupRequest = z.infer<typeof updateGroupSchema>;
/**
 * Member Validation Schemas
 */
export declare const createMemberSchema: z.ZodObject<{
    firstName: z.ZodString;
    lastName: z.ZodString;
    phone: z.ZodString;
    email: z.ZodOptional<z.ZodString>;
    groupIds: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
}, "strip", z.ZodTypeAny, {
    firstName: string;
    lastName: string;
    phone: string;
    groupIds: string[];
    email?: string | undefined;
}, {
    firstName: string;
    lastName: string;
    phone: string;
    email?: string | undefined;
    groupIds?: string[] | undefined;
}>;
export type CreateMemberRequest = z.infer<typeof createMemberSchema>;
export declare const updateMemberSchema: z.ZodObject<{
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    groupIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    email?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    phone?: string | undefined;
    groupIds?: string[] | undefined;
}, {
    email?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    phone?: string | undefined;
    groupIds?: string[] | undefined;
}>;
export type UpdateMemberRequest = z.infer<typeof updateMemberSchema>;
/**
 * Conversation Validation Schemas
 */
export declare const createConversationSchema: z.ZodObject<{
    groupId: z.ZodString;
    template: z.ZodOptional<z.ZodEnum<["broadcast", "survey", "rsvp"]>>;
}, "strip", z.ZodTypeAny, {
    groupId: string;
    template?: "broadcast" | "survey" | "rsvp" | undefined;
}, {
    groupId: string;
    template?: "broadcast" | "survey" | "rsvp" | undefined;
}>;
export type CreateConversationRequest = z.infer<typeof createConversationSchema>;
/**
 * Billing/Subscription Validation Schemas
 */
export declare const updateBillingSchema: z.ZodObject<{
    stripePaymentMethodId: z.ZodString;
    billingName: z.ZodOptional<z.ZodString>;
    billingEmail: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    stripePaymentMethodId: string;
    billingName?: string | undefined;
    billingEmail?: string | undefined;
}, {
    stripePaymentMethodId: string;
    billingName?: string | undefined;
    billingEmail?: string | undefined;
}>;
export type UpdateBillingRequest = z.infer<typeof updateBillingSchema>;
/**
 * Validation helper function
 * Validates request body against a schema and throws ZodError if invalid
 */
export declare function validateRequest<T>(schema: z.ZodSchema, data: any): T;
/**
 * Safe validation helper
 * Returns result with either parsed data or error details
 */
export declare function safeValidate<T>(schema: z.ZodSchema, data: any): {
    success: true;
    data: T;
} | {
    success: false;
    errors: Record<string, string[]>;
};
//# sourceMappingURL=schemas.d.ts.map