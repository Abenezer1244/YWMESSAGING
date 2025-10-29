export interface EmailOptions {
    to: string;
    subject: string;
    templateId?: string;
    dynamicTemplateData?: Record<string, any>;
    text?: string;
    html?: string;
}
/**
 * Send email via SendGrid
 */
export declare function sendEmail(options: EmailOptions): Promise<void>;
/**
 * Email Templates - IDs should be stored in environment or database
 */
export declare const emailTemplates: {
    WELCOME: string;
    PASSWORD_RESET: string;
    INVITE_ADMIN: string;
    SUBSCRIPTION_CONFIRM: string;
};
/**
 * Send welcome email
 */
export declare function sendWelcomeEmail(email: string, churchName: string, adminName: string): Promise<void>;
/**
 * Send password reset email
 */
export declare function sendPasswordResetEmail(email: string, resetLink: string, expiryMinutes?: number): Promise<void>;
/**
 * Send co-admin invitation email
 */
export declare function sendAdminInviteEmail(email: string, churchName: string, inviteLink: string, inviterName: string): Promise<void>;
/**
 * Send subscription confirmation email
 */
export declare function sendSubscriptionConfirmEmail(email: string, plan: string, amount: number, frequency?: string): Promise<void>;
//# sourceMappingURL=sendgrid.service.d.ts.map