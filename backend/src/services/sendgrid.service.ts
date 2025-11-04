import sgMail from '@sendgrid/mail';

const sendGridApiKey = process.env.SENDGRID_API_KEY;
if (!sendGridApiKey) {
  console.warn('⚠️  SENDGRID_API_KEY not configured - email service disabled');
} else {
  sgMail.setApiKey(sendGridApiKey);
}

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
export async function sendEmail(options: EmailOptions): Promise<void> {
  if (!sendGridApiKey) {
    console.warn('⚠️  SendGrid not configured, skipping email');
    return;
  }

  try {
    const msg: any = {
      to: options.to,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@connect-yw.com',
      subject: options.subject,
      ...(options.templateId && {
        templateId: options.templateId,
        dynamicTemplateData: options.dynamicTemplateData,
      }),
      ...(options.html && { html: options.html }),
      ...(options.text && { text: options.text }),
    };

    await sgMail.send(msg);
    console.log(`✅ Email sent to ${options.to}`);
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    throw error;
  }
}

/**
 * Email Templates - IDs should be stored in environment or database
 */
export const emailTemplates = {
  // Template IDs from SendGrid
  WELCOME: process.env.SENDGRID_TEMPLATE_WELCOME || 'd-welcome',
  PASSWORD_RESET: process.env.SENDGRID_TEMPLATE_PASSWORD_RESET || 'd-password-reset',
  INVITE_ADMIN: process.env.SENDGRID_TEMPLATE_INVITE_ADMIN || 'd-invite-admin',
  SUBSCRIPTION_CONFIRM: process.env.SENDGRID_TEMPLATE_SUBSCRIPTION || 'd-subscription',
};

/**
 * Send welcome email
 */
export async function sendWelcomeEmail(
  email: string,
  churchName: string,
  adminName: string
): Promise<void> {
  await sendEmail({
    to: email,
    subject: `Welcome to Koinonia YW - ${churchName}`,
    templateId: emailTemplates.WELCOME,
    dynamicTemplateData: {
      church_name: churchName,
      admin_name: adminName,
    },
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  resetLink: string,
  expiryMinutes: number = 30
): Promise<void> {
  await sendEmail({
    to: email,
    subject: 'Reset Your Koinonia YW Password',
    templateId: emailTemplates.PASSWORD_RESET,
    dynamicTemplateData: {
      reset_link: resetLink,
      expiry_minutes: expiryMinutes,
    },
  });
}

/**
 * Send co-admin invitation email
 */
export async function sendAdminInviteEmail(
  email: string,
  churchName: string,
  inviteLink: string,
  inviterName: string
): Promise<void> {
  await sendEmail({
    to: email,
    subject: `Join ${churchName} on Koinonia YW`,
    templateId: emailTemplates.INVITE_ADMIN,
    dynamicTemplateData: {
      church_name: churchName,
      invite_link: inviteLink,
      inviter_name: inviterName,
    },
  });
}

/**
 * Send subscription confirmation email
 */
export async function sendSubscriptionConfirmEmail(
  email: string,
  plan: string,
  amount: number,
  frequency: string = 'monthly'
): Promise<void> {
  await sendEmail({
    to: email,
    subject: `Subscription Confirmed - Koinonia YW ${plan.toUpperCase()} Plan`,
    templateId: emailTemplates.SUBSCRIPTION_CONFIRM,
    dynamicTemplateData: {
      plan_name: plan.toUpperCase(),
      amount: `$${(amount / 100).toFixed(2)}`,
      frequency,
    },
  });
}
