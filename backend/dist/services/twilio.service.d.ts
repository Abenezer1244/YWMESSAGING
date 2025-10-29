/**
 * Send SMS via Twilio
 */
export declare function sendSMS(to: string, message: string, churchId: string): Promise<{
    messageSid: string;
    success: boolean;
}>;
/**
 * Validate Twilio credentials
 */
export declare function validateTwilioCredentials(accountSid: string, authToken: string, phoneNumber: string): Promise<boolean>;
//# sourceMappingURL=twilio.service.d.ts.map