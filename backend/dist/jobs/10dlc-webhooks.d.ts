/**
 * Handle webhook events from Telnyx for 10DLC brand/campaign status updates
 * These webhooks are triggered automatically when approval status changes
 */
export declare function handleTelnyx10DLCWebhook(payload: any): Promise<void>;
/**
 * Send a notification to the church (email, in-app, etc.)
 * when their 10DLC status changes
 */
declare function notifyChurch(churchId: string, message: string, status: string): Promise<void>;
export { notifyChurch };
//# sourceMappingURL=10dlc-webhooks.d.ts.map